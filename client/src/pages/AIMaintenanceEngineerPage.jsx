import React, { useState, useEffect } from 'react';
import Navbar from '../components/shared/Navbar';
import Sidebar from '../components/shared/Sidebar';
import AIMaintenanceChatWindow from '../components/ai/AIMaintenanceChatWindow';
import { aiAPI } from '../services/api';

export default function AIMaintenanceEngineerPage() {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function initChat() {
      try {
        const res = await aiAPI.createChatSession({ title: 'Reliability Engineering RAG Assistant' });
        setSession(res.data);
      } catch (err) {
        console.warn("Error creating chat session:", err);
      }
    }
    initChat();
  }, []);

  const handleSendMessage = async (text) => {
    if (!session) return;
    setLoading(true);

    const userTempMsg = {
      id: `usr-temp-${Date.now()}`,
      role: 'user',
      content: text
    };
    setMessages(prev => [...prev, userTempMsg]);

    try {
      const res = await aiAPI.sendChatMessage(session.id, { content: text });
      setMessages(prev => [
        ...prev.filter(m => m.id !== userTempMsg.id),
        res.data.user_message,
        res.data.assistant_message
      ]);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-industrial-900 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6 max-w-7xl mx-auto">
          <AIMaintenanceChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={loading}
          />
        </main>
      </div>
    </div>
  );
}
