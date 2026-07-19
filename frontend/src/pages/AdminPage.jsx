import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchVehicles, verifyAdminPassword, fetchAlerts, deleteAlert, fetchArticles, createArticle, updateArticle, deleteArticle, fetchPartners, createPartner, deletePartner, fetchQrCode, downloadPdf } from '../api.js';
import VehicleForm from '../components/VehicleForm.jsx';
import AdminVehicleList from '../components/AdminVehicleList.jsx';
import { PlusIcon, ShieldIcon, TrashIcon, EditIcon, DownloadIcon } from '../components/Icons.jsx';

export default function AdminPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [submittingAuth, setSubmittingAuth] = useState(false);

  const [activeTab, setActiveTab] = useState('vehicles');
  const [alerts, setAlerts] = useState([]);
  const [articles, setArticles] = useState([]);
  const [partners, setPartners] = useState([]);

  const [articleForm, setArticleForm] = useState({ title: '', excerpt: '', content: '' });
  const [editingArticle, setEditingArticle] = useState(null);
  const [partnerName, setPartnerName] = useState('');
  const [qrVehicleId, setQrVehicleId] = useState('');

  const loadAll = useCallback(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    Promise.all([
      fetchVehicles(),
      fetchAlerts(),
      fetchArticles(),
      fetchPartners()
    ]).then(([v, a, ar, p]) => {
      setVehicles(v);
      setAlerts(a);
      setArticles(ar);
      setPartners(p);
    }).finally(() => setLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    const savedPassword = localStorage.getItem('admin_password');
    if (savedPassword) {
      verifyAdminPassword(savedPassword)
        .then(() => setIsAuthenticated(true))
        .catch(() => { localStorage.removeItem('admin_password'); setIsAuthenticated(false); })
        .finally(() => setCheckingAuth(false));
    } else {
      setIsAuthenticated(false);
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadAll();
  }, [isAuthenticated, loadAll]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAuth(true);
    setAuthError('');
    try {
      await verifyAdminPassword(passwordInput);
      localStorage.setItem('admin_password', passwordInput);
      setIsAuthenticated(true);
    } catch (err) {
      setAuthError(err.message || 'Mot de passe incorrect.');
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_password');
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingVehicle(null);
    loadAll();
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingVehicle(null);
    setShowForm(true);
  };

  const handleDeleteAlert = async (id) => {
    await deleteAlert(id);
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleSaveArticle = async (e) => {
    e.preventDefault();
    if (editingArticle) {
      const updated = await updateArticle(editingArticle.id, articleForm);
      setArticles(prev => prev.map(a => a.id === updated.id ? updated : a));
      setEditingArticle(null);
    } else {
      const created = await createArticle(articleForm);
      setArticles(prev => [created, ...prev]);
    }
    setArticleForm({ title: '', excerpt: '', content: '' });
  };

  const handleDeleteArticle = async (id) => {
    await deleteArticle(id);
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  const handleAddPartner = async (e) => {
    e.preventDefault();
    const created = await createPartner({ name: partnerName });
    setPartners(prev => [...prev, created]);
    setPartnerName('');
  };

  const handleDeletePartner = async (id) => {
    await deletePartner(id);
    setPartners(prev => prev.filter(p => p.id !== id));
  };

  const handleGenerateQr = () => {
    if (!qrVehicleId) return;
    downloadPdf(qrVehicleId, `fiche-${qrVehicleId}.pdf`);
  };

  if (checkingAuth) {
    return (
      <div className="admin-auth-loader">
        <div className="loader-spinner"></div>
        <p>Vérification de la session en cours...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-login-layout">
        <div className="login-box animate-fade-in-up">
          <div className="login-header">
            <div className="login-shield-badge">
              <ShieldIcon width="32" height="32" />
            </div>
            <h2 className="display">Espace Admin</h2>
            <p>Saisissez le mot de passe administrateur pour accéder à la gestion du showroom.</p>
          </div>
          <form onSubmit={handleLoginSubmit}>
            <div className="field-group">
              <label htmlFor="adminPassword">Mot de passe</label>
              <input id="adminPassword" type="password" placeholder="••••••••" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
            </div>
            {authError && <p className="form-error auth-error-msg">{authError}</p>}
            <button type="submit" className="search-btn login-btn" disabled={submittingAuth}>
              {submittingAuth ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          <div className="login-footer">
            <Link to="/" className="btn-secondary-hero btn-secondary-light login-back-btn">Retour au site</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="wrap admin-header-inner">
          <Link to="/" className="logo">
            <div className="logo-mark">AE</div>
            <div className="logo-text">AUTO ELITE — ADMIN</div>
          </Link>
          <div className="header-actions">
            <Link to="/" className="btn-ghost">Voir le site</Link>
            <button type="button" className="btn-ghost btn-danger-ghost" onClick={handleLogout}>Déconnexion</button>
          </div>
        </div>
      </header>

      <div className="wrap admin-body animate-fade-in-up">
        <div className="admin-tabs">
          <button type="button" className={`admin-tab ${activeTab === 'vehicles' ? 'active' : ''}`} onClick={() => setActiveTab('vehicles')}>Véhicules</button>
          <button type="button" className={`admin-tab ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}>Alertes</button>
          <button type="button" className={`admin-tab ${activeTab === 'articles' ? 'active' : ''}`} onClick={() => setActiveTab('articles')}>Articles</button>
          <button type="button" className={`admin-tab ${activeTab === 'partners' ? 'active' : ''}`} onClick={() => setActiveTab('partners')}>Partenaires</button>
          <button type="button" className={`admin-tab ${activeTab === 'tools' ? 'active' : ''}`} onClick={() => setActiveTab('tools')}>Outils</button>
        </div>

        {activeTab === 'vehicles' && (
          <>
            {showForm && (
              <VehicleForm vehicle={editingVehicle} onSaved={handleSaved} onCancel={() => { setShowForm(false); setEditingVehicle(null); }} />
            )}
            {!showForm && (
              <div className="admin-toolbar">
                <div>
                  <div className="section-eyebrow">Espace admin</div>
                  <h2 className="display">Gérer les véhicules</h2>
                </div>
                <button type="button" className="btn-primary" onClick={handleAddNew}>
                  <PlusIcon width="15" height="15" /> Ajouter un véhicule
                </button>
              </div>
            )}
            {!showForm && (
              loading ? <p className="vehicle-empty">Chargement...</p> : <AdminVehicleList vehicles={vehicles} onEdit={handleEdit} onChanged={loadAll} />
            )}
          </>
        )}

        {activeTab === 'alerts' && (
          <div className="admin-section">
            <h2 className="display" style={{ marginBottom: 24 }}>Alertes clients</h2>
            {alerts.length === 0 && <p className="vehicle-empty">Aucune alerte enregistrée.</p>}
            <div className="admin-list">
              {alerts.map((a) => (
                <div key={a.id} className="admin-list-item">
                  <div className="admin-list-row">
                    <div>
                      <h4>{a.contact}</h4>
                      <div className="admin-list-meta">
                        {a.brand && <span>Marque : {a.brand}</span>}
                        {a.model && <span>Modèle : {a.model}</span>}
                        {a.phone && <span>Tél : {a.phone}</span>}
                        {a.email && <span>Email : {a.email}</span>}
                        <span>{new Date(a.createdAt).toLocaleString('fr-FR')}</span>
                      </div>
                    </div>
                    <div className="admin-list-actions">
                      <button type="button" className="btn-danger" onClick={() => handleDeleteAlert(a.id)}>
                        <TrashIcon width="14" height="14" /> Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="admin-section">
            <h2 className="display" style={{ marginBottom: 24 }}>Articles / Actualités</h2>
            <form className="admin-form" onSubmit={handleSaveArticle} style={{ marginBottom: 32 }}>
              <h3>{editingArticle ? 'Modifier l\'article' : 'Nouvel article'}</h3>
              <div className="field-group">
                <label htmlFor="artTitle">Titre</label>
                <input id="artTitle" value={articleForm.title} onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })} required />
              </div>
              <div className="field-group">
                <label htmlFor="artExcerpt">Résumé</label>
                <input id="artExcerpt" value={articleForm.excerpt} onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })} />
              </div>
              <div className="field-group">
                <label htmlFor="artContent">Contenu</label>
                <textarea id="artContent" rows={5} value={articleForm.content} onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })} required />
              </div>
              <div className="admin-form-actions">
                <button type="submit" className="btn-primary">{editingArticle ? 'Mettre à jour' : 'Publier'}</button>
                {editingArticle && <button type="button" className="btn-ghost" onClick={() => { setEditingArticle(null); setArticleForm({ title: '', excerpt: '', content: '' }); }}>Annuler</button>}
              </div>
            </form>
            {articles.length === 0 && <p className="vehicle-empty">Aucun article.</p>}
            <div className="admin-list">
              {articles.map((a) => (
                <div key={a.id} className="admin-list-item">
                  <div className="admin-list-row">
                    <div>
                      <h4>{a.title}</h4>
                      <div className="admin-list-meta">
                        <span>{new Date(a.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    <div className="admin-list-actions">
                      <button type="button" onClick={() => { setEditingArticle(a); setArticleForm({ title: a.title, excerpt: a.excerpt, content: a.content }); }}>
                        <EditIcon width="14" height="14" />
                      </button>
                      <button type="button" className="btn-danger" onClick={() => handleDeleteArticle(a.id)}>
                        <TrashIcon width="14" height="14" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'partners' && (
          <div className="admin-section">
            <h2 className="display" style={{ marginBottom: 24 }}>Partenaires</h2>
            <form className="admin-form" onSubmit={handleAddPartner} style={{ marginBottom: 32, maxWidth: 420 }}>
              <div className="field-group">
                <label htmlFor="partnerName">Nom du partenaire</label>
                <input id="partnerName" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} placeholder="Ex: Banque Atlantique" required />
              </div>
              <button type="submit" className="btn-primary">Ajouter</button>
            </form>
            {partners.length === 0 && <p className="vehicle-empty">Aucun partenaire enregistré.</p>}
            <div className="admin-list">
              {partners.map((p) => (
                <div key={p.id} className="admin-list-item">
                  <div className="admin-list-row">
                    <div>
                      <h4>{p.name}</h4>
                    </div>
                    <div className="admin-list-actions">
                      <button type="button" className="btn-danger" onClick={() => handleDeletePartner(p.id)}>
                        <TrashIcon width="14" height="14" /> Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="admin-section">
            <h2 className="display" style={{ marginBottom: 24 }}>Outils</h2>
            <div className="admin-form" style={{ maxWidth: 480 }}>
              <div className="field-group">
                <label htmlFor="qrVehicle">Générer QR code / PDF pour un véhicule</label>
                <select id="qrVehicle" value={qrVehicleId} onChange={(e) => setQrVehicleId(e.target.value)}>
                  <option value="">Sélectionner un véhicule</option>
                  {vehicles.map((v) => <option key={v.id} value={v.id}>{v.brand} {v.model}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn-primary" onClick={() => downloadPdf(qrVehicleId, `fiche-${qrVehicleId}.pdf`)} disabled={!qrVehicleId}>
                  <DownloadIcon width="15" height="15" /> Télécharger PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
