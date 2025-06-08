-- Tabla para tareas culturales adaptada al formulario actual
create table if not exists tareas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  fecha_limite timestamptz not null,
  estado text not null check (estado in ('pendiente', 'en_progreso', 'completada')),
  prioridad text not null check (prioridad in ('baja', 'media', 'alta')),
  asignada_a text not null, -- campo de texto libre para nombres o identificadores
  descripcion text not null,
  creador_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

alter table tareas enable row level security;

create policy "Usuarios pueden ver sus tareas o asignadas" on tareas
  for select
  using (
    creador_id = auth.uid() or asignada_a ILIKE '%' || (auth.uid()::text) || '%'
  );

create policy "Usuarios pueden crear tareas" on tareas
  for insert
  with check (
    auth.uid() = creador_id
  );

create policy "Usuarios pueden actualizar sus tareas" on tareas
  for update
  using (
    creador_id = auth.uid() or asignada_a ILIKE '%' || (auth.uid()::text) || '%'
  );

create policy "Usuarios pueden borrar sus tareas" on tareas
  for delete
  using (
    creador_id = auth.uid()
  );
