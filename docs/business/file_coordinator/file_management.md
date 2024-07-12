# File management

This document describes file management details, such as file downloading, synchronization, and tagging for file coordinator worker.

# Content

- [File checking](#file-checking)
- [Tag parsing](#tag-parsing)
- [Playlist updating](#playlist-updating)
- [File downloading](#file-downloading)

# File checking

This functionality ensures that file has the right status and parsing is requested.

API:
```json
routing-key: checking/file
body:
{
    "file_id": "1"
}
``` 

On message it should:

#### AC 1

Find the file by given id  

#### AC 1.1

Check whether its status is 'C' or 'D'?  
- yes - continue  
- no - finish message processing  

#### AC 2

Fetch all <b>tags</b> for current file. 

There are no tags?
- yes - finish message processing  
- no - continue  

#### AC 2.1

There is only one tag?  
- yes - go to AC 2.1.1  
- no - go to AC 2.2.1  

#### AC 2.1.1

Is tag status 'C'?  
- yes - continue  
- no - finish message processing  

#### AC 2.1.2

Perform tag parsing ([Tag parsing](#tag-parsing))

#### AC 2.2.1

Are all tag statuses either 'C' or 'E'?  
- yes - continue  
- no - finish message processing  

#### AC 3

Fetch all records (<b>mappings</b> later) from [tag_mappings](../../database/tags/tag_mappings.md) where:  
file_id = request.file_id  
fixed = FALSE  

#### AC 4

For each record in <b>mappings</b> perform AC 5

#### AC 5

Get <b>pirorities</b> from the [tag_mapping_priorities](../../database/tags/tag_mapping_priorities.md) table where:  
user_id = <b>mapping</b>.user_id  

#### AC 5.1

Form tag_mapping using <b>tags</b> and <b>pirorities</b>, set fixed to TRUE and update it in the database.

#### AC 5.2

Get <b>user_file</b> record from [user_files](../../database/files/user_files.md) table where:  
user_id = <b>mapping</b>.user_id  
file_id = request.file_id  

#### AC 5.3

Update the [file_synchronization](../../database/files/file_synchronization.md) table with:  
is_synchronized = FALSE  
was_changed = TRUE  
server_ts = current timestamp    
where:  
user_file_id = <b>user_file</b>.id  

#### AC 5.4

check whether its status is 'D'?  
- yes - set its status to 'C'  
- no - continue   

# Tag parsing  

This functionality is responsible for the secondary tag parsing.

The system should:

#### AC 1

Try to find a record in the [tags](../../database/tags/tags.md) table by the following filter:  
file_id = request.file_id  
is_primary = true  

Does the record exist?  
- yes - continue  
- no - abort the operation and send the "Primary tag is not found" message  

#### AC 2

Check the status of the found primary tag.

If a status is:
- "С" - continue  
- "E" - abort the operation and send "Primary tag parsing failed" message  
- otherwise abort the operation and send "Primary tag parsing in progress" message

#### AC 3

Create records in the [tags](../../database/tags/tags.md) table with the following values:  
file_id = request.file_id  
source = [all sources with record.allow_for_secondary_tag_parsing = true]  
status = "CR"  

#### AC 4

Request tag parsing via the parser plugin.  
Value mapping for the request:  
tag_id = [created_tag.id]  

Insert a new record in the [playlists](../../database/files/playlists.md) table with the following values:    
source_url = normalizedUrl  
source_id = sourceId  
status = "CR"  

# Playlist updating

This functionality is responsible for the playlist updating.

API:
```json
routing-key: playlist/update
body:
{
    "playlist_id": "1",
    "files": ["https://youtu.be/e2YRVZ4cmeo?si=hBUM-FE6ITmVNdJm"]
}
``` 

The system should:

#### AC 1

Try to find a record in the [playlists](../../database/files/playlists.md) table by the following filter:  
id = request.body.playlist_id  

Does the record exist?
- yes - continue
- no - exit with error

#### AC 2

Try to find <b>up_recorcds</b> in the [user_playlists](../../database/files/user_playlists.md) table by the following filter:  
playlist_id = request.body.playlist_id  

Are any records found?
- yes - continue
- no - exit with error

#### AC 3

For each <b>up_recorcd</b> do:  

#### AC 3.1.1

Find <b>upff_recorcds</b> in the [user_playlist_files](../../database/files/user_playlist_files.md) table joined with [files](../../database/files/files.md) by the following filter:  
user_playlist_id = <b>up_recorcd</b>.id  

#### AC 3.1.2

Form two lists from the <b>upff_recorcds</b> and request.body.files datasets.  
List <b>new_files</b> should contain files that exist only int the request.body.files set.  
List <b>removed_files</b> should contain files that exist only int the <b>upff_recorcds</b> set.  

#### AC 3.2

For each member of <b>new_files</b> list do [File downloading](#file-downloading).  

#### AC 3.3.1

For each member of <b>removed_files</b> list do:

#### AC 3.3.2

Update records [user_playlist_files](../../database/files/user_playlist_files.md) table with following data:  
missing_from_remote = TRUE  

#### AC 3.3.3

Update records [file_synchronization](../../database/files/file_synchronization.md) table with following data:  
is_synchronized = FALSE  
server_ts = NOW()  
where:  
user_file_id =     
&emsp; id from [user_files](../../database/files/user_files.md) where:  
&emsp; file_id = <b>removed_files</b>.file.id  
&emsp; user_id = <b>up_recorcd</b>.user_id  

# File downloading  

Function parameters:
```
playlist_id="1",
url="someUrl",
``` 

The server should:

#### AC 1

Via the filePlugin perform parameters.url normalization and get sourceId  
normalizedUrl = normalize parameters.url  
sourceId = get source id for parameters.url  

#### AC 2

Try to find a record in the [files](../../database/files/files.md) table by the following filter:  
source_url = normalizedUrl  

Does the record exist?
- yes - go to AC 3
- no - go to AC 7

#### AC 3

Insert a new record in the [files](../../database/files/files.md) table with the following values:  
path = null  
source_url = normalizedUrl  
status = "CR"  

#### AC 4

Request file downloading.  
Value mapping for the request:  
file_id = created_file.id  
url = normalizedUrl  
uuid = created_file.uuid  

#### AC 5

Create a native tag record in the [tags](../../database/tags/tags.md) table with the following values:  
file_id = created_file.id   
source = sourceId  
status = "CR"  
is_primary = true

#### AC 6

Request native tag parsing.  
Value mapping for the request:  
tag_id = created_tag.id  
url = normalizedUrl  

#### AC 7

Find records in the [user_playlists](../../database/files/user_playlists.md) table where:  
playlist_id = <b>file</b>.id  

For each <b>up_record</b> do AC 8   

#### AC 8

If the record does not exist, insert a it in the [user_paylist_files](../../database/files/user_playlist_files.md) table with the following values:  
file_id = <b>file</b>.id  
user_playlist_id =  
&emsp; id from [user_playlists](../../database/files/user_playlists.md) where:  
&emsp; user_id = <b>up_record</b>.user_id  
&emsp; playlist_id = parameters.playlist_id  
missing_from_remote = FALSE  

#### AC 9.1

Read a record from the [user_files](../../database/files/user_files.md) table using following filter:  
user_id = <b>up_record</b>.user_id  
file_id = <b>file</b>.id  

Record exists?

- yes - go to AC 10
- no - continue

#### AC 9.2

Create a record in the [user_files](../../database/files/user_files.md) table with the following values:  
user_id = <b>up_record</b>.user_id  
file_id = <b>file</b>.id  

#### AC 10

Create a record in the [tag_mappings](../../database/tags/tag_mappings.md) table with the following values:  
user_id = <b>up_record</b>.user_id  
file_id = (created_file / found_file).id  
all tags = sourceId  

### AC 11

For each record in the [devices](../../database/users/devices.md) table fulfilling following filter:  
user_id = <b>up_record</b>.user_id  
  
Create a record in the [file_synchronization](../../database/files/file_synchronization.md) table with the following values:  
device_id = record.id  
user_file_id = <b>user_file</b>.id  
