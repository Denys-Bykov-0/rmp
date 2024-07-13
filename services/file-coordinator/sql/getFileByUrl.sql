SELECT
  f.id as file_id,
  f.source as file_source,
  f.path as file_path,
  f.status as file_status,
  f.source_url as file_source_url
FROM
  files as f
WHERE
  f.source_url = $1
