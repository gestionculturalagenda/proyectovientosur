-- Agrega el campo last_online a la tabla usuarios para presencia en línea
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS last_online timestamptz;

-- Opcional: índice para consultas rápidas de usuarios en línea
CREATE INDEX IF NOT EXISTS idx_usuarios_last_online ON public.usuarios (last_online);
