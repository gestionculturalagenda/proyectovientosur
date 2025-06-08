-- Agregar campo metadata a la tabla eventos
ALTER TABLE eventos
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
