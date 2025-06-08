-- MIGRACIÓN INCREMENTAL: ACTUALIZACIÓN DE POLÍTICAS RLS Y ESTRUCTURA DE CUMPLEAÑOS
-- Fecha: 2025-06-07
-- Aplica los cambios mínimos necesarios para alinear la tabla y RLS con el formulario actual

-- 1. Asegura que usuario_id y mensaje sean NOT NULL y la relación ON DELETE CASCADE
ALTER TABLE cumpleanos ALTER COLUMN usuario_id SET NOT NULL;
ALTER TABLE cumpleanos ALTER COLUMN mensaje SET NOT NULL;
ALTER TABLE cumpleanos DROP CONSTRAINT IF EXISTS cumpleanos_usuario_id_fkey;
ALTER TABLE cumpleanos ADD CONSTRAINT cumpleanos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;

-- 2. Políticas RLS: solo el dueño puede ver, crear, actualizar y borrar
ALTER TABLE cumpleanos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Insertar cumpleaños propio" ON cumpleanos;
CREATE POLICY "Insertar cumpleaños propio" ON cumpleanos FOR INSERT WITH CHECK (auth.uid() = usuario_id);
DROP POLICY IF EXISTS "Ver cumpleaños" ON cumpleanos;
CREATE POLICY "Ver cumpleaños" ON cumpleanos FOR SELECT USING (auth.uid() = usuario_id);
DROP POLICY IF EXISTS "Actualizar cumpleaños propio" ON cumpleanos;
CREATE POLICY "Actualizar cumpleaños propio" ON cumpleanos FOR UPDATE USING (auth.uid() = usuario_id);
DROP POLICY IF EXISTS "Borrar cumpleaños propio" ON cumpleanos;
CREATE POLICY "Borrar cumpleaños propio" ON cumpleanos FOR DELETE USING (auth.uid() = usuario_id);

-- FIN DE LA MIGRACIÓN INCREMENTAL
