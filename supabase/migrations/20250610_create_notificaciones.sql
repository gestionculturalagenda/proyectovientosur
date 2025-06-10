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
do $$
begin
  if not exists (select 1 from pg_indexes where tablename = 'notificaciones' and indexname = 'notificaciones_user_id_created_at_idx') then
    create index notificaciones_user_id_created_at_idx on public.notificaciones(user_id, created_at desc);
  end if;
end$$;

-- Políticas de seguridad: solo el usuario puede ver sus notificaciones
alter table public.notificaciones enable row level security;
create policy "Users can view their own notifications" on public.notificaciones for select using (auth.uid() = user_id);
create policy "Users can insert their own notifications" on public.notificaciones for insert with check (auth.uid() = user_id);
create policy "Users can update their own notifications" on public.notificaciones for update using (auth.uid() = user_id);
create policy "Users can delete their own notifications" on public.notificaciones for delete using (auth.uid() = user_id);
