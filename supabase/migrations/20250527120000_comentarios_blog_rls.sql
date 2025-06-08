-- Habilitar RLS y políticas para comentarios_blog en publicaciones (blogs)

ALTER TABLE comentarios_blog ENABLE ROW LEVEL SECURITY;

-- Permitir insertar comentarios solo a usuarios autenticados
CREATE POLICY "Permitir insertar comentarios a usuarios autenticados en blogs"
  ON comentarios_blog
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = autor_id);

-- Permitir leer comentarios a cualquier usuario autenticado
CREATE POLICY "Permitir leer comentarios de blogs a usuarios autenticados"
  ON comentarios_blog
  FOR SELECT
  TO authenticated
  USING (true);

-- (Opcional) Permitir actualizar/eliminar solo al autor del comentario
CREATE POLICY "Permitir actualizar comentarios propios en blogs"
  ON comentarios_blog
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = autor_id)
  WITH CHECK (auth.uid() = autor_id);

CREATE POLICY "Permitir eliminar comentarios propios en blogs"
  ON comentarios_blog
  FOR DELETE
  TO authenticated
  USING (auth.uid() = autor_id);
