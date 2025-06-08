/*
  # Esquema inicial de Red Viento Sur

  1. Nuevas Tablas
    - `usuarios` - Información de usuarios y gestores culturales
    - `perfiles` - Perfiles extendidos de usuarios
    - `eventos` - Eventos culturales
    - `artistas` - Directorio de artistas
    - `publicaciones` - Publicaciones y contenido
    - `comentarios` - Comentarios en publicaciones
    - `reacciones` - Reacciones a publicaciones
    - `favoritos` - Contenido guardado
    - `etiquetas` - Etiquetas para eventos y publicaciones
    - `contenido_etiquetas` - Relación entre contenido y etiquetas

  2. Seguridad
    - RLS habilitado en todas las tablas
    - Políticas de acceso basadas en roles
    - Protección de datos sensibles
*/

-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";
-- pg_crypto is not available, using pgcrypto instead
create extension if not exists "pgcrypto";

-- Tabla de usuarios (extiende auth.users)
create table if not exists usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_usuario text unique not null,
  nombre_completo text not null,
  avatar_url text,
  rol text not null default 'gestor',
  verificado boolean default false,
  creado_en timestamptz default now(),
  actualizado_en timestamptz default now()
);

-- Perfiles extendidos
create table if not exists perfiles (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid references usuarios(id) on delete cascade,
  biografia text,
  sitio_web text,
  ubicacion text,
  redes_sociales jsonb default '{}',
  areas_interes text[],
  creado_en timestamptz default now(),
  actualizado_en timestamptz default now()
);

-- Eventos culturales
create table if not exists eventos (
  id uuid primary key default uuid_generate_v4(),
  creador_id uuid references usuarios(id) on delete cascade,
  titulo text not null,
  descripcion text,
  tipo text not null,
  fecha_inicio timestamptz not null,
  fecha_fin timestamptz,
  ubicacion text,
  direccion text,
  imagen_url text,
  capacidad integer,
  estado text default 'borrador',
  precio numeric(10,2),
  categoria text,
  creado_en timestamptz default now(),
  actualizado_en timestamptz default now()
);

-- Directorio de artistas
create table if not exists artistas (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  biografia text,
  disciplina text[],
  imagen_url text,
  contacto jsonb,
  redes_sociales jsonb default '{}',
  agregado_por uuid references usuarios(id),
  creado_en timestamptz default now(),
  actualizado_en timestamptz default now()
);

-- Publicaciones
create table if not exists publicaciones (
  id uuid primary key default uuid_generate_v4(),
  autor_id uuid references usuarios(id) on delete cascade,
  tipo text not null,
  contenido text,
  multimedia_url text[],
  evento_id uuid references eventos(id),
  artista_id uuid references artistas(id),
  creado_en timestamptz default now(),
  actualizado_en timestamptz default now()
);

-- Comentarios
create table if not exists comentarios (
  id uuid primary key default uuid_generate_v4(),
  publicacion_id uuid references publicaciones(id) on delete cascade,
  autor_id uuid references usuarios(id) on delete cascade,
  contenido text not null,
  creado_en timestamptz default now(),
  actualizado_en timestamptz default now()
);

-- Reacciones
create table if not exists reacciones (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid references usuarios(id) on delete cascade,
  publicacion_id uuid references publicaciones(id) on delete cascade,
  tipo text not null,
  creado_en timestamptz default now(),
  unique(usuario_id, publicacion_id)
);

-- Favoritos
create table if not exists favoritos (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid references usuarios(id) on delete cascade,
  publicacion_id uuid references publicaciones(id) on delete cascade,
  creado_en timestamptz default now(),
  unique(usuario_id, publicacion_id)
);

-- Etiquetas
create table if not exists etiquetas (
  id uuid primary key default uuid_generate_v4(),
  nombre text unique not null,
  creado_en timestamptz default now()
);

-- Relación contenido-etiquetas
create table if not exists contenido_etiquetas (
  id uuid primary key default uuid_generate_v4(),
  etiqueta_id uuid references etiquetas(id) on delete cascade,
  publicacion_id uuid references publicaciones(id) on delete cascade,
  evento_id uuid references eventos(id) on delete cascade,
  creado_en timestamptz default now(),
  check (
    (publicacion_id is not null and evento_id is null) or
    (publicacion_id is null and evento_id is not null)
  )
);

-- Habilitar Row Level Security
alter table usuarios enable row level security;
alter table perfiles enable row level security;
alter table eventos enable row level security;
alter table artistas enable row level security;
alter table publicaciones enable row level security;
alter table comentarios enable row level security;
alter table reacciones enable row level security;
alter table favoritos enable row level security;
alter table etiquetas enable row level security;
alter table contenido_etiquetas enable row level security;

-- Políticas de seguridad

-- Usuarios
create policy "Usuarios pueden ver perfiles públicos"
  on usuarios for select
  using (true);

create policy "Usuarios pueden editar su propio perfil"
  on usuarios for update
  using (auth.uid() = id);

-- Perfiles
create policy "Perfiles son visibles públicamente"
  on perfiles for select
  using (true);

create policy "Usuarios pueden editar su propio perfil extendido"
  on perfiles for all
  using (auth.uid() = usuario_id);

-- Eventos
create policy "Eventos públicos son visibles para todos"
  on eventos for select
  using (estado = 'publicado' or auth.uid() = creador_id);

create policy "Creadores pueden gestionar sus eventos"
  on eventos for all
  using (auth.uid() = creador_id);

-- Artistas
create policy "Directorio de artistas es público"
  on artistas for select
  using (true);

create policy "Gestores pueden agregar y editar artistas"
  on artistas for all
  using (
    exists (
      select 1 from usuarios
      where id = auth.uid()
      and rol = 'gestor'
    )
  );

-- Publicaciones
create policy "Publicaciones públicas son visibles para todos"
  on publicaciones for select
  using (true);

create policy "Autores pueden gestionar sus publicaciones"
  on publicaciones for all
  using (auth.uid() = autor_id);

-- Comentarios
create policy "Comentarios son visibles públicamente"
  on comentarios for select
  using (true);

create policy "Usuarios pueden crear comentarios"
  on comentarios for insert
  with check (auth.uid() = autor_id);

create policy "Autores pueden eliminar sus comentarios"
  on comentarios for delete
  using (auth.uid() = autor_id);

-- Reacciones
create policy "Reacciones son visibles públicamente"
  on reacciones for select
  using (true);

create policy "Usuarios pueden gestionar sus reacciones"
  on reacciones for all
  using (auth.uid() = usuario_id);

-- Favoritos
create policy "Usuarios pueden ver sus favoritos"
  on favoritos for select
  using (auth.uid() = usuario_id);

create policy "Usuarios pueden gestionar sus favoritos"
  on favoritos for all
  using (auth.uid() = usuario_id);

-- Etiquetas
create policy "Etiquetas son públicas"
  on etiquetas for select
  using (true);

create policy "Gestores pueden crear etiquetas"
  on etiquetas for insert
  with check (
    exists (
      select 1 from usuarios
      where id = auth.uid()
      and rol = 'gestor'
    )
  );

-- Contenido-etiquetas
create policy "Relaciones de etiquetas son públicas"
  on contenido_etiquetas for select
  using (true);

create policy "Autores pueden etiquetar su contenido"
  on contenido_etiquetas for insert
  with check (
    exists (
      select 1 from publicaciones
      where id = publicacion_id
      and autor_id = auth.uid()
    ) or
    exists (
      select 1 from eventos
      where id = evento_id
      and creador_id = auth.uid()
    )
  );