# API functionality

This document describes how to work with endpoints using HTTP requests on a RESTful server (v1, docs: 2.0.0).

## Table of contents

- Endpoints
  - API
    - [[GET] - /up-vibe/v1/health](#get---up-vibev1health)
    - [[GET] - /up-vibe/v1/auth-test](#get---up-vibev1auth-test)
    - [[GET] - /up-vibe/v1/info](#get---up-vibev1info)
    - [[POST] - /up-vibe/v1/register](#post---up-vibev1register)
  - SOURCES
    - [[GET] - /up-vibe/v1/sources](#get---up-vibev1sources)
    - [[GET] - /up-vibe/v1/sources/{sourceId}/logo](#get---up-vibev1sourcessourceidlogo)
  - FILES
    - [[GET] - /up-vibe/v1/files](#get---up-vibev1files)
    - [[GET] - /up-vibe/v1/files/{fileId}](#get---up-vibev1filesfileid)
    - [[GET] - /up-vibe/v1/files/{fileId}/download](#get---up-vibev1filesfileiddownload)
    - [[POST] - /up-vibe/v1/files](#post---up-vibev1files)
    - [[POST] - /up-vibe/v1/files/{fileId}/confirm](#post---up-vibev1filesfileidconfirm)
    - [[DELETE] - /up-vibe/v1/files/{fileId}](#delete---up-vibev1filesfileid)
  - TAGS
    - [[GET] - /up-vibe/v1/files/{fileId}/tags](#get---up-vibev1filesfileidtags)
    - [[GET] - /up-vibe/v1/tags/{tagId}/picture](#get---up-vibev1tagstagidpicture)
    - [[POST] - /up-vibe/v1/files/{fileId}/custom-tags](#post---up-vibev1filesfileidcustom-tags)
    - [[POST] - /up-vibe/v1/files/{fileId}/custom-tags/picture](#post---up-vibev1filesfileidcustom-tagspicture)
  - TAG-MAPPINGS
    - [[GET] - /up-vibe/v1/tags/tag-mapping-priority](#get---up-vibev1tagstag-mapping-priority)
    - [[PUT] - /up-vibe/v1/tags/tag-mapping-priority](#put---up-vibev1tagstag-mapping-priority)
    - [[PUT] - /up-vibe/v1/files/{fileId}/tag-mappings](#put---up-vibev1filesfileidtag-mappings)
  - PLAYLISTS
    - [[GET] - /up-vibe/v1/playlists](#get---up-vibev1playlists)
    - [[GET] - /up-vibe/v1/playlists/{playlistId}](#get---up-vibev1playlistsplaylistid)
    - [[POST] - /up-vibe/v1/playlists](#post---up-vibev1playlists)
    - [[DELETE] - /up-vibe/v1/playlists/{playlistId}](#delete---up-vibev1playlistsplaylistid)

### [GET] - /up-vibe/v1/health

Check if the server is running.

#### Request for health check

```http
GET /up-vibe/v1/health
```

#### Response for health check

```http
HTTP/1.1 200 OK
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
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Auth test passed!"
}
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "message": "Requires authentication"
}
```

### [GET] - /up-vibe/v1/info

...

### [POST] - /up-vibe/v1/register

...

### [GET] - /up-vibe/v1/sources

...

### [GET] - /up-vibe/v1/sources/{sourceId}/logo

...

### [GET] - /up-vibe/v1/files

...

### [GET] - /up-vibe/v1/files/{fileId}

...

### [GET] - /up-vibe/v1/files/{fileId}/download

...

### [POST] - /up-vibe/v1/files

...

### [POST] - /up-vibe/v1/files/{fileId}/confirm

...

### [DELETE] - /up-vibe/v1/files/{fileId}

...

### [GET] - /up-vibe/v1/files/{fileId}/tags

...

### [GET] - /up-vibe/v1/tags/{tagId}/picture

...

### [POST] - /up-vibe/v1/files/{fileId}/custom-tags

...

### [POST] - /up-vibe/v1/files/{fileId}/custom-tags/picture

...

### [GET] - /up-vibe/v1/tags/tag-mapping-priority

...

### [PUT] - /up-vibe/v1/tags/tag-mapping-priority

...

### [PUT] - /up-vibe/v1/files/{fileId}/tag-mappings

...

### [GET] - /up-vibe/v1/playlists

...

### [GET] - /up-vibe/v1/playlists/{playlistId}

...

### [POST] - /up-vibe/v1/playlists

...

### [DELETE] - /up-vibe/v1/playlists/{playlistId}

...
