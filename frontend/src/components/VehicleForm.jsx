import { useState } from 'react';
import { createVehicle, updateVehicle, uploadMedia } from '../api.js';

const AMENITY_OPTIONS = [
  // Confort & Climatisation
  'Climatisation automatique', 'Climatisation bizone', 'Climatisation quadrizone',
  'Sièges chauffants', 'Sièges ventilés', 'Sièges massants',
  'Sièges cuir', 'Sièges tissu', 'Sièges alcantara',
  'Sièges électriques conducteur', 'Sièges électriques passager',
  'Mémoire sièges', 'Sièges rabattables', 'Banquette arrière fractionnable',
  'Toit ouvrant', 'Toit panoramique', 'Toit vitré',
  'Volant chauffant', 'Volant cuir multifonction',
  'Rétroviseurs électriques rabattables', 'Rétroviseurs dégivrants',
  'Rétroviseurs électrochromes', 'Vitres électriques',
  'Vitres arrière surteintées', 'Pare-brise acoustique',
  'Hayon électrique', 'Hayon mains-libres',
  'Portes latérales électriques',

  // Systèmes d'aide à la conduite (ADAS)
  'Régulateur de vitesse adaptatif', 'Régulateur de vitesse',
  'Limiteur de vitesse', 'Maintien dans la voie',
  'Alerte franchissement de ligne', 'Alerte angle mort',
  'Alerte trafic transversal', 'Freinage automatique d\'urgence',
  'Reconnaissance des panneaux', 'Caméra 360°', 'Caméra de recul',
  'Caméra avant', 'Park Assist', 'Stationnement automatique',
  'Capteurs de stationnement avant', 'Capteurs de stationnement arrière',
  'Affichage tête haute (HUD)', 'Night Vision',
  'Détecteur de fatigue conducteur', 'Pré-collision assisté',
  'Aide au démarrage en côte', 'Contrôle de descente',
  'Système anti-brouillard', 'Feux de route automatiques',
  'Feux adaptatifs LED', 'Feux matriciels LED',

  // Multimédia & Connectivité
  'Apple CarPlay', 'Android Auto', 'Écran tactile',
  'GPS / Navigation intégrée', 'Bluetooth',
  'Chargeur smartphone sans fil', 'Wi-Fi hotspot',
  'Prise USB avant', 'Prise USB arrière', 'Prise USB-C',
  'Prise 12V', 'Prise 220V',
  'Système audio premium (Bose, JBL, Harman...)',
  'Caisson de basses', 'Radio DAB+',
  'Commande vocale', 'Reconnaissance gestuelle',
  'Mise à jour cartes OTA', 'Tablettes arrière écrans',

  // Motorisation & Transmission
  '4x4 (Transmission intégrale)', 'Hybride', 'Électrique',
  'Mode Eco / Sport / Confort', 'Palettes au volant',
  'Boîte automatique séquentielle', 'Boîte manuelle',
  'Suspension pneumatique', 'Suspension adaptative',
  'Direction assistée variable', 'Launch Control',

  // Sécurité
  'ABS', 'ESP', 'Airbags frontaux', 'Airbags latéraux',
  'Airbags rideaux', 'Airbags genoux', 'Antivol',
  'Alarme périmétrique', 'Alarme volumétrique',
  'Verrouillage centralisé', 'Keyless Entry',
  'Démarrage sans clé', 'Suivi GPS véhicule',
  'Caméra embarquée (Dashcam)', 'Extincteur',

  // Extérieur
  'Jantes alliage', 'Jantes acier', 'Toit bi-ton',
  'Barres de toit', 'Attelage remorque',
  'Pas de vitre latérale arrière (utilitaire)',
  'Phares LED', 'Phares Xénon', 'Phares halogènes',
  'Feux arrière LED', 'Feux arrière fumés',
  'Rétroviseurs déportés', 'Bas de caisse',
  'Autocollant publicitaire', 'Vitres teintées',

  // Pratique
  'Galerie / coffre de toit',
  'Siège enfant intégré', 'ISOFIX',
  'Filet à bagages', 'Cache-bagages',
  'Pneus neige', 'Chaînes à neige',
  'Roue de secours', 'Kit anti-crevaison',
  'Cric et outillage', 'Triangle de signalisation',
  'Gilet de sécurité', 'Trousse de premiers soins',
  'Coffre réfrigéré', 'Double plancher',
  'Boîte à gants réfrigérée',
  'Porte-gobelets avant', 'Porte-gobelets arrière',
  'Accoudoir central avant', 'Accoudoir central arrière',
  'Tablette pique-nique arrière',
  'Éclairage d\'ambiance LED',
  'Vide-poches multiples',
  'Crochet d\'attache',
  'Pré-équipement téléphone',
  'Cendrier / Allume-cigare'
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
  const [amenitySearch, setAmenitySearch] = useState('');

  const isEditing = Boolean(vehicle);

  const filteredAmenities = AMENITY_OPTIONS.filter(a =>
    a.toLowerCase().includes(amenitySearch.toLowerCase())
  );

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
        <label>Commodités <span className="upload-hint" style={{display:'inline', fontWeight:400, textTransform:'none', letterSpacing:0}}>({form.amenities.length} sélectionnée(s))</span></label>
        <input
          type="text"
          className="amenity-search"
          placeholder="Rechercher une commodité..."
          value={amenitySearch}
          onChange={(e) => setAmenitySearch(e.target.value)}
        />
        <div className="amenity-checks">
          {filteredAmenities.map((amenity) => (
            <label key={amenity} className="checkbox-field">
              <input
                type="checkbox"
                checked={form.amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
              />
              {amenity}
            </label>
          ))}
          {filteredAmenities.length === 0 && (
            <span className="upload-hint" style={{ gridColumn: '1 / -1' }}>Aucune commodité trouvée pour "{amenitySearch}"</span>
          )}
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
          <label>Photos</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setPhotoFiles(Array.from(e.target.files))}
          />
          {photoFiles.length > 0 && <span className="upload-hint">{photoFiles.length} photo(s) sélectionnée(s)</span>}
        </div>
        <div className="field-group">
          <label>Vidéos</label>
          <input
            type="file"
            accept="video/*"
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
