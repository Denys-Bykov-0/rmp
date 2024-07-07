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
      t.id = tm.title
  ) as tag_title,
  (
    SELECT
      artist
    FROM
      tags as t
    WHERE
      t.id = tm.artist
  ) as tag_artist,
  (
    SELECT
      album
    FROM
      tags as t
    WHERE
      t.id = tm.album
  ) as tag_album,
  (
    SELECT
      year
    FROM
      tags as t
    WHERE
      t.id = tm.year
  ) as tag_year,
  (
    SELECT
      track_number
    FROM
      tags as t
    WHERE
      t.id = tm.track_number
  ) as tag_track_number,
  tm.picture as tag_picture,
  ARRAY_AGG(
    JSON_BUILD_OBJECT(
      'playlist_id',
      p.id,
      'playlist_status',
      p.status,
      'playlist_source_url',
      p.source_url,
      'source_id',
      p.source_id,
      'source_description',
      (
        SELECT
          description
        FROM
          sources as s
        WHERE
          s.id = p.source_id
      ),
      'playlist_synchronization_ts',
      p.synchronization_ts,
      'playlist_title',
      p.title
    )
  ) as playlists
FROM
  files as f
  LEFT JOIN sources as s ON f.source = s.id
  LEFT JOIN tag_mappings as tm ON f.id = tm.file_id
  AND tm.user_id = $3
  LEFT JOIN user_files as uf ON f.id = uf.file_id
  AND uf.user_id = $3
  LEFT JOIN file_synchronization as fs ON fs.user_file_id = uf.id
  AND fs.device_id = $2
  JOIN user_playlist_files as upf ON f.id = upf.file_id
  JOIN user_playlists as up ON upf.user_playlist_id = up.id
  JOIN playlists as p ON up.playlist_id = p.id
WHERE
  f.id = $1
GROUP BY
  f.id,
  s.id,
  s.description,
  s.allow_for_secondary_tag_parsing,
  s.logo_path,
  f.status,
  f.source_url,
  fs.is_synchronized,
  tm.title,
  tm.artist,
  tm.album,
  tm.year,
  tm.track_number,
  tm.picture
