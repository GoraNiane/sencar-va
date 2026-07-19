# Auto Elite — TODO

## Étape A — Sécurité & Administration (priorité)
- [ ] 1) Ajouter persistance `admins.json` + `admin_audit.json` (backend/data)
- [ ] 2) Implémenter auth backend : login (email/password), hash (bcrypt), sessions (express-session) ou JWT
- [ ] 3) Middleware `requireAdmin` / `requireRole` + protection routes /admin et endpoints d’écriture
- [ ] 4) Audit log : qui a modifié/supprimé quoi, horodatage, IP/user-agent
- [ ] 5) Rate limiting sur endpoints sensibles (au minimum login + écriture admin)
- [ ] 6) Mettre à jour le frontend admin : remplacement `localStorage admin_password` par login réel
- [ ] 7) Brancher middleware backend dans `server.js` et ajuster `api.js`
- [ ] 8) Tester : rôles, permissions, journalisation, rate limit

