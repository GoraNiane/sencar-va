import { useState, useEffect, useRef } from 'react';
import { fetchArticles, fetchReviews, submitReview, fetchLegalPage, fetchVehicles } from '../api.js';
import { MessageIcon, StarIcon, CloseIcon } from './Icons.jsx';

// ===== CONNAISSANCE COMPLÈTE DU DOMAINE AUTO ELITE =====
const KB = {
  marques: ['toyota', 'mercedes', 'bmw', 'audi', 'volkswagen', 'vw', 'renault', 'peugeot', 'nissan', 'honda', 'hyundai', 'kia', 'ford', 'lamborghini', 'ferrari', 'porsche', 'mazda', 'suzuki', 'mitsubishi', 'lexus', 'jaguar', 'land rover', 'range rover', 'dacia', 'citroen', 'fiat', 'volvo'],
  transmissions: ['automatique', 'manuelle', 'mécanique'],
  classifications: ['dédouané', 'sous douane', 'sur commande'],
  amenites: ['climatisation', 'bluetooth', 'caméra de recul', 'vitres électriques', 'sièges cuir', 'toit ouvrant', 'gps', 'régulateur de vitesse', '4x4', 'écran tactile', 'capteurs de stationnement', 'toit panoramique', 'jantes alliage', 'phares led', 'sièges chauffants', 'volant cuir', 'système audio', 'navigation']
};

const FAQ = [
  {
    mots: ['bonjour', 'salut', 'hello', 'bonsoir', 'hey', 'hi', 'coucou'],
    reponse: () => `Bonjour ! Bienvenue chez Auto Elite. Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ? Vous pouvez me poser des questions sur nos véhicules, les services, les rendez-vous, les reprises, ou tout autre sujet.`
  },
  {
    mots: ['merci', 'merci bien', 'merci beaucoup', 'thanks'],
    reponse: () => `Avec plaisir ! N'hésitez pas si vous avez d'autres questions. Passez une excellente journée !`
  },
  // Horaires & Contact
  {
    mots: ['heure', 'horaire', 'ouvert', 'fermé', 'quand', 'showroom', 'visiter', 'rendre'],
    reponse: () => `Nos horaires d'ouverture :\n• Lundi au Samedi : 8h30 - 18h30\n• Dimanche : Fermé\n\nNotre showroom est situé à Cocody, Abidjan.\nVous pouvez nous contacter au :\n📞 +225 05 09 09 39\n💬 WhatsApp : +225 05 09 09 39`
  },
  {
    mots: ['contact', 'appeler', 'téléphone', 'telephone', 'appel', 'numéro', 'whatsapp', 'joindre'],
    reponse: () => `Vous pouvez nous joindre par :\n📞 Téléphone : +225 05 09 09 39\n💬 WhatsApp : +225 05 09 09 39\n📍 Showroom : Cocody, Abidjan\n📧 Email : contact@autoelite.ci\n\nNotre équipe est disponible du lundi au samedi de 8h30 à 18h30.`
  },
  {
    mots: ['adresse', 'situé', 'localisation', 'où', 'trouver', 'venir', 'cocody', 'abidjan'],
    reponse: () => `Notre showroom Auto Elite est situé à Cocody, Abidjan (Côte d'Ivoire).\n\n📍 Adresse : Cocody, Abidjan\n🗺️ Nous sommes facilement accessibles.\n\nHoraires : Lun-Sam 8h30-18h30\n📞 +225 05 09 09 39`
  },
  // Véhicules en stock
  {
    mots: ['stock', 'véhicule', 'voiture', 'catalogue', 'disponible', 'achat', 'acheter', 'acquisition', 'modèle', 'modèle'],
    reponse: () => `Nous avons plusieurs véhicules disponibles dans notre catalogue !\n\nConsultez notre site web pour voir la liste complète avec photos, prix et caractéristiques.\n\nVous pouvez filtrer par :\n• Marque (Toyota, Mercedes, BMW, etc.)\n• Transmission (Automatique / Manuelle)\n• Classification (Dédouané, Sous douane, Sur commande)\n• Budget\n\n👉 Rendez-vous sur la page d'accueil et utilisez notre moteur de recherche !`
  },
  {
    mots: ['prix', 'tarif', 'coût', 'combien', 'payer', 'budget', 'financement', 'crédit'],
    reponse: () => `Nos véhicules sont proposés à des prix compétitifs, allant de 200 000 FCFA à plusieurs millions selon le modèle et l'état.\n\n💳 Modes de paiement acceptés :\n• Virement bancaire\n• Espèces\n• Orange Money\n• Wave\n• Mobile Money\n\n💶 Facilités de paiement :\nNous travaillons avec des partenaires financiers pour vous proposer des solutions adaptées. Contactez-nous pour plus d'informations !`
  },
  {
    mots: ['garantie', 'garanti', 'sav', 'après-vente', 'maintenance', 'entretien', 'panne', 'réparation'],
    reponse: () => `🛡️ Garantie :\nTous nos véhicules dédouanés bénéficient d'une garantie contractuelle.\n\n🔧 Service après-vente :\nNous assurons le suivi et l'entretien de nos véhicules.\n\nPour toute question technique ou réclamation, contactez-nous au +225 05 09 09 39.`
  },
  // Essai & Rendez-vous
  {
    mots: ['essai', 'essayer', 'tester', 'conduire', 'test', 'essai routier'],
    reponse: () => `Vous pouvez réserver un essai gratuit !\n\nPour planifier un essai :\n1️⃣ Rendez-vous sur la fiche du véhicule qui vous intéresse\n2️⃣ Cliquez sur "Réserver un essai"\n3️⃣ Choisissez votre créneau\n\nOu contactez-nous directement au +225 05 09 09 39`
  },
  {
    mots: ['rendez-vous', 'rdv', 'réserver', 'réservation', 'créneau', 'prendre rendez-vous'],
    reponse: () => `Pour prendre rendez-vous :\n\n1️⃣ Remplissez le formulaire en bas de notre page d'accueil (section "Rendez-vous")\n2️⃣ Indiquez vos coordonnées, la date et l'heure souhaitée\n3️⃣ Nous confirmons votre rendez-vous rapidement\n\nOu appelez-nous au +225 05 09 09 39.`
  },
  // Reprise
  {
    mots: ['reprise', 'reprendre', 'vendre', 'échange', 'estimation', 'côte', 'occasion'],
    reponse: () => `Nous reprenons votre véhicule ! 🚗\n\n📋 Comment ça marche :\n1️⃣ Remplissez le formulaire de reprise sur notre site\n2️⃣ Indiquez la marque, le modèle, l'année, le kilométrage\n3️⃣ Nous évaluons votre véhicule et vous faisons une offre\n\n✅ Procédure simple et rapide\n💰 Paiement immédiat\n\nRendez-vous dans la section "Reprise" en bas de notre page d'accueil !`
  },
  // Paiement
  {
    mots: ['paiement', 'payer', 'espèce', 'virement', 'wave', 'orange money', 'mobile money', 'fcf', 'franc', 'monnaie'],
    reponse: () => `💳 Modes de paiement acceptés chez Auto Elite :\n\n✅ Virement bancaire\n✅ Espèces\n✅ Orange Money\n✅ Wave\n✅ Mobile Money\n\nNous travaillons également avec des partenaires bancaires pour faciliter votre acquisition.\n\n👉 Contactez-nous pour plus de détails sur les modalités.`
  },
  // Documents & Administrative
  {
    mots: ['document', 'papier', 'carte grise', 'immatriculation', 'certificat', 'facture', 'administratif', 'douane', 'dédouanement'],
    reponse: () => `📄 Documents fournis avec chaque véhicule :\n\n• Facture d'achat\n• Certificat de cession\n• Carte grise (pour les véhicules dédouanés)\n• Documents douaniers (pour véhicules sous douane)\n• Carnet d'entretien (selon véhicule)\n• Garantie contractuelle\n\nNotre équipe vous accompagne dans toutes les démarches administratives.`
  },
  // Livraison & Transport
  {
    mots: ['livraison', 'transport', 'livrer', 'expédition', 'port', 'voyage', 'transporter'],
    reponse: () => `🚚 Nous proposons des solutions de livraison pour vos véhicules.\n\n• Livraison possible à Abidjan et dans toute la Côte d'Ivoire\n• Transport sécurisé\n• Délais et tarifs selon la distance\n\nContactez-nous pour un devis personnalisé.`
  },
  // Classification des véhicules
  {
    mots: ['classification', 'catégorie', 'dédouané', 'sous douane', 'sur commande', 'importé', 'importation'],
    reponse: () => `Nos véhicules sont classés en 3 catégories :\n\n✅ **Dédouané** : Véhicule déjà importé, tous droits de douane payés, disponible immédiatement.\n\n⏳ **Sous douane** : Véhicule importé mais en attente de dédouanement. Délai supplémentaire requis.\n\n🌍 **Sur commande** : Véhicule commandé depuis l'étranger. Délai d'importation à prévoir.\n\n👉 Chaque véhicule affiche clairement sa classification sur sa fiche.`
  },
  // Entreprise
  {
    mots: ['auto elite', 'société', 'entreprise', 'qui êtes-vous', 'histoire', 'présentation', 'à propos', 'notre société'],
    reponse: () => `🏢 **Auto Elite** est une entreprise spécialisée dans l'importation et la vente de véhicules haut de gamme en Côte d'Ivoire.\n\n📍 Basée à Cocody, Abidjan\n🌍 Importation depuis l'Europe, les USA et l'Asie\n✅ Véhicules sélectionnés avec soin\n🔧 Garantie et service après-vente inclus\n🤝 Partenaires bancaires agréés\n\nNotre mission : vous offrir le meilleur véhicule aux meilleures conditions.`
  },
  // Partenaires
  {
    mots: ['partenaire', 'banque', 'financement', 'crédit auto', 'prêt', 'bancaire'],
    reponse: () => `Nos partenaires financiers :\n\n🏦 Banque Atlantique\n🏦 Autres institutions bancaires partenaires\n\nIls vous accompagnent dans le financement de l'acquisition de votre véhicule.\n\n👉 Contactez-nous pour être mis en relation avec nos partenaires !`
  },
  // Avis clients
  {
    mots: ['avis', 'témoignage', 'client', 'expérience', 'satisfait', 'recommandation', 'note'],
    reponse: () => `📢 Nos clients sont nos meilleurs ambassadeurs !\n\nVous pouvez consulter les avis de nos clients directement dans notre chat (rubrique avis).\n\n💬 Vous aussi, partagez votre expérience en cliquant sur l'icône étoile ⭐ dans ce chat !\n\nNous attachons une grande importance à la satisfaction de nos clients.`
  },
  // Conseils
  {
    mots: ['conseil', 'astuce', 'recommander', 'suggestion', 'aide', 'choisir', 'lequel', 'meilleur'],
    reponse: () => `Quelques conseils pour bien choisir votre véhicule :\n\n1️⃣ **Définissez votre budget** (achat + entretien + assurance)\n2️⃣ **Choisissez votre classification** : dédouané (disponible immédiatement), sous douane, ou sur commande\n3️⃣ **Transmission** : automatique pour le confort, manuelle pour la maîtrise\n4️⃣ **Essai** : Toujours essayer avant d'acheter !\n5️⃣ **Garantie** : Vérifiez les garanties incluses\n\nNotre équipe est là pour vous guider ! 😊`
  },
  // Entretien auto
  {
    mots: ['entretien', 'vidange', 'révision', 'pneu', 'frein', 'huile', 'filtre', 'batterie', 'climatisation'],
    reponse: () => `🔧 Conseils d'entretien :\n\n• **Vidange** : Tous les 10 000 km ou 1 an\n• **Pneus** : Vérifiez la pression tous les mois\n• **Freins** : Faites-les vérifier à chaque révision\n• **Batterie** : Durée de vie moyenne 3-4 ans\n• **Climatisation** : Recharge recommandée tous les 2 ans\n\nPour l'entretien de votre véhicule Auto Elite, contactez notre service après-vente !`
  },
  // Général / Divers
  {
    mots: ['site', 'application', 'pwa', 'installer', 'mobile', 'téléphone', 'portable'],
    reponse: () => `🌐 Notre site est accessible depuis n'importe quel appareil !\n\n📱 **Application mobile** :\nVous pouvez installer notre site comme une application sur votre téléphone :\n1. Ouvrez le site dans Chrome/Safari\n2. Appuyez sur "Installer" ou "Ajouter à l'écran d'accueil"\n3. L'application s'ouvrira comme une app native !`
  },
  {
    mots: ['sécurité', 'confiance', 'fiable', 'honnête', 'sérieux', 'professionnel'],
    reponse: () => `Chez **Auto Elite**, la satisfaction et la confiance de nos clients sont notre priorité.\n\n✅ Véhicules soigneusement sélectionnés\n✅ Garantie contractuelle\n✅ Transparence sur l'origine et l'état des véhicules\n✅ Accompagnement personnalisé\n✅ Service après-vente\n\n📞 +225 05 09 09 39 — Contactez-nous en toute confiance !`
  },
  {
    mots: ['pouvez', 'possible', 'peut', 'capable', 'question', 'répondre'],
    reponse: () => `Oui, je suis là pour répondre à toutes vos questions ! 🤖\n\nJe peux vous renseigner sur :\n• Les véhicules disponibles\n• Les prix et modes de paiement\n• Les horaires et l'adresse\n• Les rendez-vous et essais\n• Les reprises de véhicules\n• La garantie et l'entretien\n• Les documents administratifs\n• Et bien plus encore !\n\nPosez-moi votre question ! 😊`
  },
  {
    mots: ['au revoir', 'bye', 'bonne journée', 'bonne soirée', 'ciao', 'à bientôt', 'salut'],
    reponse: () => `Merci d'avoir discuté avec moi ! 👋\n\nPour toute question, n'hésitez pas à revenir.\nAuto Elite — Votre partenaire automobile de confiance.\n\n📞 +225 05 09 09 39\n🌐 autoelite.ci`
  }
];

// Réponses pour les questions non reconnues
const FALLBACKS = [
  "Je n'ai pas encore appris à répondre à cette question spécifique. Pouvez-vous reformuler ou demander autre chose ? Je peux vous aider sur nos véhicules, les prix, les rendez-vous, les réparations, et bien plus !",
  "Intéressant ! Pour mieux vous répondre, essayez de formuler votre question autrement. Je suis spécialisé dans l'automobile et les services Auto Elite.",
  "Je ne suis pas sûr d'avoir compris. Voici ce que je peux faire pour vous :\n• Consulter nos véhicules en stock 🚗\n• Prendre un rendez-vous 📅\n• Estimer une reprise 💰\n• Donner les horaires et contact 📞\n\nQue souhaitez-vous ?",
  "Merci pour votre question ! Pour être sûr de bien vous répondre, pourriez-vous préciser votre demande ? Je suis là pour vous aider avec tout ce qui concerne Auto Elite."
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Bonjour ! Je suis l\'assistant virtuel d\'Auto Elite 🚗 Posez-moi toutes vos questions, je suis là pour vous aider !' }]);
  const [input, setInput] = useState('');
  const [articles, setArticles] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [showReview, setShowReview] = useState(false);
  const [legal, setLegal] = useState({ mentions: '', privacy: '', cgv: '' });
  const [legalTab, setLegalTab] = useState(null);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const bottomRef = useRef(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetchArticles().then(setArticles).catch(() => {});
    fetchVehicles({ limit: 20 }).then(setVehicles).catch(() => {});
    fetchReviews().then(setReviews).catch(() => {});
    fetchLegalPage('mentions').then(r => setLegal(l => ({ ...l, mentions: r.content }))).catch(() => {});
    fetchLegalPage('privacy').then(r => setLegal(l => ({ ...l, privacy: r.content }))).catch(() => {});
    fetchLegalPage('cgv').then(r => setLegal(l => ({ ...l, cgv: r.content }))).catch(() => {});
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cherche la meilleure correspondance dans la FAQ
  const findBestMatch = (text) => {
    const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // 1. Vérification mot-clé dans la FAQ
    let bestMatch = null;
    let bestScore = 0;
    
    for (const faq of FAQ) {
      let score = 0;
      for (const mot of faq.mots) {
        if (lower.includes(mot)) {
          if (mot.length > 4) score += 3; // mots longs = plus de poids
          else if (mot.length > 2) score += 2;
          else score += 1;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = faq;
      }
    }
    
    // 2. Vérification marque
    if (!bestMatch || bestScore < 2) {
      for (const marque of KB.marques) {
        if (lower.includes(marque)) {
          // Chercher si la question parle de disponibilité
          if (lower.includes('disponible') || lower.includes('stock') || lower.includes('prix') || lower.includes('tarif')) {
            const foundVehicles = vehicles.filter(v => 
              v.brand.toLowerCase().includes(marque) || marque.includes(v.brand.toLowerCase())
            );
            if (foundVehicles.length > 0) {
              return {
                type: 'vehicles',
                data: foundVehicles.slice(0, 3),
                marque: marque
              };
            }
          }
          return {
            type: 'marque',
            reponse: `Nous avons eu des modèles ${marque.charAt(0).toUpperCase() + marque.slice(1)} dans notre catalogue. Consultez notre site pour voir notre sélection actuelle disponible en stock ! 🚗`
          };
        }
      }
    }
    
    // 3. Vérification transmission
    if (!bestMatch || bestScore < 2) {
      for (const trans of KB.transmissions) {
        if (lower.includes(trans)) {
          return {
            type: 'transmission',
            reponse: `Nous proposons des véhicules en transmission ${trans}. Utilisez le filtre "Transmission" sur notre page d'accueil pour voir tous les modèles disponibles en ${trans} !`
          };
        }
      }
    }
    
    // 4. Recherche dans les articles
    if (!bestMatch || bestScore < 2) {
      for (const article of articles) {
        const titre = article.title.toLowerCase();
        const contenu = (article.content || '').toLowerCase();
        if (lower.includes(titre) || (titre && lower.includes(titre.slice(0, 10)))) {
          return {
            type: 'article',
            reponse: `📰 Article : ${article.title}\n\n${article.excerpt || article.content?.slice(0, 200) + '...'}`
          };
        }
      }
    }
    
    if (bestMatch && bestScore > 0) {
      return { type: 'faq', reponse: bestMatch.reponse() };
    }
    
    return null;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { from: 'user', text: userMsg }]);
    setInput('');
    
    const lower = userMsg.toLowerCase();
    
    setTimeout(async () => {
      const match = findBestMatch(userMsg);
      
      if (match) {
        if (match.type === 'vehicles') {
          const vehicle = match.data[0];
          let reponse = `🎯 **${match.marque.charAt(0).toUpperCase() + match.marque.slice(1)}** disponible chez Auto Elite :\n\n`;
          match.data.forEach(v => {
            reponse += `• **${v.brand} ${v.model}** (${v.year}) — ${v.mileage.toLocaleString('fr-FR')} km — ${v.transmission}\n  💰 ${v.price.toLocaleString('fr-FR')} FCFA — ${v.classification}\n`;
          });
          reponse += `\n👉 Consultez les fiches complètes sur notre site pour plus de détails et photos !`;
          setMessages(prev => [...prev, { from: 'bot', text: reponse }]);
        } else {
          setMessages(prev => [...prev, { from: 'bot', text: match.reponse }]);
        }
        setFallbackIndex(prev => (prev + 1) % FALLBACKS.length);
      } else {
        // Vérifier si c'est une question sur un véhicule spécifique
        if (lower.includes('bmw') || lower.includes('mercedes') || lower.includes('toyota') || 
            lower.includes('audi') || lower.includes('volkswagen') || lower.includes('vw') || 
            lower.includes('renault') || lower.includes('peugeot') || lower.includes('nissan') ||
            lower.includes('lamborghini') || lower.includes('ferrari') || lower.includes('porsche')) {
          setMessages(prev => [...prev, { from: 'bot', text: `Pour obtenir des informations détaillées sur ce modèle, je vous invite à :\n\n1️⃣ Consulter notre catalogue en ligne 🔍\n2️⃣ Nous appeler au 📞 +225 05 09 09 39\n3️⃣ Passer au showroom à Cocody 📍\n\nJe peux également vous aider avec d'autres questions !` }]);
        } else {
          setMessages(prev => [...prev, { from: 'bot', text: FALLBACKS[fallbackIndex] }]);
          setFallbackIndex(prev => (prev + 1) % FALLBACKS.length);
        }
      }
    }, 500);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await submitReview(reviewForm);
      setShowReview(false);
      setReviewForm({ name: '', rating: 5, comment: '' });
      fetchReviews().then(setReviews).catch(() => {});
      setMessages(prev => [...prev, { from: 'bot', text: 'Merci pour votre avis ! Il sera publié après modération. 🙏' }]);
    } catch {}
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <span className="display">Auto Elite IA</span>
            <div className="chat-header-actions">
              <button type="button" onClick={() => setShowReview(v => !v)} className="chat-icon-btn" title="Donner un avis"><StarIcon width="16" height="16" /></button>
              <button type="button" onClick={() => setLegalTab('mentions')} className="chat-icon-btn" title="Mentions légales">M</button>
              <button type="button" onClick={() => setLegalTab('privacy')} className="chat-icon-btn" title="Confidentialité">P</button>
              <button type="button" onClick={() => setLegalTab('cgv')} className="chat-icon-btn" title="CGV">C</button>
              <button type="button" onClick={() => setOpen(false)} className="chat-icon-btn"><CloseIcon width="16" height="16" /></button>
            </div>
          </div>

          {legalTab && (
            <div className="chat-legal">
              <div className="chat-legal-header">
                <span>{legalTab === 'mentions' ? 'Mentions légales' : legalTab === 'privacy' ? 'Politique de confidentialité' : 'CGV'}</span>
                <button type="button" onClick={() => setLegalTab(null)}><CloseIcon width="14" height="14" /></button>
              </div>
              <div className="chat-legal-body">
                {legalTab === 'mentions' && <p>{legal.mentions || 'Contenu à venir.'}</p>}
                {legalTab === 'privacy' && <p>{legal.privacy || 'Contenu à venir.'}</p>}
                {legalTab === 'cgv' && <p>{legal.cgv || 'Contenu à venir.'}</p>}
              </div>
            </div>
          )}

          {showReview && (
            <form className="chat-review-form" onSubmit={handleSubmitReview}>
              <div className="field-group">
                <label>Nom</label>
                <input value={reviewForm.name} onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })} required />
              </div>
              <div className="field-group">
                <label>Note</label>
                <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} / 5</option>)}
                </select>
              </div>
              <div className="field-group">
                <label>Commentaire</label>
                <textarea rows={3} value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} required />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '8px 14px', fontSize: 13 }}>Envoyer</button>
            </form>
          )}

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.from}`}>
                {m.text.split('\n').map((line, j) => (
                  <span key={j}>{line}<br /></span>
                ))}
              </div>
            ))}
            {articles.length > 0 && messages.length < 4 && (
              <div className="chat-articles">
                {articles.slice(0, 2).map(a => (
                  <div key={a.id} className="chat-article">
                    <strong>{a.title}</strong>
                    <p>{a.excerpt || a.content?.slice(0, 100)}</p>
                  </div>
                ))}
              </div>
            )}
            {reviews.filter(r => r.approved).length > 0 && messages.length < 4 && (
              <div className="chat-reviews">
                {reviews.filter(r => r.approved).slice(0, 2).map(r => (
                  <div key={r.id} className="chat-review">
                    <strong>{r.name}</strong> {'★'.repeat(r.rating)}
                    <p>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form className="chat-input" onSubmit={handleSend}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Posez votre question..." />
            <button type="submit" className="chat-send">Envoyer</button>
          </form>
        </div>
      )}
      <button type="button" className="chat-toggle" onClick={() => setOpen(!open)}>
        <MessageIcon width="22" height="22" />
      </button>
    </div>
  );
}

