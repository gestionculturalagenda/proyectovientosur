-- Agrega el campo media_urls (jsonb) a la tabla posts para soportar adjuntos enriquecidos
alter table posts add column if not exists media_urls jsonb;

-- Opcional: migrar datos existentes de multimedia_url a media_urls (solo url plano)
update posts set media_urls = (
  select jsonb_agg(jsonb_build_object('url', url, 'type', 'image', 'name', ''))
  from unnest(multimedia_url) as url
) where multimedia_url is not null and (media_urls is null or jsonb_array_length(media_urls) = 0);

-- NOTA: El frontend debe usar media_urls si existe, y multimedia_url como fallback retrocompatible.
