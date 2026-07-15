<div align="center">

# NextStep

**Tablero Kanban minimalista para organizar el flujo de tus proyectos.**

Sin completar → En proceso → Finalizadas, con cada proyecto en su propio flujo independiente.

[Demo en vivo](#) · [Reportar un problema](../../issues)

</div>

---

## Sobre el proyecto

NextStep es una app de gestión de tareas estilo Kanban pensada para organizar varios proyectos a la vez sin que sus tareas se mezclen entre sí. Cada proyecto tiene su propio tablero de tres columnas (Sin completar, En proceso, Finalizadas), con arrastrar y soltar, prioridades, fechas límite y sincronización en tiempo real vía Firebase.

Construida con una interfaz completamente animada, en un estilo editorial minimalista, con soporte real para escritorio y móvil (no solo un layout responsive: en pantallas pequeñas el tablero cambia a un patrón de pestañas + botones de mover, ya que el drag & drop no es viable en táctil).

## Características

- **Proyectos independientes** — cada proyecto tiene su propio flujo; las tareas nunca se mezclan entre proyectos distintos.
- **Tablero Kanban con drag & drop** (dnd-kit), con detección de la columna sobre la que arrastras y expansión automática del área de destino.
- **Prioridades, fechas límite y descripciones** por tarea, con indicador visual de tareas vencidas.
- **Ordenar y buscar** tareas dentro de cada columna (por prioridad, fecha de creación o fecha límite) y buscador en tiempo real.
- **Vista de detalle** de cada tarea con edición rápida de estado y prioridad desde un popup.
- **Modo claro / oscuro** con persistencia de la preferencia del usuario.
- **Diseño responsive real**: en móvil el tablero cambia a pestañas de estado con botones ← → para mover tareas, ya que arrastrar con el dedo no funciona bien con columnas apiladas.
- **Autenticación con Google** (Firebase Authentication) y datos sincronizados en tiempo real con **Firestore** — cada usuario solo ve sus propios proyectos y tareas.
- Animaciones cuidadas en toda la interfaz con Framer Motion.

## Capturas

> _Añade aquí capturas de pantalla del tablero, el modo oscuro y la vista móvil._

## Stack

| Categoría | Tecnología |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| Estilos | Tailwind CSS v4 |
| Animaciones | Framer Motion |
| Drag & drop | dnd-kit |
| Backend | Firebase (Authentication + Firestore) |
| Despliegue | Vercel |

## Empezar en local

```bash
npm install
npm run dev
```

La app necesita Firebase configurado para poder iniciar sesión (no tiene modo sin conexión) — sigue los pasos de abajo antes de arrancar.

### Configurar Firebase

1. Crea un proyecto en [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication → Método de acceso → Google → Habilitar.**
3. **Firestore Database → Crear base de datos** (modo producción).
4. En **Configuración del proyecto → Tus apps**, registra una app web y copia la configuración.
5. Copia `.env.example` a `.env.local` y rellena los valores.
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

7. Reinicia `npm run dev`. El botón "Continuar con Google" sincronizará las tareas en Firestore (`users/{uid}/tasks` y `users/{uid}/projects`).

## Desplegar

```bash
npm run build       # genera dist/
```

- **Vercel / Netlify:** importa el repositorio, añade las variables `VITE_FIREBASE_*` en el panel del proyecto y despliega.
- **Firebase Hosting:** `npm i -g firebase-tools && firebase init hosting` (carpeta `dist`) y `firebase deploy`.
- Añade el dominio final en **Authentication → Configuración → Dominios autorizados** en Firebase, o el login con Google fallará en producción.

## Estructura del proyecto

```
src/
├── components/     # Componentes de UI (Board, Column, TaskCard, modales...)
├── hooks/          # useAuth, useTasks, useProjects, useMediaQuery
├── firebase.ts     # Inicialización de Firebase
└── types.ts        # Tipos compartidos y utilidades de ordenación
```

## Licencia

Proyecto personal — sin licencia específica definida todavía.
