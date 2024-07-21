DELETE FROM user_playlist_files
WHERE
  file_id = $1
  AND user_playlist_id = ANY (
    SELECT
      id
    FROM
      user_playlists
    WHERE
      user_id = $2
      AND playlist_id IN ($3)
  );
