project-root/
├─ src/
│  ├─ app/
│  │  ├─ App.jsx            # App shell (providers, layout)
│  │  └─ index.jsx          # App bootstrap
│  │
│  ├─ routes/
│  │  └─ index.jsx          # Route definitions
│  │
│  ├─ features/
│  │  ├─ auth/
│  │  │  ├─ pages/
│  │  │  │  └─ LoginPage.jsx        # Login PAGE (View)
│  │  │  ├─ components/
│  │  │  │  └─ LoginForm.jsx        # UI only
│  │  │  ├─ hooks/
│  │  │  │  └─ useLogin.js          # Controller logic
│  │  │  ├─ auth.api.js             # API calls (Model)
│  │  │  └─ auth.schema.js          # Validation
│  │  │
│  │  └─ dashboard/
│  │     ├─ pages/
│  │     ├─ components/
│  │     └─ hooks/
│  │
│  ├─ services/
│  │  └─ http.js             # Axios / fetch wrapper
│  │
│  ├─ shared/
│  │  ├─ components/         # Reusable UI (Button, Input)
│  │  ├─ hooks/
│  │  └─ utils/
│  │
│  ├─ styles/
│  │  └─ globals.css
│  │
│  └─ main.jsx               # React entry point
│
├─ public/
├─ package.json
└─ vite.config.js / webpack.config.js