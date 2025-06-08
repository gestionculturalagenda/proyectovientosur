-- Tabla publicaciones para blog
create table if not exists publicaciones (
  id uuid primary key default uuid_generate_v4(),
  autor_id uuid references usuarios(id) on delete cascade,
  titulo text not null,
  contenido text,
  excerpt text,
  imagen_portada text,
  categoria text,
  tiempo_lectura integer,
  likes integer default 0,
  comentarios integer default 0,
  publicado_en timestamptz default now(),
  actualizado_en timestamptz default now()
);

-- Habilitar Row Level Security
alter table publicaciones enable row level security;

-- Permitir a cualquier usuario autenticado ver todas las publicaciones
create policy "Publicaciones públicas son visibles para todos"
  on publicaciones for select
  using (true);

-- Permitir a los autores gestionar (insertar, actualizar, eliminar) sus propias publicaciones
create policy "Autores pueden gestionar sus publicaciones"
  on publicaciones for all
  using (auth.uid() = autor_id);

-- Permitir a los usuarios autenticados crear publicaciones
create policy "Usuarios pueden crear publicaciones"
  on publicaciones for insert
  with check (auth.uid() = autor_id);
