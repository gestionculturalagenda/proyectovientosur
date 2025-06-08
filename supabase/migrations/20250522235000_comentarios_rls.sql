-- Habilitar RLS en la tabla comentarios
alter table comentarios enable row level security;

-- Permitir insertar comentarios solo a usuarios autenticados
create policy "Permitir insertar comentarios a usuarios autenticados"
  on comentarios
  for insert
  with check (auth.uid() = autor_id);

-- Permitir leer comentarios a cualquier usuario autenticado
create policy "Permitir leer comentarios a usuarios autenticados"
  on comentarios
  for select
  using (true);

-- (Opcional) Permitir actualizar/eliminar solo al autor del comentario
create policy "Permitir actualizar comentarios propios"
  on comentarios
  for update
  using (auth.uid() = autor_id);

create policy "Permitir eliminar comentarios propios"
  on comentarios
  for delete
  using (auth.uid() = autor_id);
