# Contract: Section Calendar Plan API

All routes are authenticated teacher routes. The server must reject mutation unless the current user can manage the target section.

## GET `/dashboardapi/sections/:section_id/calendar_plan`

Reads the saved calendar plan for the selected section and unit context.

Query parameters:

- `course_name`: required when the section is assigned through a course.
- `unit_position`: required when the section is assigned through a course.
- `unit_name`: optional legacy single-unit context.

Response `200`:

```json
{
  "plan": {
    "id": 123,
    "sectionId": 6545266,
    "unitId": 42,
    "courseName": "csd-2024",
    "unitPosition": 1,
    "startDate": "2026-09-08",
    "mode": "detailed_sessions",
    "weeklyInstructionalMinutes": 225,
    "sessions": [
      {
        "id": 1,
        "kind": "recurring",
        "weekday": "tuesday",
        "startTime": "11:00",
        "durationMinutes": 45,
        "position": 0
      },
      {
        "id": 2,
        "kind": "one_off",
        "date": "2026-09-09",
        "startTime": "09:30",
        "durationMinutes": 30,
        "position": 1
      }
    ],
    "cancellations": [
      {
        "id": 10,
        "sessionDate": "2026-10-13",
        "recurringSessionClientId": "recurring-tue-1100",
        "oneOffSessionClientId": null,
        "reason": "assembly"
      }
    ],
    "items": [
      {
        "id": 100,
        "itemType": "lesson",
        "lessonId": 321,
        "sessionDate": "2026-09-08",
        "sessionClientId": "recurring-tue-1100",
        "sessionSort": 0,
        "removed": false
      },
      {
        "id": 101,
        "itemType": "placeholder",
        "placeholderTitle": "paper plane experiment",
        "plannedMinutes": 20,
        "sessionDate": "2026-09-08",
        "sessionClientId": "recurring-tue-1100",
        "sessionSort": 1,
        "removed": false
      }
    ],
    "updatedAt": "2026-05-12T23:00:00Z"
  }
}
```

Response `200` when no saved plan exists:

```json
{
  "plan": null,
  "defaults": {
    "mode": "weekly_minutes",
    "weeklyInstructionalMinutes": 225
  }
}
```

Errors:

- `400`: missing or invalid unit context.
- `403`: user cannot read the section.
- `404`: section or unit not found.

## PUT `/dashboardapi/sections/:section_id/calendar_plan`

Creates or replaces the saved plan for the selected section and unit context.

Request:

```json
{
  "courseName": "csd-2024",
  "unitPosition": 1,
  "unitName": null,
  "startDate": "2026-09-08",
  "mode": "detailed_sessions",
  "weeklyInstructionalMinutes": 225,
  "sessions": [
    {
      "kind": "recurring",
      "weekday": "tuesday",
      "startTime": "11:00",
      "durationMinutes": 45,
      "position": 0
    },
    {
      "kind": "recurring",
      "weekday": "friday",
      "startTime": "14:00",
      "durationMinutes": 75,
      "position": 1
    },
    {
      "kind": "one_off",
      "date": "2026-09-09",
      "startTime": "09:30",
      "durationMinutes": 30,
      "position": 2
    }
  ],
  "cancellations": [
    {
      "sessionDate": "2026-10-13",
      "recurringSessionClientId": "recurring-tue-1100",
      "oneOffSessionClientId": null,
      "reason": "assembly"
    }
  ],
  "items": [
    {
      "itemType": "lesson",
      "lessonId": 321,
      "sessionDate": "2026-09-08",
      "sessionClientId": "recurring-tue-1100",
      "sessionSort": 0,
      "removed": false
    },
    {
      "itemType": "lesson",
      "lessonId": 322,
      "sessionDate": null,
      "sessionClientId": null,
      "sessionSort": null,
      "removed": true
    },
    {
      "itemType": "placeholder",
      "placeholderTitle": "paper plane experiment",
      "plannedMinutes": 20,
      "sessionDate": "2026-09-08",
      "sessionClientId": "recurring-tue-1100",
      "sessionSort": 1,
      "removed": false
    }
  ]
}
```

Response `200`:

```json
{
  "plan": {
    "id": 123,
    "sectionId": 6545266,
    "unitId": 42,
    "courseName": "csd-2024",
    "unitPosition": 1,
    "startDate": "2026-09-08",
    "mode": "detailed_sessions",
    "weeklyInstructionalMinutes": 225,
    "sessions": [],
    "cancellations": [],
    "items": [],
    "updatedAt": "2026-05-12T23:00:00Z"
  }
}
```

Errors:

- `400`: invalid plan data.
- `403`: user cannot manage the section.
- `404`: section or unit not found.
- `422`: validation error; response includes field errors.

## DELETE `/dashboardapi/sections/:section_id/calendar_plan`

Resets the selected section/unit calendar plan to default generated behavior.

Query parameters:

- `course_name`
- `unit_position`
- `unit_name`

Response `204`: plan deleted.

Errors:

- `403`: user cannot manage the section.
- `404`: section, unit, or plan not found.

## Notes

- Removing a lesson from this plan must not call hidden-lesson APIs.
- The API stores plan facts. The client may generate the visible schedule from plan facts plus unit summary lessons.
- The server should validate that lesson ids belong to the selected unit.
- `sessions` can contain recurring weekly sessions and one-off manual sessions. If implementation needs stricter typing, split these into `recurringSessions` and `oneOffSessions` while keeping the same facts.
