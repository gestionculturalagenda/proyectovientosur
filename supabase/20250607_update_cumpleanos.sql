-- SCRIPT DE ACTUALIZACIÓN PARA TABLA CUMPLEANOS EN SUPABASE
-- Este script actualiza la tabla cumpleanos y sus políticas RLS según los últimos cambios.
-- Seguro para aplicar sobre una base existente (idempotente y sin afectar otras tablas)

-- Cambiar la relación de usuario_id a ON DELETE CASCADE (si ya existe, solo se actualiza la constraint)
ALTER TABLE cumpleanos DROP CONSTRAINT IF EXISTS cumpleanos_usuario_id_fkey;
ALTER TABLE cumpleanos ADD CONSTRAINT cumpleanos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;

-- Políticas RLS (siempre idempotentes)
ALTER TABLE cumpleanos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Insertar cumpleaños propio" ON cumpleanos;
CREATE POLICY "Insertar cumpleaños propio" ON cumpleanos FOR INSERT WITH CHECK (auth.uid() = usuario_id);
DROP POLICY IF EXISTS "Ver cumpleaños" ON cumpleanos;
CREATE POLICY "Ver cumpleaños" ON cumpleanos FOR SELECT USING (auth.uid() = usuario_id OR usuario_id IS NULL);
DROP POLICY IF EXISTS "Actualizar cumpleaños propio" ON cumpleanos;
CREATE POLICY "Actualizar cumpleaños propio" ON cumpleanos FOR UPDATE USING (auth.uid() = usuario_id);
DROP POLICY IF EXISTS "Borrar cumpleaños propio" ON cumpleanos;
CREATE POLICY "Borrar cumpleaños propio" ON cumpleanos FOR DELETE USING (auth.uid() = usuario_id);

-- FIN DEL SCRIPT DE ACTUALIZACIÓN
