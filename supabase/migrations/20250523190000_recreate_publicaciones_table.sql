-- Eliminar la tabla publicaciones si existe
DROP TABLE IF EXISTS publicaciones CASCADE;

-- Crear tabla publicaciones ajustada al frontend (solo para blogs)
CREATE TABLE publicaciones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  autor_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  contenido text NOT NULL,
  excerpt text,
  imagen_portada text,
  categoria text,
  tiempo_lectura int,
  publicado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now(),
  tipo text NOT NULL DEFAULT 'blog'
);

-- Comentarios para publicaciones (blogs)
CREATE TABLE comentarios_blog (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  publicacion_id uuid REFERENCES publicaciones(id) ON DELETE CASCADE,
  autor_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  contenido text NOT NULL,
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

-- Reacciones para publicaciones (blogs)
CREATE TABLE reacciones_blog (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  publicacion_id uuid REFERENCES publicaciones(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  creado_en timestamptz DEFAULT now(),
  UNIQUE(usuario_id, publicacion_id)
);

-- Favoritos para publicaciones (blogs)
CREATE TABLE favoritos_blog (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  publicacion_id uuid REFERENCES publicaciones(id) ON DELETE CASCADE,
  creado_en timestamptz DEFAULT now(),
  UNIQUE(usuario_id, publicacion_id)
);
