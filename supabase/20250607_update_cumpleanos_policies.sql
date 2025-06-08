-- SCRIPT SOLO PARA ACTUALIZAR POLÍTICAS RLS DE CUMPLEAÑOS EN SUPABASE
-- No modifica la estructura de la tabla, solo las políticas de seguridad

ALTER TABLE cumpleanos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Insertar cumpleaños propio" ON cumpleanos;
CREATE POLICY "Insertar cumpleaños propio" ON cumpleanos FOR INSERT WITH CHECK (auth.uid() = usuario_id);
DROP POLICY IF EXISTS "Ver cumpleaños" ON cumpleanos;
CREATE POLICY "Ver cumpleaños" ON cumpleanos FOR SELECT USING (auth.uid() = usuario_id OR usuario_id IS NULL);
DROP POLICY IF EXISTS "Actualizar cumpleaños propio" ON cumpleanos;
CREATE POLICY "Actualizar cumpleaños propio" ON cumpleanos FOR UPDATE USING (auth.uid() = usuario_id);
DROP POLICY IF EXISTS "Borrar cumpleaños propio" ON cumpleanos;
CREATE POLICY "Borrar cumpleaños propio" ON cumpleanos FOR DELETE USING (auth.uid() = usuario_id);

-- FIN DEL SCRIPT DE POLÍTICAS RLS DE CUMPLEAÑOS
