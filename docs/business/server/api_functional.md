# API functionality

This document describes how to work with endpoints using HTTP requests on a RESTful server (v1, docs: 2.0.0).

## Table of contents

- Endpoints
  - [API](#api)
    - [[GET] - /up-vibe/v1/health](#get---up-vibev1health)
    - [[GET] - /up-vibe/v1/auth-test](#get---up-vibev1auth-test)
    - [[GET] - /up-vibe/v1/info](#get---up-vibev1info)
    - [[POST] - /up-vibe/v1/register](#post---up-vibev1register)
  - [SOURCES](#sources)
    - [[GET] - /up-vibe/v1/sources](#get---up-vibev1sources)
    - [[GET] - /up-vibe/v1/sources/{sourceId}/logo](#get---up-vibev1sourcessourceidlogo)
  - [FILES](#files)
    - [[GET] - /up-vibe/v1/files](#get---up-vibev1files)
    - [[GET] - /up-vibe/v1/files/{fileId}](#get---up-vibev1filesfileid)
    - [[GET] - /up-vibe/v1/files/{fileId}/download](#get---up-vibev1filesfileiddownload)
    - [[POST] - /up-vibe/v1/files](#post---up-vibev1files)
    - [[POST] - /up-vibe/v1/files/{fileId}/confirm](#post---up-vibev1filesfileidconfirm)
    - [[DELETE] - /up-vibe/v1/files/{fileId}](#delete---up-vibev1filesfileid)
  - [TAGS](#tags)
    - [[GET] - /up-vibe/v1/files/{fileId}/tags](#get---up-vibev1filesfileidtags)
    - [[GET] - /up-vibe/v1/tags/{tagId}/picture](#get---up-vibev1tagstagidpicture)
    - [[POST] - /up-vibe/v1/files/{fileId}/custom-tags](#post---up-vibev1filesfileidcustom-tags)
    - [[POST] - /up-vibe/v1/files/{fileId}/custom-tags/picture](#post---up-vibev1filesfileidcustom-tagspicture)
  - [TAG-MAPPINGS](#tag-mappings)
    - [[GET] - /up-vibe/v1/tags/tag-mapping-priority](#get---up-vibev1tagstag-mapping-priority)
    - [[PUT] - /up-vibe/v1/tags/tag-mapping-priority](#put---up-vibev1tagstag-mapping-priority)
    - [[PUT] - /up-vibe/v1/files/{fileId}/tag-mappings](#put---up-vibev1filesfileidtag-mappings)
  - [PLAYLISTS](#playlists)
    - [[GET] - /up-vibe/v1/playlists](#get---up-vibev1playlists)
    - [[GET] - /up-vibe/v1/playlists/{playlistId}](#get---up-vibev1playlistsplaylistid)
    - [[POST] - /up-vibe/v1/playlists](#post---up-vibev1playlists)
    - [[DELETE] - /up-vibe/v1/playlists/{playlistId}](#delete---up-vibev1playlistsplaylistid)

### API

This section describes how to manage the API

### [GET] - /up-vibe/v1/health

Check if the server is running.

#### Request for health check

```http
GET /up-vibe/v1/health
```

#### Response for health check

```http
HTTP/2 200 OK
Content-Type: application/json

{
  "message": "API is healthly!"
}
```

### [GET] - /up-vibe/v1/auth-test

Test if the user is authenticated.

#### Request for authenticated user

```http
GET /up-vibe/v1/auth-test
```

#### Response for authenticated user

```http
HTTP/2 200 OK
Content-Type: application/json

{
  "message": "Auth test passed!"
}
```

```http
HTTP/2 401 Unauthorized
Content-Type: application/json

{
  "message": "Requires authentication"
}
```

### [GET] - /up-vibe/v1/info

Get information about the server.

#### Request for server information

```http
GET /up-vibe/v1/info
```

#### Response for server information

```http
HTTP/2 200 OK
Content-Type: application/json

{
  "version": "1.0.0"
}
```

### [POST] - /up-vibe/v1/register

Register a new user and device, if user already exists, only device is registered

#### Request for registration

```http
POST /up-vibe/v1/register
Content-Type: application/json

{
  "deviceId": "dd938aa5-6520-492a-bf61-8927aa58872c",
  "deviceName": "Some device"
}
```

#### Response for registration

```http
HTTP/2 200 OK
Content-Type: application/json
```

## SOURCES

This section describes how to manage sources.

### [GET] - /up-vibe/v1/sources

Get all sources.

#### Request for all sources

```http
GET /up-vibe/v1/sources
```

#### Response for all sources

```http
HTTP/2 200 OK
Content-Type: application/json

[
  {
    "id": 0,
    "description": "string"
  }
]
```

### [GET] - /up-vibe/v1/sources/{sourceId}/logo

Get the logo of a source.

### Parameters for source logo

| Name     | Type    | Description   |
| -------- | ------- | ------------- |
| sourceId | integer | The source id |

#### Request for source logo

```http
GET /up-vibe/v1/sources/{sourceId}/logo
```

#### Response for source logo

```http
HTTP/2 200 OK
Content-Type: application/octet-stream
```

## FILES

This section describes how to manage files.

### [GET] - /up-vibe/v1/files

Get array of files for the authenticated user.

### Parameters for all files

| Name          | Type    | Description            |
| ------------- | ------- | ---------------------- |
| deviceId      | string  | Device id              |
| statuses      | string  | File statuses          |
| synchronized  | boolean | Synchronization status |
| playlists     | string  | Playlists              |
| missingRemote | boolean | Remote missing         |
| limit         | integer | Limit of files         |
| offset        | integer | Offset of files        |
| sort          | string  | Sort order             |

#### Enum for file statuses

| Name | Description      |
| ---- | ---------------- |
| CR   | Create new file  |
| C    | Complete file    |
| E    | Error file       |
| I    | In progress file |
| P    | Pending file     |

#### Enum for sort order

| Name         | Description          |
| ------------ | -------------------- |
| title        | Sort by title        |
| artist       | Sort by artist       |
| album        | Sort by album        |
| year         | Sort by year         |
| track_number | Sort by track number |
| picture      | Sort by picture      |
| source       | Sort by source       |

#### Request for all files

```http
GET /up-vibe/v1/files?
deviceId=83bdf68c-4f07-40e1-b453-eaf18677f6eb
&statuses=CR,C
&synchronized=false
&playlists=72,73,74
&missingRemote=false
&limit=10
&offset=0
&sort=title,asc,artist,desc
```

#### Response for all files

```http
HTTP/2 200 OK
Content-Type: application/json

[
  {
    "id": "0",
    "source": {
      "id": "0",
      "source": "source"
    },
    "status": "CR",
    "sourceUrl": "https://example.com",
    "isSynchronized": false,
    "tags": {
      "title": "Some title",
      "artist": "Some artist",
      "album": null,
      "year": null,
      "trackNumber": null
    },
    "playlists": [
      "0",
    ],
    "missingRemote": false
  },
]
```

### [GET] - /up-vibe/v1/files/{fileId}

Get a information file by id.

### Parameters for file by id

| Name     | Type   | Description                         |
| -------- | ------ | ----------------------------------- |
| fileId   | string | File id                             |
| deviceId | string | Device id                           |
| expand   | string | CSV list of possible expand options |

#### Enum for expand options

| Name    | Description    |
| ------- | -------------- |
| mapping | Expand mapping |

#### Request for file by id

```http
GET /up-vibe/v1/files/{fileId}?
deviceId=83bdf68c-4f07-40e1-b453-eaf18677f6eb
&expand=mapping
```

#### Response for file by id

```http
HTTP/2 200 OK
Content-Type: application/json

{
  "file": {
    "id": 0,
    "source": {
      "id": 0,
      "description": "string"
    },
    "status": "string",
    "sourceUrl": "string",
    "isSynchoronized": true,
    "wasChanged": true,
    "palylists": [
      "string"
    ],
    "tags": {
      "title": "string",
      "artist": "string",
      "album": "string",
      "year": 0,
      "trackNumber": 0
    }
  },
  "mapping": {
    "title": 0,
    "artist": 0,
    "album": 0,
    "year": 0,
    "trackNumber": 0,
    "picture": 0
  }
}
```

### [GET] - /up-vibe/v1/files/{fileId}/download

Download a file by id.

### Parameters for download file

| Name   | Type   | Description |
| ------ | ------ | ----------- |
| fileId | string | File id     |

#### Request for download file

```http
GET /up-vibe/v1/files/{fileId}/download
```

#### Response for download file

```http
HTTP/2 200 OK
Content-Type: application/octet-stream
```

### [POST] - /up-vibe/v1/files

Create a new file.

### Parameters for create file

| Name | Type   | Description |
| ---- | ------ | ----------- |
| url  | string | Url link    |

#### Request for create file

```http
POST /up-vibe/v1/files
Content-Type: application/json

{
  "url": "https://example.com"
}
```

#### Response for create file

```http
HTTP/2 200 OK
Content-Type: application/json

{
  "id": 0,
  "source": {
    "id": 0,
    "description": "string"
  },
  "status": "string",
  "sourceUrl": "string",
  "isSynchoronized": true,
  "wasChanged": true,
  "palylists": [
    "string"
  ],
  "tags": {
    "title": "string",
    "artist": "string",
    "album": "string",
    "year": 0,
    "trackNumber": 0
  }
}
```

### [POST] - /up-vibe/v1/files/{fileId}/confirm

Confirm a file downloading.

### Parameters for confirm file

| Name     | Type   | Description |
| -------- | ------ | ----------- |
| fileId   | string | File id     |
| deviceId | string | Device id   |

#### Request for confirm file

```http
POST /up-vibe/v1/files/{fileId}/confirm?
deviceId=83bdf68c-4f07-40e1-b453-eaf18677f6eb
```

#### Response for confirm file

```http
HTTP/2 200 OK
Content-Type: application/json
```

### [DELETE] - /up-vibe/v1/files/{fileId}

Delete a file by id.

### Parameters for delete file

| Name        | Type   | Description              |
| ----------- | ------ | ------------------------ |
| fileId      | string | File id                  |
| playlistIds | string | CSV list of playlist ids |

#### Request for delete file

```http
DELETE /up-vibe/v1/files/{fileId}?
playlistIds=0,1,2
```

#### Response for delete file

```http
HTTP/2 200 OK
Content-Type: application/json
```

## TAGS

This section describes how to manage tags.

### [GET] - /up-vibe/v1/files/{fileId}/tags

Get array of tags for a file.

### Parameters for all tags

| Name   | Type   | Description |
| ------ | ------ | ----------- |
| fileId | string | File id     |

#### Request for all tags

```http
GET /up-vibe/v1/files/{fileId}/tags
```

#### Response for all tags

```http
HTTP/2 200 OK
Content-Type: application/json

[
  {
    "id": 0,
    "source": {
      "id": 0,
      "description": "string"
    },
    "status": "string",
    "sourceUrl": "string",
    "tags": {
      "title": "string",
      "artist": "string",
      "album": "string",
      "year": 0,
      "trackNumber": 0
    }
  }
]
```

### [GET] - /up-vibe/v1/tags/{tagId}/picture

Get the picture of a tag.

### Parameters for tag picture

| Name  | Type   | Description |
| ----- | ------ | ----------- |
| tagId | string | Tag id      |

#### Request for tag picture

```http
GET /up-vibe/v1/tags/{tagId}/picture
```

#### Response for tag picture

```http
HTTP/2 200 OK
Content-Type: application/octet-stream
```

### [POST] - /up-vibe/v1/files/{fileId}/custom-tags

Create or update custom tags for a file.

### Parameters for custom tags

| Name   | Type   | Description |
| ------ | ------ | ----------- |
| fileId | string | File id     |

#### Request for custom tags

```http
POST /up-vibe/v1/files/{fileId}/custom-tags
Content-Type: application/json

{
  "title": "Some title",
  "artist": "Some artist",
  "album": "Some album",
  "year": 2020,
  "trackNumber": 1
}
```

#### Response for custom tags

```http
HTTP/2 200 OK
Content-Type: application/json

{
  "id": 0,
  "source": {
    "id": 0,
    "description": "string"
  },
  "status": "string",
  "sourceUrl": "string",
  "tags": {
    "title": "string",
    "artist": "string",
    "album": "string",
    "year": 0,
    "trackNumber": 0
  }
}
```

### [POST] - /up-vibe/v1/files/{fileId}/custom-tags/picture

Upload a picture for a tag.

### Parameters for custom tag picture

| Name   | Type   | Description |
| ------ | ------ | ----------- |
| fileId | string | File id     |

#### Request for custom tag picture

```http
POST /up-vibe/v1/files/{fileId}/custom-tags/picture
Content-Type: application/octet-stream
```

#### Response for custom tag picture

```http
HTTP/2 200 OK
Content-Type: application/json
```

## TAG-MAPPINGS

This section describes how to manage tag mappings.

### [GET] - /up-vibe/v1/tags/tag-mapping-priority

Get the priority of tag mappings.

#### Request for get tag mapping priority

```http
GET /up-vibe/v1/tags/tag-mapping-priority
```

#### Response for get tag mapping priority

```http
HTTP/2 200 OK
Content-Type: application/json

{
  "title": [
    0
  ],
  "artist": [
    0
  ],
  "album": [
    0
  ],
  "year": [
    0
  ],
  "trackNumber": [
    0
  ],
  "picture": [
    0
  ]
}
```

### [PUT] - /up-vibe/v1/tags/tag-mapping-priority

Update the priority of tag mappings.

#### Request for put tag mapping priority

```http
PUT /up-vibe/v1/tags/tag-mapping-priority
Content-Type: application/json

{
  "title": [
    0
  ],
  "artist": [
    0
  ],
  "album": [
    0
  ],
  "year": [
    0
  ],
  "trackNumber": [
    0
  ],
  "picture": [
    0
  ]
}
```

#### Response for put tag mapping priority

```http
HTTP/2 200 OK
Content-Type: application/json
```

### [PUT] - /up-vibe/v1/files/{fileId}/tag-mappings

Update the tag mappings for a file.

### Parameters for tag mappings

| Name   | Type   | Description |
| ------ | ------ | ----------- |
| fileId | string | File id     |

#### Request for put tag mappings

```http
PUT /up-vibe/v1/files/{fileId}/tag-mappings
Content-Type: application/json

{
  "title": 0,
  "artist": 0,
  "album": 0,
  "year": 0,
  "trackNumber": 0,
  "picture": 0
}
```

#### Response for put tag mappings

```http
HTTP/2 200 OK
Content-Type: application/json
```

## PLAYLISTS

This section describes how to manage playlists.

### [GET] - /up-vibe/v1/playlists

Get array of playlists for the authenticated user.

#### Request for all playlists

```http
GET /up-vibe/v1/playlists
```

#### Response for all playlists

```http
HTTP/2 200 OK
Content-Type: application/json

[
  {
    "id": 0,
    "source": {
      "id": 0,
      "description": "string"
    },
    "status": "string",
    "sourceUrl": "string",
    "syncrhonizationTs": "string",
    "title": "string"
  }
]
```

### [GET] - /up-vibe/v1/playlists/{playlistId}

Get a playlist by id.

### Parameters for playlist by id

| Name       | Type   | Description |
| ---------- | ------ | ----------- |
| playlistId | string | Playlist id |

#### Request for playlist by id

```http
GET /up-vibe/v1/playlists/{playlistId}
```

#### Response for playlist by id

```http
HTTP/2 200 OK
Content-Type: application/json

{
  "id": 0,
  "source": {
    "id": 0,
    "description": "string"
  },
  "status": "string",
  "sourceUrl": "string",
  "syncrhonizationTs": "string",
  "title": "string"
}
```

### [POST] - /up-vibe/v1/playlists

Create a new playlist.

#### Request for create playlist

```http
POST /up-vibe/v1/playlists
Content-Type: application/json

{
  "url": "https://example.com"
}
```

#### Response for create playlist

```http
HTTP/2 200 OK
Content-Type: application/json

{
  "id": 0,
  "source": {
    "id": 0,
    "description": "string"
  },
  "status": "string",
  "sourceUrl": "string",
  "syncrhonizationTs": "string",
  "title": "string"
}
```

### [DELETE] - /up-vibe/v1/playlists/{playlistId}

Delete a playlist by id.

### Parameters for delete playlist

| Name       | Type   | Description |
| ---------- | ------ | ----------- |
| playlistId | string | Playlist id |

#### Request for delete playlist

```http
DELETE /up-vibe/v1/playlists/{playlistId}
```

#### Response for delete playlist

```http
HTTP/2 200 OK
Content-Type: application/json
```
