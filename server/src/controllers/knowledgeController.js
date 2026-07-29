import store from '../services/store.js';

export async function listKnowledgeDocuments(req, res) {
  res.json(store.knowledge_documents);
}

export async function ingestKnowledgeDocument(req, res) {
  const { title, document_type, storage_path, content_text, asset_id } = req.body;
  if (!title || !content_text) {
    return res.status(400).json({ error: "Title and document content are required" });
  }

  const newDoc = {
    id: `doc-${Date.now()}`,
    organization_id: req.user.organization_id || 'org-10001-apex-manufacturing',
    asset_id: asset_id || null,
    title,
    document_type: document_type || 'manual',
    storage_path: storage_path || `/docs/${title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
    content_text,
    embedding: Array(768).fill(0.01),
    created_at: new Date().toISOString()
  };

  store.knowledge_documents.unshift(newDoc);
  res.status(201).json(newDoc);
}
