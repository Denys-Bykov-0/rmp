SELECT
  id as tag_mapping_id,
  user_id as tag_mapping_user_id,
  file_id as tag_mapping_file_id,
  title as tag_mapping_title,
  artist as tag_mapping_artist,
  album as tag_mapping_album,
  picture as tag_mapping_picture,
  year as tag_mapping_year,
  track_number as tag_mapping_track_number,
  fixed as tag_mapping_fixed
FROM
  tag_mappings
WHERE
  file_id = $1
  AND fixed = $2
