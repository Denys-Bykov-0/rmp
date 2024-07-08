insert into
  file_synchronization (device_id, user_file_id)
select
  d.id,
  $2
from
  devices as d
where
  user_id = $1
