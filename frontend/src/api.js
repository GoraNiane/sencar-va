const BASE = '/api/vehicles';
const EXTRA_BASE = '/api';
const ADMIN_BASE = '/api/admin';

function getHeaders(extraHeaders = {}) {
  const token = localStorage.getItem('admin_token') || '';
  return {
    ...extraHeaders,
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

export async function loginAdmin(password) {
  const res = await fetch(`${ADMIN_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Mot de passe invalide.');
  }
  return res.json();
}

export async function fetchVehicles(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value || value === 0) query.set(key, value);
  });
  const res = await fetch(`${BASE}?${query.toString()}`);
  if (!res.ok) throw new Error('Erreur lors du chargement des véhicules.');
  return res.json();
}

export async function fetchVehicle(id) {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error('Véhicule introuvable.');
  return res.json();
}

export async function createVehicle(data) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur lors de la création de la fiche véhicule.");
  }
  return res.json();
}

export async function updateVehicle(id, data) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de la mise à jour.');
  }
  return res.json();
}

export async function deleteVehicle(id) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de la suppression.');
  }
  return res.json();
}

export async function uploadMedia(id, { photos = [], videos = [] }) {
  const formData = new FormData();
  photos.forEach((file) => formData.append('photos', file));
  videos.forEach((file) => formData.append('videos', file));

  const res = await fetch(`${BASE}/${id}/media`, {
    method: 'POST',
    headers: getHeaders(),
    body: formData
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur lors de l'envoi des photos/vidéos.");
  }
  return res.json();
}

export async function deleteMedia(id, type, filename) {
  const res = await fetch(`${BASE}/${id}/media`, {
    method: 'DELETE',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ type, filename })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de la suppression du média.');
  }
  return res.json();
}

export function mediaUrl(vehicleId, filename) {
  return `/uploads/vehicles/${vehicleId}/${filename}`;
}

// ===== ALERTS =====
export async function submitAlert(data) {
  const res = await fetch(`${EXTRA_BASE}/alerts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur lors de l'enregistrement de l'alerte.");
  }
  return res.json();
}

export async function fetchAlerts() {
  const res = await fetch(`${EXTRA_BASE}/alerts`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Erreur lors du chargement des alertes.');
  return res.json();
}

export async function deleteAlert(id) {
  const res = await fetch(`${EXTRA_BASE}/alerts/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Erreur lors de la suppression de l\'alerte.');
  return res.json();
}

// ===== ARTICLES =====
export async function fetchArticles() {
  const res = await fetch(`${EXTRA_BASE}/articles`);
  if (!res.ok) throw new Error('Erreur lors du chargement des articles.');
  return res.json();
}

export async function createArticle(data) {
  const res = await fetch(`${EXTRA_BASE}/articles`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de la création de l\'article.');
  }
  return res.json();
}

export async function updateArticle(id, data) {
  const res = await fetch(`${EXTRA_BASE}/articles/${id}`, {
    method: 'PUT',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur lors de la mise à jour de l\'article.');
  return res.json();
}

export async function deleteArticle(id) {
  const res = await fetch(`${EXTRA_BASE}/articles/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Erreur lors de la suppression de l\'article.');
  return res.json();
}

// ===== PARTNERS =====
export async function fetchPartners() {
  const res = await fetch(`${EXTRA_BASE}/partners`);
  if (!res.ok) throw new Error('Erreur lors du chargement des partenaires.');
  return res.json();
}

export async function createPartner(data) {
  const res = await fetch(`${EXTRA_BASE}/partners`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de la création du partenaire.');
  }
  return res.json();
}

export async function deletePartner(id) {
  const res = await fetch(`${EXTRA_BASE}/partners/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Erreur lors de la suppression du partenaire.');
  return res.json();
}

// ===== APPOINTMENTS =====
export async function fetchAppointments() {
  const res = await fetch(`${EXTRA_BASE}/appointments`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Erreur lors du chargement des rendez-vous.');
  return res.json();
}

export async function createAppointment(data) {
  const res = await fetch(`${EXTRA_BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur lors de la prise de rendez-vous.");
  }
  return res.json();
}

export async function updateAppointmentStatus(id, status) {
  const res = await fetch(`${EXTRA_BASE}/appointments/${id}/status`, {
    method: 'PUT',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Erreur lors de la mise à jour du statut.');
  return res.json();
}

export async function deleteAppointment(id) {
  const res = await fetch(`${EXTRA_BASE}/appointments/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Erreur lors de la suppression du rendez-vous.');
  return res.json();
}

// ===== TRADE-INS =====
export async function fetchTradeins() {
  const res = await fetch(`${EXTRA_BASE}/tradeins`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Erreur lors du chargement des reprises.');
  return res.json();
}

export async function createTradein(data) {
  const res = await fetch(`${EXTRA_BASE}/tradeins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur lors de l'enregistrement de la reprise.");
  }
  return res.json();
}

export async function updateTradeinStatus(id, status) {
  const res = await fetch(`${EXTRA_BASE}/tradeins/${id}/status`, {
    method: 'PUT',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Erreur lors de la mise à jour du statut.');
  return res.json();
}

export async function deleteTradein(id) {
  const res = await fetch(`${EXTRA_BASE}/tradeins/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Erreur lors de la suppression de la reprise.');
  return res.json();
}

// ===== FAVORITES =====
export async function fetchFavorites() {
  const res = await fetch(`${EXTRA_BASE}/favorites`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Erreur lors du chargement des favoris.');
  return res.json();
}

export async function addFavorite(vehicleId) {
  const res = await fetch(`${EXTRA_BASE}/favorites`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ vehicleId })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de l\'ajout aux favoris.');
  }
  return res.json();
}

export async function removeFavorite(vehicleId) {
  const res = await fetch(`${EXTRA_BASE}/favorites/${vehicleId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Erreur lors de la suppression du favori.');
  return res.json();
}

// ===== REVIEWS =====
export async function fetchReviews() {
  const res = await fetch(`${EXTRA_BASE}/reviews`);
  if (!res.ok) throw new Error('Erreur lors du chargement des avis.');
  return res.json();
}

export async function submitReview(data) {
  const res = await fetch(`${EXTRA_BASE}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur lors de l'envoi de l'avis.");
  }
  return res.json();
}

export async function approveReview(id) {
  const res = await fetch(`${EXTRA_BASE}/reviews/${id}/approve`, {
    method: 'PUT',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Erreur lors de la modération de l\'avis.');
  return res.json();
}

export async function deleteReview(id) {
  const res = await fetch(`${EXTRA_BASE}/reviews/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Erreur lors de la suppression de l\'avis.');
  return res.json();
}

// ===== LEGAL =====
export async function fetchLegalPage(page) {
  const res = await fetch(`${EXTRA_BASE}/legal/${page}`);
  if (!res.ok) throw new Error('Page introuvable.');
  return res.json();
}

export async function updateLegalPage(page, content) {
  const res = await fetch(`${EXTRA_BASE}/legal/${page}`, {
    method: 'PUT',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ content })
  });
  if (!res.ok) throw new Error('Erreur lors de la mise à jour.');
  return res.json();
}

// ===== STATS =====
export async function fetchVehicleStats(id) {
  const res = await fetch(`${BASE}/${id}/stats`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Erreur lors du chargement des stats.');
  return res.json();
}

export async function fetchTopVehicles() {
  const res = await fetch(`${BASE}/stats/top`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Erreur lors du chargement des statistiques.');
  return res.json();
}

export async function trackView(vehicleId) {
  return fetch(`${BASE}/${vehicleId}/stats/view`, { method: 'POST', headers: getHeaders() });
}

export async function trackWhatsapp(vehicleId) {
  return fetch(`${BASE}/${vehicleId}/stats/whatsapp`, { method: 'POST', headers: getHeaders() });
}

export async function trackCall(vehicleId) {
  return fetch(`${BASE}/${vehicleId}/stats/call`, { method: 'POST', headers: getHeaders() });
}

// ===== VEHICLE MEDIA HELPERS =====
export async function fetchQrCode(vehicleId) {
  const res = await fetch(`${BASE}/${vehicleId}/qr`);
  if (!res.ok) throw new Error('Erreur lors de la génération du QR code.');
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export async function downloadPdf(vehicleId, filename) {
  const res = await fetch(`${BASE}/${vehicleId}/pdf`);
  if (!res.ok) throw new Error('Erreur lors du téléchargement du PDF.');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'fiche-technique.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ===== ADMIN =====
// Login only — single password, no multi-user system
