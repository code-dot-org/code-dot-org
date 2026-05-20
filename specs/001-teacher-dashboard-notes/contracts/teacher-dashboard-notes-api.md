# Contract: Teacher Dashboard Notes API

All routes are JSON routes under dashboard. All routes require an authenticated teacher.

## Shared Types

### Context Type

```text
course | unit | lesson
```

### Note Summary

```json
{
  "id": 101,
  "body": "Skip lesson 5.",
  "contextType": "unit",
  "unitGroupId": null,
  "unitId": 456,
  "lessonId": null,
  "sectionId": null,
  "sharedWithSection": false,
  "shareableGlobally": false,
  "isOwner": true,
  "authorName": "Ms. Rivera",
  "createdAt": "2026-05-12T22:00:00Z",
  "updatedAt": "2026-05-12T22:05:00Z",
  "lockVersion": 0
}
```

## List Visible Notes

```text
GET /dashboardapi/v1/teacher_dashboard_notes
```

### Query Parameters

- `section_id`: required section id for the current Lesson Materials page
- `unit_id`: required unit id for the current Lesson Materials page
- `unit_group_id`: optional course id for the current Lesson Materials page
- `lesson_id`: optional selected lesson id

### Behavior

Returns notes visible to the current teacher for the current page:

- the teacher's own course notes matching `unit_group_id`;
- the teacher's own unit notes matching `unit_id`;
- the teacher's own lesson notes matching `lesson_id`;
- shared coteacher notes for the same section and matching page contexts.

### Success Response

```json
{
  "contexts": {
    "sectionId": 6545266,
    "unitGroupId": 123,
    "unitId": 456,
    "lessonId": 789
  },
  "notes": [
    {
      "id": 101,
      "body": "Skip lesson 5.",
      "contextType": "unit",
      "unitGroupId": null,
      "unitId": 456,
      "lessonId": null,
      "sectionId": null,
      "sharedWithSection": false,
      "shareableGlobally": false,
      "isOwner": true,
      "authorName": "Ms. Rivera",
      "createdAt": "2026-05-12T22:00:00Z",
      "updatedAt": "2026-05-12T22:05:00Z",
      "lockVersion": 0
    }
  ]
}
```

### Errors

- `403 Forbidden`: current user is not an active instructor for `section_id`
- `400 Bad Request`: required context parameters are missing or invalid

## Create Note

```text
POST /dashboardapi/v1/teacher_dashboard_notes
```

### Request Body

```json
{
  "teacherDashboardNote": {
    "body": "Remember that Caleb should be paired with Jared.",
    "contextType": "lesson",
    "unitGroupId": null,
    "unitId": null,
    "lessonId": 789,
    "sectionId": 6545266,
    "sharedWithSection": true,
    "shareableGlobally": false
  }
}
```

### Behavior

Creates a note owned by the current teacher. `sectionId` may be null for an all-sections private note. `sharedWithSection` may be true only when `sectionId` is present. `shareableGlobally` marks the note for possible later Code.org review or sharing and does not change note visibility.

### Success Response

```text
201 Created
```

Returns the created Note Summary.

### Errors

- `400 Bad Request`: blank body, invalid context, invalid sharing state, or body longer than the accepted limit
- `403 Forbidden`: current user cannot instruct the requested section

## Update Note

```text
PATCH /dashboardapi/v1/teacher_dashboard_notes/:id
```

### Request Body

```json
{
  "teacherDashboardNote": {
    "body": "Skip lesson 5 unless the class needs another practice day.",
    "contextType": "unit",
    "unitGroupId": null,
    "unitId": 456,
    "lessonId": null,
    "sectionId": null,
    "sharedWithSection": false,
    "shareableGlobally": true,
    "lockVersion": 0
  }
}
```

### Behavior

Updates an owned note. The request must include the last `lockVersion` seen by the client.

### Success Response

Returns the updated Note Summary.

### Conflict Response

```text
409 Conflict
```

```json
{
  "error": "stale note",
  "note": {
    "id": 101,
    "body": "Current saved note body.",
    "contextType": "unit",
    "unitGroupId": null,
    "unitId": 456,
    "lessonId": null,
    "sectionId": null,
    "sharedWithSection": false,
    "shareableGlobally": true,
    "isOwner": true,
    "authorName": "Ms. Rivera",
    "createdAt": "2026-05-12T22:00:00Z",
    "updatedAt": "2026-05-12T22:10:00Z",
    "lockVersion": 1
  }
}
```

### Errors

- `400 Bad Request`: invalid body, context, sharing state, or lock version
- `403 Forbidden`: current user does not own the note
- `404 Not Found`: note id does not exist or is not visible as an owned note

## Delete Note

```text
DELETE /dashboardapi/v1/teacher_dashboard_notes/:id
```

### Behavior

Deletes an owned note.

### Success Response

```text
204 No Content
```

### Errors

- `403 Forbidden`: current user does not own the note
- `404 Not Found`: note id does not exist or is not visible as an owned note

## Lesson Materials Data Addition

The existing lesson materials response should include course context when available:

```json
{
  "unitId": 456,
  "unitGroupId": 123,
  "unitName": "Unit 1",
  "lessons": []
}
```

This lets the notes UI request course, unit, and selected lesson notes without reconstructing course identity from URLs.
