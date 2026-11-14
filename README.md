Valquir Muebles

Sistema de e-commerce y panel de administración para una mueblería que trabaja por encargo. Los clientes recorren el catálogo, arman su pedido en un carrito y lo envían por WhatsApp. El dueño del negocio gestiona todo el contenido desde un panel propio, sin tocar código.

🌐 Web en vivo: valquir-muebles-frontend.vercel.app

Funciones principales
Para los clientes
Catálogo organizado por categorías: living, dormitorio, cocina y baño.
Navegación con migas de pan (Inicio > Catálogo > Categoría) y filtros en español, incluido el orden por precio.
Varias imágenes por mueble, para ver distintos ángulos.
Carrito simbólico: el pedido se arma en la web y se envía por WhatsApp.
Pedido de presupuesto para muebles a medida.
Preguntas frecuentes (cómo pedir, ubicación, coordinación de la entrega).
Portada con muebles que pasan como diapositivas.
Botón flotante de WhatsApp y diseño adaptable a celular.
Para el administrador
Panel con inicio de sesión.
Alta, edición y baja de muebles, con descripción, precio, categoría y varias imágenes.
Tiempo de entrega opcional por mueble.
Preguntas frecuentes editables.

Tecnologías

Parte	Tecnologías
Frontend	[completar: ej. HTML, CSS y JavaScript / React]
Backend	Node.js [+ Express, completar si corresponde]
Base de datos y almacenamiento de imágenes	Supabase
Despliegue	Vercel (frontend) y Render (backend)
Estructura del proyecto
Valquir-muebles/
├── frontend/   # Sitio público para los clientes
├── backend/    # API y conexión con Supabase
└── admin/      # Panel de administración
Cómo ejecutarlo en local
Requisitos
Node.js [versión, ej. 18 o superior]
Una cuenta y un proyecto en Supabase
Pasos
Clonar el repositorio:
bash
git clone https://github.com/BrendaAlcoba/Valquir-muebles.git
cd Valquir-muebles
Configurar el backend. Crear un archivo .env dentro de backend/ con tus propias credenciales de Supabase:
SUPABASE_URL=tu_url
SUPABASE_KEY=tu_clave

Después instalar y arrancar:

bash
cd backend
npm install
npm run dev
Arrancar el frontend:
bash
cd frontend
npm install
npm run dev
Arrancar el panel de administración:
bash
cd admin
npm install
npm run dev

Los archivos .env no se suben al repositorio. Cada persona debe crear el suyo.

Estado del proyecto

En desarrollo.
