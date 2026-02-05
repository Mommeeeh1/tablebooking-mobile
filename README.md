# Booking Platform – Mobilapp

Expo/React Native-klient för bordbokning (skapa bokningar, se status, avboka inom 24 h, läsa notiser). Anropar admin-portalens API.

Övergripande arkitektur, datamodell, notiser och motiveringar finns i **admin-portal/README.md**.

---

## Kör lokalt

Kräver att admin-portalen/API kör (lokalt eller deployad). Skapa `.env` i projektroten med:

- Lokalt API: `EXPO_PUBLIC_API_URL=http://localhost:3000/api`
- Deployad: `EXPO_PUBLIC_API_URL=https://tablebooking-admin.vercel.app/api`

Kör `npm install` och `npm start`. Öppna med Expo Go (QR), `w` (web), eller `a`/`i` (emulator).
