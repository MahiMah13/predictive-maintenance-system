import ai, { GEMINI_MODEL } from "./geminiClient.js";
import store from "./store.js";

const SYSTEM_INSTRUCTION = `You are an AI Industrial Reliability & Maintenance Engineer embedded in a manufacturing plant platform.
Your expertise is strictly in industrial machinery, predictive maintenance, OEM equipment manuals, telemetry diagnostics, and work orders.

Handling Guidelines:
1. If the user asks a technical or plant-related question (e.g. vibration, bearings, pumps, compressors, work orders, LOTO, oil analysis, predictive maintenance, asset health):
   - Answer technical troubleshooting steps grounded in the provided document context and asset history.
   - Include specific technical parameters (ISO 10816 limits, temperature limits, LOTO safety).
2. If the user asks an off-topic question unrelated to industrial equipment, maintenance, or reliability engineering (e.g. weather, recipes, sports, general entertainment):
   - Politely explain that you are an AI Industrial Reliability Engineer specialized in manufacturing equipment diagnostics, maintenance schedules, and OEM technical documentation.
   - Offer to help them troubleshoot plant machinery, analyze sensor telemetry, or query equipment manuals instead.`;

export async function askAIMaintenanceEngineer(question, assetId = null) {
  // Extract keywords (length > 3)
  const queryWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  // Match knowledge documents by relevance
  const matchingDocs = store.knowledge_documents.filter(d => {
    if (assetId && d.asset_id && d.asset_id !== assetId) return false;
    const text = (d.title + " " + d.content_text).toLowerCase();
    return queryWords.some(word => text.includes(word));
  });

  // Only attach retrieved sources if there is a real keyword match
  const retrievedSources = matchingDocs.slice(0, 3).map(d => ({
    title: d.title,
    document_type: d.document_type,
    storage_path: d.storage_path,
    snippet: d.content_text.substring(0, 200) + "..."
  }));

  const contextText = retrievedSources.length > 0
    ? retrievedSources.map(s => `[Document: ${s.title}]\n${s.snippet}`).join("\n\n")
    : "No specific OEM document matched.";

  let assetContext = "";
  if (assetId) {
    const asset = store.assets.find(a => a.id === assetId);
    const readings = store.sensor_readings.filter(r => r.asset_id === assetId);
    const failures = store.failure_events.filter(f => f.asset_id === assetId);
    assetContext = `Target Asset Context: ${JSON.stringify({ asset, recent_readings: readings, recent_failures: failures })}`;
  }

  const prompt = `
  SYSTEM INSTRUCTION: ${SYSTEM_INSTRUCTION}

  Context Documents:
  ${contextText}

  ${assetContext}

  User Question: ${question}
  `;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          temperature: 0.2
        }
      });
      return {
        answer: response.text,
        retrieved_sources: retrievedSources
      };
    } catch (err) {
      console.warn("RAG Gemini chat call failed, using fallback RAG answer:", err.message);
    }
  }

  // Greeting detection
  const greetingKeywords = ['hi', 'hello', 'hey', 'good morning', 'good evening', 'who are you', 'what is your name'];
  const isGreeting = greetingKeywords.some(kw => question.toLowerCase().includes(kw));
  if (isGreeting) {
    return {
      answer: "Hello! I'm your AI Maintenance Engineer, here to help you troubleshoot equipment, analyse telemetry, or look up OEM manuals. How can I assist you today?",
      retrieved_sources: []
    };
  }

  // Detect off-topic queries in fallback mode
  const offTopicKeywords = ['weather', 'climate', 'temperature outside', 'rain', 'forecast', 'recipe', 'game', 'sports', 'movie', 'news'];
  const isOffTopic = offTopicKeywords.some(kw => question.toLowerCase().includes(kw));

  if (isOffTopic) {
    return {
      answer: `I am an AI Industrial Maintenance & Reliability Engineer specialized in manufacturing equipment diagnostics, OEM technical manuals, and predictive maintenance.\n\nI don't have access to general weather forecasts or non-industrial topics, but I can help you analyze telemetry readings, troubleshoot asset failure modes, estimate RUL, or look up OEM maintenance specs for your plant equipment!`,
      retrieved_sources: []
    };
  }

  // Structured Fallback Answer for plant machinery queries
  let fallbackAnswer = `Based on plant knowledge documents and reliability standards:\n\n` +
    `1. **Diagnostic Evaluation**: The reported condition for ${assetId ? 'the selected asset' : 'the plant equipment'} indicates mechanical or operating strain. ` +
    `Check vibration spectra for 1X rotational unbalance and 2X alignment harmonics.\n` +
    `2. **Lube & Thermal Protocol**: Inspect bearing oil housing temperatures. Ensure ISO VG lubricant has not suffered thermal degradation or moisture contamination.\n` +
    `3. **Corrective Sequence**: Perform precision laser alignment, verify bolt torque settings, and replace degraded rolling element bearings if RMS vibration exceeds 4.5 mm/s.\n\n` +
    `*Always adhere to plant Lock-Out / Tag-Out (LOTO) safety protocols prior to disassembling machinery.*`;

  return {
    answer: fallbackAnswer,
    retrieved_sources: retrievedSources
  };
}
