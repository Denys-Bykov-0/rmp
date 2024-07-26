SELECT
  f.id as file_id,
  s.id as source_id,
  s.description as source_description,
  s.allow_for_secondary_tag_parsing as source_allow_for_secondary_tag_parsing,
  s.logo_path as source_logo_path,
  f.status as file_status,
  f.source_url as file_source_url,
  fs.is_synchronized as is_synchronized,
  upf.missing_from_remote as missing_from_remote,
  (
    SELECT
      title
    FROM
      tags as t
    WHERE
      t.source = tm.title
      and t.file_id = f.id
  ) as tag_title,
  (
    SELECT
      artist
    FROM
      tags as t
    WHERE
      t.source = tm.artist
      and t.file_id = f.id
  ) as tag_artist,
  (
    SELECT
      album
    FROM
      tags as t
    WHERE
      t.source = tm.album
      and t.file_id = f.id
  ) as tag_album,
  (
    SELECT
      year
    FROM
      tags as t
    WHERE
      t.source = tm.year
      and t.file_id = f.id
  ) as tag_year,
  (
    SELECT
      track_number
    FROM
      tags as t
    WHERE
      t.source = tm.track_number
      and t.file_id = f.id
  ) as tag_track_number,
  tm.picture as tag_picture,
  ARRAY_AGG(p.id) as playlists
FROM
  files as f
  JOIN sources as s ON f.source = s.id
  LEFT JOIN tag_mappings as tm ON f.id = tm.file_id
  AND tm.user_id = $1
  INNER JOIN user_files as uf ON f.id = uf.file_id
  LEFT JOIN file_synchronization as fs ON fs.user_file_id = uf.id
  JOIN user_playlist_files as upf ON upf.file_id = f.id
  JOIN user_playlists as up ON uf.user_id = $1
  AND up.id = upf.user_playlist_id
  JOIN playlists as p ON up.playlist_id = p.id
  AND fs.device_id = $2
WHERE
  uf.user_id = $1
