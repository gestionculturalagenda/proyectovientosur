-- Permitir posts tipo red social y blogs en tablas separadas
-- 1. Hacer campos de blog opcionales en publicaciones
alter table publicaciones alter column titulo drop not null;
alter table publicaciones alter column excerpt drop not null;
alter table publicaciones alter column imagen_portada drop not null;
alter table publicaciones alter column categoria drop not null;
alter table publicaciones alter column tiempo_lectura drop not null;

-- 2. (Opcional) Si quieres, puedes crear una tabla "posts" solo para posts sociales
-- create table if not exists posts (
--   id uuid primary key default uuid_generate_v4(),
--   autor_id uuid references usuarios(id) on delete cascade,
--   tipo text not null,
--   contenido text,
--   multimedia_url text[],
--   creado_en timestamptz default now()
-- );

-- 3. Asegúrate de que las policies permitan insertar aunque los campos de blog sean null
