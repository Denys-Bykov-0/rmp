SELECT
  f.id as file_id,
  s.id as source_id,
  s.description as source_description,
  s.allow_for_secondary_tag_parsing as source_allow_for_secondary_tag_parsing,
  s.logo_path as source_logo_path,
  f.status as file_status,
  f.source_url as file_source_url,
  fs.is_synchronized as is_synchronized,
  (
    SELECT
      title
    FROM
      tags as t
    WHERE
      t.file_id = f.id
      AND t.source = tm.title
  ) as tag_title,
  (
    SELECT
      artist
    FROM
      tags as t
    WHERE
      t.file_id = f.id
      AND t.source = tm.artist
  ) as tag_artist,
  (
    SELECT
      album
    FROM
      tags as t
    WHERE
      t.file_id = f.id
      AND t.source = tm.album
  ) as tag_album,
  (
    SELECT
      year
    FROM
      tags as t
    WHERE
      t.file_id = f.id
      AND t.source = tm.year
  ) as tag_year,
  (
    SELECT
      track_number
    FROM
      tags as t
    WHERE
      t.file_id = f.id
      AND t.source = tm.track_number
  ) as tag_track_number,
  tm.picture as tag_picture,
  p.id as playlist_id,
  p.source_url as playlist_source_url,
  p.source_id as playlist_source,
  p.added_ts as playlist_added_ts,
  p.status as playlist_status,
  p.synchronization_ts as playlist_synchronization_ts,
  p.title as playlist_title
FROM
  files as f
  JOIN sources as s ON f.source = s.id
  LEFT JOIN tag_mappings as tm ON f.id = tm.file_id
  AND tm.user_id = $1
  INNER JOIN user_files as uf ON f.id = uf.file_id
  LEFT JOIN file_synchronization as fs ON fs.user_file_id = uf.id
  JOIN user_playlists as up ON uf.user_id = $1
  JOIN playlists as p ON up.playlist_id = p.id
  AND fs.device_id = $2
WHERE
  uf.user_id = $1
