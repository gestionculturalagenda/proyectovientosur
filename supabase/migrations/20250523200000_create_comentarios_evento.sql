-- Crear tabla comentarios_evento para comentarios en eventos culturales
create table if not exists comentarios_evento (
  id uuid primary key default uuid_generate_v4(),
  evento_id uuid references eventos(id) on delete cascade,
  autor_id uuid references usuarios(id) on delete cascade,
  contenido text not null,
  creado_en timestamptz default now(),
  actualizado_en timestamptz default now()
);

-- Habilitar RLS
alter table comentarios_evento enable row level security;

grant insert on comentarios_evento to authenticated;
create policy "Permitir insertar comentarios a usuarios autenticados en eventos"
  on comentarios_evento
  for insert
  with check (auth.uid() = autor_id);

grant select on comentarios_evento to authenticated;
create policy "Permitir leer comentarios de eventos a usuarios autenticados"
  on comentarios_evento
  for select
  using (true);

-- Permitir actualizar/eliminar solo al autor del comentario
create policy "Permitir actualizar comentarios propios en eventos"
  on comentarios_evento
  for update
  using (auth.uid() = autor_id);

create policy "Permitir eliminar comentarios propios en eventos"
  on comentarios_evento
  for delete
  using (auth.uid() = autor_id);
