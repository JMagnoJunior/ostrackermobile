# OS Tracker Mobile (MVP com Login Google)

Aplicativo React Native (Expo) com login via Google OAuth e fluxo de finalizacao de OS.

## Escopo atual
1. Login via Google (`POST /api/auth/google`).
2. Persistencia de sessao JWT local.
3. Bloqueio para usuario pendente de aprovacao.
4. Fluxo de finalizacao para usuario ativo.

## Fora de escopo
1. Listagens/consultas.
2. Endpoints de debug.
3. Agendamento, retirada, pagamento e area cliente.
4. Refresh token e renovacao silenciosa.

## Requisitos
1. Node.js LTS.
2. npm.

## Configuracao
1. Copie `.env.example` para `.env`.
2. Defina `EXPO_PUBLIC_API_BASE_URL` para o backend desejado (producao Railway):
   - `EXPO_PUBLIC_API_BASE_URL=https://ostrackerservice-production.up.railway.app`
3. Configure os client IDs do Google:
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
   - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
4. `EXPO_PUBLIC_*` fica embutido no bundle no momento do build. Se mudar valor, precisa gerar novo build.

## Executar
```bash
npm install
npm start
```

## Executar Web (local)
1. Configure `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` no `.env`.
2. Garanta no Google Cloud (OAuth Web) que `http://localhost:8081` esteja em:
   - Authorized JavaScript origins
   - Authorized redirect URIs
3. Rode:
```bash
npm run web
```
4. Se o backend estiver em outro dominio, habilite CORS para a origem local do web.

## Testes
```bash
npm test
```
