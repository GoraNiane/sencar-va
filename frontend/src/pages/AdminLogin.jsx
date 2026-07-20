import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../api.js';
import { ShieldIcon } from '../components/Icons.jsx';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await loginAdmin(password);
      localStorage.setItem('admin_token', result.token);
      localStorage.setItem('admin_role', result.role);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Mot de passe invalide.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-layout">
      <div className="login-box animate-fade-in-up">
        <div className="login-header">
          <div className="login-shield-badge">
            <ShieldIcon width="32" height="32" />
          </div>
          <h2 className="display">Espace Admin</h2>
          <p>Veuillez saisir le mot de passe administrateur.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="adminPassword">Mot de passe</label>
            <input
              id="adminPassword"
              type="password"
              placeholder="Mot de passe admin"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="form-error auth-error-msg">{error}</p>}
          <button type="submit" className="search-btn login-btn" disabled={loading}>
            {loading ? 'Connexion...' : 'Accéder au dashboard'}
          </button>
        </form>
        <div className="login-footer">
          <a href="/" className="btn-secondary-hero btn-secondary-light login-back-btn">Retour au site</a>
        </div>
      </div>
    </div>
  );
}
