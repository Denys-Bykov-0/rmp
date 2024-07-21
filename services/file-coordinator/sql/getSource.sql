SELECT
  id as source_id,
  description as source_description,
  allow_for_secondary_tag_parsing as source_allow_for_secondary_tag_parsing,
  logo_path as source_logo_path
FROM
  sources
WHERE
  id = $1;
