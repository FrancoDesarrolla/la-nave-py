# La Nave PY — primeros pasos

Este es el código inicial de la web app: pantalla de inicio de sesión / registro,
ya conectada a tu base de datos de Supabase, más un panel de bienvenida.

## Qué incluye esta primera versión
- Registro de usuarios (crea también su fila en la tabla `usuarios`)
- Inicio de sesión
- Panel principal con las secciones que vamos a ir completando

## Cómo subirlo a GitHub (sin usar la terminal)
1. Entrá a github.com, iniciá sesión, y creá un repositorio nuevo (botón "New").
   Nombralo `la-nave-py`. Dejalo en blanco (sin README, sin .gitignore).
2. Dentro del repositorio vacío, hacé clic en "uploading an existing file".
3. Arrastrá TODOS los archivos y carpetas de esta carpeta (manteniendo la
   estructura de carpetas: `app/`, `lib/`, `public/`, etc.) y confirmá el commit.

## Cómo conectarlo a Vercel
1. En vercel.com, "Add New" → "Project" → elegí el repositorio `la-nave-py`.
2. Antes de hacer clic en "Deploy", abrí "Environment Variables" y agregá:
   - `NEXT_PUBLIC_SUPABASE_URL` = https://adybaykvvdhmgfpuosxs.supabase.co
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = sb_publishable_Oo60bFunpVwC7mPPpF-BwQ__yBNg2RG
3. Hacé clic en "Deploy". En un par de minutos te da un link (algo como
   `la-nave-py.vercel.app`) donde ya podés probar el registro y el login.

Cualquier error que te aparezca en Vercel durante el "Deploy", mandame captura
del mensaje y lo resolvemos.
