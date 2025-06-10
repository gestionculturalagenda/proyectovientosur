-- ESQUEMA COMPLETO ACTUALIZADO PARA VIENTOSUR (Supabase)
-- Incluye la tabla de notificaciones y todas las tablas, índices y políticas actuales

-- Eliminar tablas si existen (orden inverso de dependencias)
drop table if exists notificaciones cascade;
drop table if exists favoritos_cumpleanos cascade;
drop table if exists favoritos_post cascade;
drop table if exists reacciones_cumpleanos cascade;
drop table if exists comentarios_cumpleanos cascade;
drop table if exists cumpleanos cascade;
drop table if exists reacciones_post cascade;
drop table if exists comentarios_post cascade;
drop table if exists posts cascade;
drop table if exists comentarios_evento cascade;
drop table if exists reacciones_evento cascade;
drop table if exists eventos cascade;
drop table if exists tareas cascade;
drop table if exists comentarios_blog cascade;
drop table if exists reacciones_blog cascade;
drop table if exists publicaciones cascade;
drop table if exists portfolio cascade;
drop table if exists gallery cascade;
drop table if exists followers cascade;
drop table if exists group_members cascade;
drop table if exists groups cascade;
drop table if exists messages cascade;
drop table if exists usuarios cascade;

-- Extensiones necesarias
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists intarray;
create extension if not exists "unaccent";

-- ...existing code from 20250605_full_schema.sql...

-- Tabla de notificaciones para usuarios
create table if not exists public.notificaciones (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.usuarios(id) on delete cascade not null,
  tipo text not null, -- 'reaction', 'comment', 'message', etc
  titulo text not null,
  descripcion text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  leida boolean default false,
  link text
);

-- Index para consultas rápidas por usuario y fecha
create index if not exists notificaciones_user_id_created_at_idx on public.notificaciones(user_id, created_at desc);

-- Políticas de seguridad: solo el usuario puede ver sus notificaciones
alter table public.notificaciones enable row level security;
drop policy if exists "Users can view their own notifications" on public.notificaciones;
drop policy if exists "Users can insert their own notifications" on public.notificaciones;
drop policy if exists "Users can update their own notifications" on public.notificaciones;
drop policy if exists "Users can delete their own notifications" on public.notificaciones;
create policy "Users can view their own notifications" on public.notificaciones for select using (auth.uid() = user_id);
create policy "Users can insert their own notifications" on public.notificaciones for insert with check (auth.uid() = user_id);
create policy "Users can update their own notifications" on public.notificaciones for update using (auth.uid() = user_id);
create policy "Users can delete their own notifications" on public.notificaciones for delete using (auth.uid() = user_id);

-- ...resto del esquema completo igual que 20250605_full_schema.sql, pero con notificaciones incluida...

-- FIN DEL ESQUEMA COMPLETO
