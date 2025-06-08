-- ESQUEMA COMPLETO PARA VIENTOSUR (Supabase)
-- Eliminar tablas si existen (orden inverso de dependencias)
drop table if exists group_members cascade;
drop table if exists groups cascade;
drop table if exists messages cascade;
drop table if exists favoritos_post cascade;
drop table if exists reacciones_post cascade;
drop table if exists comentarios_post cascade;
drop table if exists posts cascade;
drop table if exists comentarios_evento cascade;
drop table if exists reacciones_evento cascade;
drop table if exists eventos cascade;
drop table if exists tareas cascade;
drop table if exists cumpleanos cascade;
drop table if exists comentarios_blog cascade;
drop table if exists reacciones_blog cascade;
drop table if exists publicaciones cascade;
drop table if exists portfolio cascade;
drop table if exists gallery cascade;
drop table if exists followers cascade;
drop table if exists usuarios cascade;

-- Extensiones necesarias
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists intarray;
create extension if not exists "unaccent";

-- Tabla de usuarios (ajuste para compatibilidad con el formulario de cumpleaños y frontend)
create table if not exists usuarios (
  id uuid primary key, -- No default, debe ser igual al id de Supabase Auth
  email text unique not null,
  nombre_usuario text unique not null,
  nombre_completo text not null,
  avatar_url text,
  cover_image text,
  bio text,
  website text,
  disciplines text[] default '{}',
  social_links jsonb default '[]',
  telefono text,
  rol text,
  trayectoria text,
  created_at timestamptz default now()
);

alter table usuarios enable row level security;
drop policy if exists "Usuarios pueden crear su propio perfil" on usuarios;
create policy "Usuarios pueden crear su propio perfil" on usuarios for insert with check (auth.uid() = id);
drop policy if exists "Usuarios pueden ver su perfil" on usuarios;
create policy "Usuarios pueden ver todos los perfiles" on usuarios for select using (true);
drop policy if exists "Usuarios pueden modificar su perfil" on usuarios;
create policy "Usuarios pueden modificar su perfil" on usuarios for update using (auth.uid() = id);

-- Tabla de seguidores
create table if not exists followers (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references usuarios(id) on delete cascade,
  following_id uuid references usuarios(id) on delete cascade,
  created_at timestamptz default now(),
  constraint unique_follower unique (follower_id, following_id)
);
alter table followers enable row level security;
-- Políticas de followers (ajuste para permitir ver seguidores de cumpleaños y compatibilidad con frontend)
drop policy if exists "Ver seguidores" on followers;
create policy "Ver seguidores" on followers for select using (true);
drop policy if exists "Gestionar seguidores propios" on followers;
create policy "Gestionar seguidores propios" on followers for all using (auth.uid() = follower_id or auth.uid() = following_id) with check (auth.uid() = follower_id);

-- Portafolio (ajuste para compatibilidad con cumpleaños y frontend)
create table if not exists portfolio (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references usuarios(id) on delete cascade,
  title text not null,
  description text,
  image_url text not null,
  location text,
  date date,
  multimedia_url text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table portfolio enable row level security;
drop policy if exists "Ver portafolio" on portfolio;
create policy "Ver portafolio" on portfolio for select using (true);
drop policy if exists "Gestionar portafolio propio" on portfolio;
create policy "Gestionar portafolio propio" on portfolio for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Galería
create table if not exists gallery (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references usuarios(id) on delete cascade,
  image_url text not null,
  description text,
  created_at timestamptz default now()
);
alter table gallery enable row level security;
drop policy if exists "Ver galería" on gallery;
create policy "Ver galería" on gallery for select using (true);
drop policy if exists "Gestionar galería propia" on gallery;
create policy "Gestionar galería propia" on gallery for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Publicaciones (blogs, noticias, etc)
create table if not exists publicaciones (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  excerpt text,
  imagen_portada text,
  categoria text,
  tipo text not null check (tipo in ('blog', 'noticia')),
  publicado_en timestamptz default now(),
  autor_id uuid references usuarios(id) on delete set null,
  contenido text not null,
  metadata jsonb default '{}',
  constraint unique_blog_title_per_author unique (titulo, autor_id, tipo)
);

alter table publicaciones enable row level security;
drop policy if exists "Ver publicaciones" on publicaciones;
create policy "Ver publicaciones" on publicaciones for select using (true);
drop policy if exists "Gestionar publicaciones propias" on publicaciones;
create policy "Gestionar publicaciones propias" on publicaciones for all using (auth.uid() = autor_id) with check (auth.uid() = autor_id);
drop policy if exists "Insertar publicaciones propias" on publicaciones;
create policy "Insertar publicaciones propias" on publicaciones for insert with check (auth.uid() = autor_id);


-- Comentarios en blogs
create table if not exists comentarios_blog (
  id uuid primary key default gen_random_uuid(),
  publicacion_id uuid references publicaciones(id) on delete cascade,
  autor_id uuid not null references usuarios(id) on delete cascade,
  contenido text not null,
  creado_en timestamptz default now()
);
alter table comentarios_blog enable row level security;
drop policy if exists "Ver comentarios blog" on comentarios_blog;
create policy "Ver comentarios blog" on comentarios_blog for select using (true);
drop policy if exists "Insertar comentarios propios blog" on comentarios_blog;
create policy "Insertar comentarios propios blog" on comentarios_blog for insert with check (auth.uid() = autor_id);
drop policy if exists "Actualizar comentarios propios blog" on comentarios_blog;
create policy "Actualizar comentarios propios blog" on comentarios_blog for update using (auth.uid() = autor_id);
drop policy if exists "Borrar comentarios propios blog" on comentarios_blog;
create policy "Borrar comentarios propios blog" on comentarios_blog for delete using (auth.uid() = autor_id);

-- Reacciones a blogs
create table if not exists reacciones_blog (
  id uuid primary key default gen_random_uuid(),
  publicacion_id uuid references publicaciones(id) on delete cascade,
  usuario_id uuid not null references usuarios(id) on delete cascade,
  tipo text not null check (tipo in ('like')),
  creado_en timestamptz default now(),
  constraint unique_blog_like unique (publicacion_id, usuario_id, tipo)
);
alter table reacciones_blog enable row level security;
drop policy if exists "Ver reacciones blog" on reacciones_blog;
create policy "Ver reacciones blog" on reacciones_blog for select using (true);
drop policy if exists "Insertar reacciones propias blog" on reacciones_blog;
create policy "Insertar reacciones propias blog" on reacciones_blog for insert with check (auth.uid() = usuario_id);
drop policy if exists "Actualizar reacciones propias blog" on reacciones_blog;
create policy "Actualizar reacciones propias blog" on reacciones_blog for update using (auth.uid() = usuario_id);
drop policy if exists "Borrar reacciones propias blog" on reacciones_blog;
create policy "Borrar reacciones propias blog" on reacciones_blog for delete using (auth.uid() = usuario_id);

-- Eventos culturales y agenda (ajustar para compatibilidad con cumpleaños y otros flujos)
create table if not exists eventos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  tipo text not null, -- 'birthday', 'evento', etc
  categoria text,
  fecha_inicio timestamptz not null,
  ubicacion text,
  imagen_url text,
  creador_id uuid references usuarios(id) on delete set null,
  estado text not null default 'publicado',
  precio numeric default 0,
  metadata jsonb,
  creado_en timestamptz default now()
);

alter table eventos enable row level security;
drop policy if exists "Ver eventos" on eventos;
create policy "Ver eventos" on eventos for select using (true);
drop policy if exists "Gestionar eventos propios" on eventos;
create policy "Gestionar eventos propios" on eventos for all using (auth.uid() = creador_id) with check (auth.uid() = creador_id);

-- Comentarios en eventos
create table if not exists comentarios_evento (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid references eventos(id) on delete cascade,
  autor_id uuid references usuarios(id) on delete set null,
  contenido text not null,
  creado_en timestamptz default now()
);
alter table comentarios_evento enable row level security;
drop policy if exists "Ver comentarios evento" on comentarios_evento;
create policy "Ver comentarios evento" on comentarios_evento for select using (true);
drop policy if exists "Gestionar comentarios propios evento" on comentarios_evento;
create policy "Gestionar comentarios propios evento" on comentarios_evento for all using (auth.uid() = autor_id) with check (auth.uid() = autor_id);

-- Reacciones a eventos
create table if not exists reacciones_evento (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid references eventos(id) on delete cascade,
  usuario_id uuid references usuarios(id) on delete cascade,
  creado_en timestamptz default now(),
  constraint unique_event_like unique (evento_id, usuario_id)
);
alter table reacciones_evento enable row level security;
drop policy if exists "Ver reacciones evento" on reacciones_evento;
create policy "Ver reacciones evento" on reacciones_evento for select using (true);
drop policy if exists "Gestionar reacciones propias evento" on reacciones_evento;
create policy "Gestionar reacciones propias evento" on reacciones_evento for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

-- Cumpleaños (ajustado a los campos del formulario y frontend)
create table if not exists cumpleanos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  usuario_id uuid not null references usuarios(id) on delete cascade,
  fecha_nacimiento date not null,
  mensaje text not null,
  imagen_url text,
  multimedia_url text[],
  disciplina text,
  rol text,
  email text,
  telefono text,
  trayectoria text,
  creado_en timestamptz default now()
);

alter table cumpleanos enable row level security;
drop policy if exists "Insertar cumpleaños propio" on cumpleanos;
create policy "Insertar cumpleaños propio" on cumpleanos for insert with check (
  (auth.uid() = usuario_id and usuario_id is not null)
);
drop policy if exists "Ver cumpleaños" on cumpleanos;
create policy "Ver cumpleaños" on cumpleanos for select using (auth.uid() = usuario_id);
drop policy if exists "Actualizar cumpleaños propio" on cumpleanos;
create policy "Actualizar cumpleaños propio" on cumpleanos for update using (
  auth.uid() = usuario_id and usuario_id is not null
);
drop policy if exists "Borrar cumpleaños propio" on cumpleanos;
create policy "Borrar cumpleaños propio" on cumpleanos for delete using (auth.uid() = usuario_id);

-- Comentarios en cumpleaños (opcional, para permitir comentarios en cumpleaños)
create table if not exists comentarios_cumpleanos (
  id uuid primary key default gen_random_uuid(),
  cumpleanos_id uuid references cumpleanos(id) on delete cascade,
  autor_id uuid references usuarios(id) on delete set null,
  contenido text not null,
  creado_en timestamptz default now()
);
alter table comentarios_cumpleanos enable row level security;
drop policy if exists "Ver comentarios cumpleanos" on comentarios_cumpleanos;
create policy "Ver comentarios cumpleanos" on comentarios_cumpleanos for select using (true);
drop policy if exists "Gestionar comentarios propios cumpleanos" on comentarios_cumpleanos;
create policy "Gestionar comentarios propios cumpleanos" on comentarios_cumpleanos for all using (auth.uid() = autor_id) with check (auth.uid() = autor_id);

-- Reacciones a cumpleaños (opcional, para permitir likes en cumpleaños)
create table if not exists reacciones_cumpleanos (
  id uuid primary key default gen_random_uuid(),
  cumpleanos_id uuid references cumpleanos(id) on delete cascade,
  usuario_id uuid references usuarios(id) on delete cascade,
  tipo text not null check (tipo in ('like')),
  creado_en timestamptz default now(),
  constraint unique_cumple_like unique (cumpleanos_id, usuario_id, tipo)
);
alter table reacciones_cumpleanos enable row level security;
drop policy if exists "Ver reacciones cumpleanos" on reacciones_cumpleanos;
create policy "Ver reacciones cumpleanos" on reacciones_cumpleanos for select using (true);
drop policy if exists "Gestionar reacciones propias cumpleanos" on reacciones_cumpleanos;
create policy "Gestionar reacciones propias cumpleanos" on reacciones_cumpleanos for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

-- Tareas culturales
create table if not exists tareas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  fecha_limite timestamptz not null,
  estado text not null check (estado in ('pendiente', 'en_progreso', 'completada')),
  prioridad text not null check (prioridad in ('baja', 'media', 'alta')),
  asignada_a text not null,
  descripcion text not null,
  creador_id uuid references usuarios(id) on delete set null,
  created_at timestamptz default now()
);
alter table tareas enable row level security;
drop policy if exists "Ver tareas propias o asignadas" on tareas;
create policy "Ver tareas propias o asignadas" on tareas for select using (creador_id = auth.uid() or asignada_a ilike '%' || (auth.uid()::text) || '%');
drop policy if exists "Gestionar tareas propias o asignadas" on tareas;
create policy "Gestionar tareas propias o asignadas" on tareas for all using (creador_id = auth.uid() or asignada_a ilike '%' || (auth.uid()::text) || '%');

-- Posts (feed, stories, etc)
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid references usuarios(id) on delete set null,
  tipo text not null check (tipo in ('text', 'image', 'video', 'audio', 'document', 'story')),
  contenido text,
  multimedia_url text[],
  creado_en timestamptz default now(),
  actualizado_en timestamptz default now()
);
alter table posts enable row level security;
drop policy if exists "Ver posts" on posts;
create policy "Ver posts" on posts for select using (true);
drop policy if exists "Gestionar posts propios" on posts;
create policy "Gestionar posts propios" on posts for all using (auth.uid() = autor_id) with check (auth.uid() = autor_id);

-- Comentarios en posts
create table if not exists comentarios_post (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  autor_id uuid references usuarios(id) on delete set null,
  contenido text not null,
  creado_en timestamptz default now()
);
alter table comentarios_post enable row level security;
drop policy if exists "Ver comentarios post" on comentarios_post;
create policy "Ver comentarios post" on comentarios_post for select using (true);
drop policy if exists "Gestionar comentarios propios post" on comentarios_post;
create policy "Gestionar comentarios propios post" on comentarios_post for all using (auth.uid() = autor_id) with check (auth.uid() = autor_id);

-- Reacciones a posts
create table if not exists reacciones_post (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  usuario_id uuid references usuarios(id) on delete cascade,
  tipo text not null check (tipo in ('like')),
  creado_en timestamptz default now(),
  constraint unique_post_like unique (post_id, usuario_id, tipo)
);
alter table reacciones_post enable row level security;
drop policy if exists "Ver reacciones post" on reacciones_post;
create policy "Ver reacciones post" on reacciones_post for select using (true);
drop policy if exists "Gestionar reacciones propias post" on reacciones_post;
create policy "Gestionar reacciones propias post" on reacciones_post for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

-- Grupos de chat
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_url text,
  created_by uuid references usuarios(id) on delete set null,
  created_at timestamptz default now()
);
alter table groups enable row level security;
drop policy if exists "Ver grupos" on groups;
create policy "Ver grupos" on groups for select using (true);
drop policy if exists "Gestionar grupos propios" on groups;
create policy "Gestionar grupos propios" on groups for all using (created_by = auth.uid()) with check (created_by = auth.uid());

-- Miembros de grupo (mover antes de cualquier tabla que los use)
create table if not exists group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references usuarios(id) on delete cascade,
  joined_at timestamptz default now(),
  constraint unique_group_member unique (group_id, user_id)
);
alter table group_members enable row level security;
drop policy if exists "Ver miembros de grupo" on group_members;
create policy "Ver miembros de grupo" on group_members for select using (user_id = auth.uid());
drop policy if exists "Gestionar membresía propia" on group_members;
create policy "Gestionar membresía propia" on group_members for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Mensajes (chat 1 a 1 y grupal)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references usuarios(id) on delete set null,
  receiver_id uuid references usuarios(id) on delete set null,
  group_id uuid references groups(id) on delete cascade,
  content text,
  file_url text,
  audio_url text,
  video_url text,
  sticker_url text,
  read boolean default false,
  reply_to jsonb,
  created_at timestamptz default now()
);
alter table messages enable row level security;
drop policy if exists "Ver mensajes propios" on messages;
create policy "Ver mensajes propios" on messages for select using (
  sender_id = auth.uid() or receiver_id = auth.uid() or (
    group_id in (select group_id from group_members where user_id = auth.uid())
  )
);
drop policy if exists "Gestionar mensajes propios" on messages;
create policy "Gestionar mensajes propios" on messages for all using (sender_id = auth.uid());

-- Favoritos de post (ejemplo de tabla de relación, robusta y con IF NOT EXISTS)
create table if not exists favoritos_post (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  usuario_id uuid references usuarios(id) on delete cascade,
  creado_en timestamptz default now(),
  constraint unique_favorito_post unique (post_id, usuario_id)
);
alter table favoritos_post enable row level security;
drop policy if exists "Ver favoritos" on favoritos_post;
create policy "Ver favoritos" on favoritos_post for select using (true);
drop policy if exists "Gestionar favoritos propios" on favoritos_post;
create policy "Gestionar favoritos propios" on favoritos_post for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

-- Favoritos de cumpleaños (opcional, para permitir guardar cumpleaños favoritos)
create table if not exists favoritos_cumpleanos (
  id uuid primary key default gen_random_uuid(),
  cumpleanos_id uuid references cumpleanos(id) on delete cascade,
  usuario_id uuid references usuarios(id) on delete cascade,
  creado_en timestamptz default now(),
  constraint unique_favorito_cumple unique (cumpleanos_id, usuario_id)
);
alter table favoritos_cumpleanos enable row level security;
drop policy if exists "Ver favoritos cumpleanos" on favoritos_cumpleanos;
create policy "Ver favoritos cumpleanos" on favoritos_cumpleanos for select using (true);
drop policy if exists "Gestionar favoritos propios cumpleanos" on favoritos_cumpleanos;
create policy "Gestionar favoritos propios cumpleanos" on favoritos_cumpleanos for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

-- FIN DEL ESQUEMA COMPLETO
