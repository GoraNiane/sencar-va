import { useState, useEffect } from 'react';
import { fetchLegalPage } from '../api.js';

export default function LegalPage({ page }) {
  const [data, setData] = useState({ title: '', content: '' });
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');

  useEffect(() => {
    fetchLegalPage(page)
      .then(setData)
      .catch(() => setData({ title: 'Page introuvable', content: '' }));
    setContent(data.content);
  }, [page]);

  const save = async () => {
    setSaving(true);
    try {
      const { updateLegalPage } = await import('../api.js');
      await updateLegalPage(page, content);
      setData({ ...data, content });
      setEditing(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="legal-page">
      <div className="wrap">
        <h1 className="display" style={{ fontSize: 32, marginBottom: 24 }}>{data.title}</h1>
        {editing ? (
          <>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--line)', fontFamily: 'Inter, sans-serif', fontSize: 14 }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="button" className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
              <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>Annuler</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: 'var(--steel)' }}>{data.content || 'Contenu à venir.'}</div>
            {token && <button type="button" className="btn-ghost" style={{ marginTop: 24 }} onClick={() => setEditing(true)}>Modifier</button>}
          </>
        )}
      </div>
    </div>
  );
}
