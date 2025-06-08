-- Crear tabla posts para separar de blogs
create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  autor_id uuid references usuarios(id) on delete cascade,
  tipo text not null, -- text, image, video, audio, document
  contenido text,
  multimedia_url text[],
  creado_en timestamptz default now(),
  actualizado_en timestamptz default now()
);

-- Comentarios para posts
create table if not exists comentarios_post (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references posts(id) on delete cascade,
  autor_id uuid references usuarios(id) on delete cascade,
  contenido text not null,
  creado_en timestamptz default now(),
  actualizado_en timestamptz default now()
);

-- Reacciones para posts
create table if not exists reacciones_post (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid references usuarios(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  tipo text not null,
  creado_en timestamptz default now(),
  unique(usuario_id, post_id)
);

-- Favoritos para posts
create table if not exists favoritos_post (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid references usuarios(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  creado_en timestamptz default now(),
  unique(usuario_id, post_id)
);

-- Habilitar RLS y políticas según sea necesario
