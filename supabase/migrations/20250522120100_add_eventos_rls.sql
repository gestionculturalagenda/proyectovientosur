-- Habilitar RLS para la tabla eventos
alter table eventos enable row level security;

-- Política para permitir lectura de eventos a todos los usuarios autenticados
create policy "Eventos visibles para usuarios autenticados"
  on eventos
  for select
  to authenticated
  using (true);

-- Política para permitir inserción de eventos a usuarios autenticados
create policy "Usuarios autenticados pueden crear eventos"
  on eventos
  for insert
  to authenticated
  with check (auth.uid() = creador_id);

-- Política para permitir actualización de eventos solo al creador
create policy "Usuarios pueden editar sus propios eventos"
  on eventos
  for update
  to authenticated
  using (auth.uid() = creador_id)
  with check (auth.uid() = creador_id);

-- Política para permitir eliminación de eventos solo al creador
create policy "Usuarios pueden eliminar sus propios eventos"
  on eventos
  for delete
  to authenticated
  using (auth.uid() = creador_id);
