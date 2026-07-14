# NextStep

Tablero Kanban minimalista organizado **por proyectos**: cada proyecto tiene su propio flujo independiente —**Sin completar → En proceso → Finalizadas**— y las tareas nunca se mezclan entre proyectos distintos.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 + Framer Motion (animaciones) + dnd-kit (drag & drop)
- Firebase: Authentication (Google) + Firestore en tiempo real
- Modo demo sin configuración: sesión de invitado con datos en localStorage

## Arrancar

```bash
npm install
npm run dev
```

Sin configurar nada la app funciona en **modo demo** (botón "Entrar como invitado", datos guardados en tu navegador).

## Activar Google + Firestore

1. Crea un proyecto en [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication → Método de acceso → Google → Habilitar.**
3. **Firestore Database → Crear base de datos** (modo producción).
4. En **Configuración del proyecto → Tus apps**, registra una app web y copia la configuración.
5. Copia `.env.example` a `.env.local` y pega los valores.
6. Reglas de Firestore recomendadas (cada usuario solo ve sus propios proyectos y tareas):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

> Si ya tenías la regla antigua (solo `tasks`), reemplázala por esta: cubre tanto
> `users/{uid}/tasks` como la nueva `users/{uid}/projects`.

7. Reinicia `npm run dev`. El botón "Continuar con Google" ya funcionará y las tareas se sincronizarán en Firestore (`users/{uid}/tasks` y `users/{uid}/projects`).

## Desplegar

```bash
npm run build       # genera dist/
```

- **Vercel / Netlify:** importa el repo, añade las variables `VITE_FIREBASE_*` en el panel y despliega.
- **Firebase Hosting:** `npm i -g firebase-tools && firebase init hosting` (carpeta `dist`) y `firebase deploy`.
- Recuerda añadir el dominio final en **Authentication → Configuración → Dominios autorizados**.
