create table categorias (
  id text primary key,
  nombre text not null,
  imagen text,
  visible boolean not null default true,
  orden int not null default 0
);

create table productos (
  id uuid primary key default gen_random_uuid(),
  categoria_id text not null references categorias(id) on update cascade,
  nombre text not null,
  descripcion text,
  precio numeric,
  medidas text,
  entrega text,
  imagen text,
  visible boolean not null default true,
  imagenes text[] not null default '{}',
  creado timestamptz not null default now()
);

create table faq (
  id uuid primary key default gen_random_uuid(),
  pregunta text not null,
  respuesta text not null,
  visible boolean not null default true,
  orden int not null default 0
);

create table secciones (
  clave text primary key,
  titulo text not null,
  texto text,
  visible boolean not null default false
);

create table portada (
  id uuid primary key default gen_random_uuid(),
  imagen text not null,
  descripcion text,
  visible boolean not null default true,
  orden int not null default 0
);

-- Solo el backend (con la clave secreta) puede leer y escribir
alter table categorias enable row level security;
alter table productos enable row level security;
alter table faq enable row level security;
alter table secciones enable row level security;
alter table portada enable row level security;

-- Datos iniciales
insert into categorias (id, nombre, visible, orden) values
  ('living', 'Living', true, 1),
  ('dormitorio', 'Dormitorio', true, 2),
  ('cocina', 'Cocina', true, 3),
  ('bano', 'Baño', true, 4);

insert into secciones (clave, titulo, texto, visible) values
  ('sobre', 'Sobre nosotros', 'Contá acá quiénes son y cómo trabajan.', false);

insert into faq (pregunta, respuesta, orden) values
  ('¿Cómo hago un pedido?', 'Elegí tu mueble en el catálogo, agregalo al carrito y enviá el pedido por WhatsApp. Ahí confirmamos medidas, color, precio y plazo.', 1),
  ('¿Dónde están ubicados?', 'Estamos en Rodeo del Medio, Maipú, Mendoza. La ubicación exacta te la enviamos por WhatsApp.', 2),
  ('¿Cómo se coordina la entrega?', 'Cuando el pedido se confirma, te enviamos la ubicación exacta por WhatsApp y acordamos día y horario de retiro.', 3),
  ('¿Hacen envíos?', 'Por ahora no.', 4),
  ('¿De qué material son los muebles?', 'Todos se fabrican en MDF.', 5),
  ('¿Vienen pintados?', 'Por ahora no. Si querés un color, consultalo por WhatsApp.', 6),
  ('¿Cuánto tarda la fabricación?', 'Todo se hace por encargo. El plazo se confirma por WhatsApp.', 7),
  ('¿Los precios son finales?', 'Son orientativos y se confirman por WhatsApp, porque pueden variar según las medidas.', 8),
  ('¿Puedo pedir un mueble a medida?', 'Sí, desde la sección A medida contanos qué necesitás.', 9),
  ('¿Se puede visitar el taller?', 'Se atiende con cita previa.', 10);