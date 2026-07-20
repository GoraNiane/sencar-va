import { useState } from 'react';
import { createVehicle, updateVehicle, uploadMedia } from '../api.js';

const AMENITY_OPTIONS = [
  'Climatisation', 'GPS', 'Caméra de recul', 'Sièges cuir', 'Toit ouvrant',
  'Bluetooth', 'Régulateur de vitesse', 'Vitres électriques', 'Rétroviseurs électriques', '4x4'
];

const emptyForm = {
  brand: '', model: '', year: '', mileage: '', transmission: 'Automatique',
  price: '', classification: 'dedouane', amenities: [], comment: '', available: true
};

export default function VehicleForm({ vehicle, onSaved, onCancel }) {
  const [form, setForm] = useState(
    vehicle
      ? { ...vehicle, year: vehicle.year ?? '', mileage: vehicle.mileage ?? '', classification: vehicle.classification ?? 'dedouane' }
      : emptyForm
  );
  const [photoFiles, setPhotoFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = Boolean(vehicle);

  const toggleAmenity = (amenity) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter((a) => a !== amenity)
        : [...f.amenities, amenity]
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        brand: form.brand,
        model: form.model,
        year: form.year,
        mileage: form.mileage,
        transmission: form.transmission,
        price: form.price,
        classification: form.classification,
        amenities: form.amenities,
        comment: form.comment,
        available: form.available
      };

      const saved = isEditing
        ? await updateVehicle(vehicle.id, payload)
        : await createVehicle(payload);

      if (photoFiles.length > 0 || videoFiles.length > 0) {
        await uploadMedia(saved.id, { photos: photoFiles, videos: videoFiles });
      }

      onSaved();
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      <h3 className="display">{isEditing ? 'Modifier le véhicule' : 'Ajouter un véhicule'}</h3>

      <div className="admin-form-grid">
        <div className="field-group">
          <label>Marque</label>
          <input required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        </div>
        <div className="field-group">
          <label>Modèle</label>
          <input required value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
        </div>
        <div className="field-group">
          <label>Année</label>
          <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
        </div>
        <div className="field-group">
          <label>Kilométrage</label>
          <input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} />
        </div>
        <div className="field-group">
          <label>Transmission</label>
          <select value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })}>
            <option>Automatique</option>
            <option>Manuelle</option>
          </select>
        </div>
        <div className="field-group">
          <label>Classification</label>
          <select value={form.classification || 'dedouane'} onChange={(e) => setForm({ ...form, classification: e.target.value })}>
            <option value="dedouane">Disponible</option>
            <option value="sous_douane">Sous douane</option>
            <option value="sur_commande">Sur commande (Non expédié)</option>
          </select>
        </div>
        <div className="field-group">
          <label>Prix (FCFA) {form.classification === 'sur_commande' && <span className="upload-hint" style={{display:'inline'}}>(Optionnel)</span>}</label>
          <input
            required={form.classification !== 'sur_commande'}
            type="number"
            placeholder={form.classification === 'sur_commande' ? 'Aucun prix (Sur commande)' : 'Ex: 25000000'}
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>
      </div>

      <div className="field-group">
        <label>Commodités</label>
        <div className="amenity-checks">
          {AMENITY_OPTIONS.map((amenity) => (
            <label key={amenity} className="checkbox-field">
              <input
                type="checkbox"
                checked={form.amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
              />
              {amenity}
            </label>
          ))}
        </div>
      </div>

      <div className="field-group">
        <label>Commentaire / description</label>
        <textarea
          rows="3"
          placeholder="État du véhicule, remarques, historique..."
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
        />
      </div>

      <label className="checkbox-field">
        <input
          type="checkbox"
          checked={form.available}
          onChange={(e) => setForm({ ...form, available: e.target.checked })}
        />
        Disponible à la vente
      </label>

      <div className="admin-form-grid">
        <div className="field-group">
          <label>Photos (prises au téléphone)</label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={(e) => setPhotoFiles(Array.from(e.target.files))}
          />
          {photoFiles.length > 0 && <span className="upload-hint">{photoFiles.length} photo(s) sélectionnée(s)</span>}
        </div>
        <div className="field-group">
          <label>Vidéos (prises au téléphone)</label>
          <input
            type="file"
            accept="video/*"
            capture="environment"
            multiple
            onChange={(e) => setVideoFiles(Array.from(e.target.files))}
          />
          {videoFiles.length > 0 && <span className="upload-hint">{videoFiles.length} vidéo(s) sélectionnée(s)</span>}
        </div>
      </div>

      {isEditing && (
        <p className="upload-hint">
          Les nouvelles photos/vidéos s'ajoutent à celles déjà en ligne. Pour en retirer une, utilisez la liste ci-dessous.
        </p>
      )}

      {error && <p className="form-error">{error}</p>}

      <div className="admin-form-actions">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Enregistrement...' : isEditing ? 'Enregistrer les modifications' : 'Ajouter le véhicule'}
        </button>
        {onCancel && (
          <button type="button" className="btn-secondary-hero btn-secondary-light" onClick={onCancel}>
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
