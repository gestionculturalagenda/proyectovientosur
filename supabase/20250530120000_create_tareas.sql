-- Tabla para tareas culturales
create table if not exists tareas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  fecha_limite timestamptz not null,
  estado text not null check (estado in ('pendiente', 'en_progreso', 'completada')),
  prioridad text not null check (prioridad in ('baja', 'media', 'alta')),
  asignada_a text not null, -- ahora es texto
  descripcion text not null,
  creador_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Habilitar Row Level Security
alter table tareas enable row level security;

-- Policy: Los usuarios pueden ver solo sus tareas o las asignadas a ellos
create policy "Usuarios pueden ver sus tareas o asignadas" on tareas
  for select
  using (
    creador_id = auth.uid() or asignada_a ILIKE '%' || (auth.uid()::text) || '%'
  );

-- Policy: Los usuarios pueden actualizar solo sus tareas creadas o asignadas
create policy "Usuarios pueden actualizar sus tareas" on tareas
  for update
  using (
    creador_id = auth.uid() or asignada_a ILIKE '%' || (auth.uid()::text) || '%'
  );

-- Policy: Los usuarios pueden borrar solo sus tareas creadas
create policy "Usuarios pueden borrar sus tareas" on tareas
  for delete
  using (
    creador_id = auth.uid()
  );

-- Policy: Los usuarios pueden insertar tareas donde sean el creador
create policy "Usuarios pueden crear tareas" on tareas
  for insert
  with check (
    auth.uid() = creador_id
  );

-- Extensión para funciones de arrays con uuid[]
create extension if not exists intarray;
