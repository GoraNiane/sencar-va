import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchVehicles, fetchAlerts, deleteAlert, fetchArticles, createArticle, updateArticle, deleteArticle, fetchPartners, createPartner, deletePartner, downloadPdf, fetchAppointments, updateAppointmentStatus, deleteAppointment, fetchTradeins, updateTradeinStatus, deleteTradein, fetchTopVehicles } from '../api.js';
import VehicleForm from '../components/VehicleForm.jsx';
import AdminVehicleList from '../components/AdminVehicleList.jsx';
import { PlusIcon, TrashIcon, EditIcon, DownloadIcon, EyeIcon, WhatsAppIcon, PhoneIcon } from '../components/Icons.jsx';

export default function AdminPage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [qrVehicleId, setQrVehicleId] = useState('');

  const [activeTab, setActiveTab] = useState('vehicles');
  const [alerts, setAlerts] = useState([]);
  const [articles, setArticles] = useState([]);
  const [partners, setPartners] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [tradeins, setTradeins] = useState([]);
  const [topVehicles, setTopVehicles] = useState([]);

  const [articleForm, setArticleForm] = useState({ title: '', excerpt: '', content: '' });
  const [editingArticle, setEditingArticle] = useState(null);
  const [partnerName, setPartnerName] = useState('');

  const [adminError, setAdminError] = useState('');

  const loadAll = useCallback(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    setAdminError('');
    Promise.all([
      fetchVehicles().catch(() => []),
      fetchAlerts().catch(() => []),
      fetchArticles().catch(() => []),
      fetchPartners().catch(() => []),
      fetchAppointments().catch(() => []),
      fetchTradeins().catch(() => []),
      fetchTopVehicles().catch(() => [])
    ]).then(([v, a, ar, p, ap, t, top]) => {
      setVehicles(v);
      setAlerts(a);
      setArticles(ar);
      setPartners(p);
      setAppointments(ap);
      setTradeins(t);
      setTopVehicles(top);
    }).catch((err) => {
      console.error('Erreur de chargement admin', err);
      setAdminError(err?.message || 'Erreur lors du chargement des données.');
    }).finally(() => setLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    try {
      const token = localStorage.getItem('admin_token');
      if (token) {
        setIsAuthenticated(true);
      } else {
        navigate('/admin/login', { replace: true });
      }
    } catch (e) {
      console.error('Erreur accès localStorage', e);
      navigate('/admin/login', { replace: true });
    } finally {
      setCheckingAuth(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated) loadAll();
  }, [isAuthenticated, loadAll]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_role');
    setIsAuthenticated(false);
    navigate('/admin/login', { replace: true });
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

  const handleAppointmentStatus = async (id, status) => {
    await updateAppointmentStatus(id, status);
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const handleDeleteAppointment = async (id) => {
    await deleteAppointment(id);
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const handleTradeinStatus = async (id, status) => {
    await updateTradeinStatus(id, status);
    setTradeins(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleDeleteTradein = async (id) => {
    await deleteTradein(id);
    setTradeins(prev => prev.filter(t => t.id !== id));
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
    return null;
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
        {adminError && (
          <p className="form-error" style={{ marginBottom: 16 }}>{adminError}</p>
        )}
        <div className="admin-tabs">
          <button type="button" className={`admin-tab ${activeTab === 'vehicles' ? 'active' : ''}`} onClick={() => setActiveTab('vehicles')}>Véhicules</button>
          <button type="button" className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>Statistiques</button>
          <button type="button" className={`admin-tab ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>Rendez-vous</button>
          <button type="button" className={`admin-tab ${activeTab === 'tradeins' ? 'active' : ''}`} onClick={() => setActiveTab('tradeins')}>Reprises</button>
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

        {activeTab === 'stats' && (
          <div className="admin-section">
            <h2 className="display" style={{ marginBottom: 24 }}>Statistiques</h2>
            {topVehicles.length === 0 && <p className="vehicle-empty">Aucune donnée pour le moment.</p>}
            <div className="admin-list">
              {topVehicles.map((v) => (
                <div key={v.id} className="admin-list-item">
                  <div className="admin-list-row">
                    <div>
                      <h4>{v.brand} {v.model}</h4>
                      <div className="admin-list-meta">
                        <span><EyeIcon width="13" height="13" /> {v.views} vues</span>
                        <span><WhatsAppIcon width="13" height="13" /> {v.whatsapp} clics</span>
                        <span><PhoneIcon width="13" height="13" /> {v.call} appels</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="admin-section">
            <h2 className="display" style={{ marginBottom: 24 }}>Rendez-vous</h2>
            {appointments.length === 0 && <p className="vehicle-empty">Aucun rendez-vous.</p>}
            <div className="admin-list">
              {appointments.map((a) => (
                <div key={a.id} className="admin-list-item">
                  <div className="admin-list-row">
                    <div>
                      <h4>{a.name}</h4>
                      <div className="admin-list-meta">
                        <span>Tél : {a.phone}</span>
                        {a.vehicleId && <span>Véhicule #{a.vehicleId}</span>}
                        <span>{a.date} à {a.time}</span>
                        <span className={`tag-${a.status === 'confirmed' ? 'available' : 'unavailable'}`}>{a.status}</span>
                      </div>
                      {a.message && <p style={{ marginTop: 6, color: 'var(--steel)', fontSize: 13 }}>{a.message}</p>}
                    </div>
                    <div className="admin-list-actions">
                      {a.status !== 'confirmed' && <button type="button" className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => handleAppointmentStatus(a.id, 'confirmed')}>Confirmer</button>}
                      {a.status !== 'cancelled' && <button type="button" className="btn-danger" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => handleAppointmentStatus(a.id, 'cancelled')}>Annuler</button>}
                      <button type="button" className="btn-danger" onClick={() => handleDeleteAppointment(a.id)}>
                        <TrashIcon width="14" height="14" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tradeins' && (
          <div className="admin-section">
            <h2 className="display" style={{ marginBottom: 24 }}>Reprises</h2>
            {tradeins.length === 0 && <p className="vehicle-empty">Aucune reprise.</p>}
            <div className="admin-list">
              {tradeins.map((t) => (
                <div key={t.id} className="admin-list-item">
                  <div className="admin-list-row">
                    <div>
                      <h4>{t.brand} {t.model} ({t.year || 'N/A'})</h4>
                      <div className="admin-list-meta">
                        <span>{t.name}</span>
                        <span>Tél : {t.phone}</span>
                        <span>{t.mileage?.toLocaleString('fr-FR')} km</span>
                        <span className={`tag-${t.status === 'accepted' ? 'available' : 'unavailable'}`}>{t.status}</span>
                      </div>
                      {t.description && <p style={{ marginTop: 6, color: 'var(--steel)', fontSize: 13 }}>{t.description}</p>}
                    </div>
                    <div className="admin-list-actions">
                      {t.status !== 'accepted' && <button type="button" className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => handleTradeinStatus(t.id, 'accepted')}>Accepter</button>}
                      {t.status !== 'rejected' && <button type="button" className="btn-danger" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => handleTradeinStatus(t.id, 'rejected')}>Refuser</button>}
                      <button type="button" className="btn-danger" onClick={() => handleDeleteTradein(t.id)}>
                        <TrashIcon width="14" height="14" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
