# Account Management API

## Overview

I've based this API on the [FeedBin API]() and and [HTTP API Design](https://github.com/interagent/http-api-design) document.

Overall my goal was an API that allowed the UX to accomplish all of it's goals with a single AJAX request/response per user action.

FeedBin is impressively fast and their API design drives that. They're RESTful and explicit, though they deviate from the HTTP API Design recommendation to provide as much info as possible with every response. For their app, this is extremely smart because it eliminates a lot of duplication. In our app, this isn't generally the case so I haven't followed suit.

FeedBin also includes a .json extension on each document. This rubs me the wrong way *and* seems completely correct, all at the same time. The HTTP API Design document doesn't use extensions. I've opted not to use extensions because it's less typing.

FeedBin allows providing the list of properties to return when requesting a resource. This optimization seems unnecessary for our needs, but it's worth noticing the technique if we find ourselves with verbose responses.

Rails uses POST /container/new for document creation. I prefer the newer model used in FeedBin and the HTTP API Design document of POST /container because the Rails way polutes the container namespace and is out of date.

In almost all cases the only error reported is 403 FORBIDDEN. Basically we don't want outsiders to be able to detect the existance of resources they don't have access to so we don't differientiate between forbidden and not-found.

The whole API is prefixed with the "/v2" version indicator so that we can manage future changes to the API in a structured way. I know "/v1" doesn't exist but our current undifferentiated API is our v1.

## Sections

### List my sections

Returns all of the sections associated with the logged in user, grouped by said user's role in the section, i.e. "student" or "teacher". This call should return enough information to render a list of the sections with reasonable meta-data about the section, e.g. # of students/teachers.

```
GET /v2/sections

200 OK
Content-Type: application/json
{
  "student":[],
  "teacher":[
    { "id":"1", "name":"Morning", "student_count":5, "teacher_count":1 },
    { "id":"2", "name":"Afternoon", ... }
  ]
}
```

### Create a section

Create a new section. If "name" is empty or null, set it to a default (e.g. "New Section") to avoid an error case. "login_page" specifies the kind of login page to display for the section ("picture", "word-pair", "none").

```
POST /v2/sections
Content-Type: application/json
{
  "name":"Mid-day",
  "login_page":"Picture"
}

201 CREATED
Location: /v2/sections/3

403 FORBIDDEN (Not a teacher)
```

### View a section

Return all details about a section based on the current user's membership to the section. Note that a *teacher account* can be a *student member* of a section but a *student account* cannot be a *teacher member*. Teachers see additional details, especially the "secret" that can be used by non-members to view the section for importing. If the current user is not logged in and this section has a "login_page" value other than "none" this call returns enough information to render said login page, otherwise it returns 403 FORBIDDEN.

```
GET /v2/sections/3[?secret=ABC123]

200 OK
Content-Type: application/json
{
  "id":"3",
  "name":"Mid-day",
  "login_page":"picture",
  "secret":"123ABC",
  "students":[],
  "student_count":1,
  "teachers":[{"id":101, "name":"Laurel"],
  "teacher_count":1,
  "created_at":"2014-06-06 23:59.00Z",
  "updated_at":"2014-06-06 23:59.00Z",
}

403 FORBIDDEN (Not found/not member/not secret)
```

### Update a section

The "name" and "login_page" properties are modifiable. The "secret" property can be set to empty to have the system select a new secret. Setting "secret" to a specific value is not supported.

```
PATCH  /v2/sections/3 (or POST /v2/sections/3/update)
Content-Type: application/json
{
  "name":"Mid-morning",
  "login_page":"picture",
  "secret":""
}

200 OK
Content-Type: application/json
{
  "id":"3",
  "name":"Mid-morning",
  "secret":"CBA321"
  "students":[],
  "student_count":1,
  "teachers":[{"id":101, "name":"Laurel"],
  "teacher_count":1,
  "created_at":"2014-06-06 23:59.00Z",
  "updated_at":"2014-06-06 23:59.00Z",
}

403 FORBIDDEN (Not found/not owner)
```

### Delete a section

```
DELETE /v2/sections/3 (or POST /v2/sections/3/delete)

204 NO CONTENT (Success)
403 FORBIDDEN (Not found/not owner)
```

### List students in a section

Like "View a section", this method returns more or less information depending on the access level of the caller. For teachers return enough information to render the entire student list UX, except for student-secrets. For peers and access via secret code, return the names and ids (just enough for importing/sharing).

```
GET /v2/sections/3/students[?secret=CBA321]

200 OK
Content-type: application/json
[
  { "id":"1", "name":"Geoffrey" },
  { "id":"2", "name":"Laurel" },
]

403 FORBIDDEN (Not found/not owner-member/wrong secret)
```

### List teachers in a section using section secret

Like "View a section", this method returns more or less information depending on the access level of the caller. For teachers return enough information to render the teacher management list. For students and access via secret code, return the names and ids (just enough for import/sharing).

```
GET /v2/sections/3/teachers[?secret=abc123]

200 OK
Content-type: application/json
[
  { "id":"1", "name":"Jeffrey" },
  { "id":"2", "name":"Laurel" },
]

403 FORBIDDEN (Not found/not right secret)
```

### Add student(s) to a section

Post a list of students to add to the section. Existing students can be identified by id or email address ("id" and "email" keys respectively). The "name" key indicates that a new user should be created.

```
POST /v2/sections/3/students
Content-Type: application/json
[
  {"id":"3"},
  {"name":"Brendan"}
]

200 OK
Content-type: application/json
[
  { "id":"1", "name":"Geoffrey" },
  { "id":"2", "name":"Laurel" },
  { "id":"3", "name":"Brendan" }
]

403 FORBIDDEN (Not found/not owner)
```

### Add teachers(s) to a section

Post a list of teachers to add (as teachers!) to the section. The call must provide an "id" or "email." Teachers cannot be added or created by "name".

QUESTIONABE: If the "email" isn't already a user in our system we send them a "Joe invited you to become a teacher for his section..." email.

```
POST /v2/sections/3/teachers
Content-Type: application/json
[
  {"id":"2"},
  {"email":"hadi@code.org"}
]

200 OK
Content-type: application/json
[
  { "id":"1", "name":"Roxanne", ... },
  { "id":"2", "name":"Laura", ... }
  { "id":"3", "name":"hadi", "email":"hadi@code.org", "email_confirmed":"false", ... }
]

403 FORBIDDEN (Not found/not owner)
```

### Update (set) students in a section

PATCH replaces the current set of students with the list provided. The same rules for student identification/creation as "Add student(s) to a section" apply here.

**Note: In the example, TWO Brendans end up in the list...**

```
PATCH /v2/sections/3/students (or POST /v2/sections/3/students/update)
Content-Type: application/json
[
  {"id":"2"}
  {"id":"3"}
  {"name":"Brendan"}
]

200 OK
Content-type: application/json
[
  { "id":"2", "name":"Laurel" },
  { "id":"4", "name":"Brendan" }
  { "id":"5", "name":"Brendan" }
]

403 FORBIDDEN (Not found/not owner)
```

### Update (set) teachers in a section

PATCH replaces the current set of teachers with the list provided. The same rules for teacher identification/creation as "Add teachers(s) to a section" apply here.

```
PATCH /v2/sections/3/teachers (or POST /v2/sections/3/teachers/update)
Content-Type: application/json
[
  {"id":"1"}
  {"id":"3"}
]

200 OK
Content-type: application/json
[
  { "id":"1", "name":"Roxanne", ... },
  { "id":"3", "name":"hadi", ... }
]

403 FORBIDDEN (Not found/not owner)
```

### Remove a student from a section

```
DELETE /v2/sections/3/students/5 (or POST /v2/sections/3/students/5/delete)

204 NO CONTENT (Success)
403 FORBIDDEN (Not found/not owner)
```

### Remove a teacher from a section

```
DELETE /v2/sections/3/teachers/3 (or POST /v2/sections/3/teachers/3/delete)

204 NO CONTENT (Success)
403 FORBIDDEN (Not found/not owner)
```

## Students

### List all students known to me

NOTE: I don't currently see a place in UI where this call is required so it doesn't need to be implemented unless one shows up.

```
GET /v2/students

200 OK
Content-type: application/json
[
  { "id":"1", "name":"Jeffrey" },
  { "id":"2", "name":"Laurel" },
  { "id":"3", "name":"Hadi", "email":"hadi@code.org", ... },
]
```

### Read student profile

Return everything the current user should know about the specified user. If the specified user is self, return all data. If the specified user is self's student, return the secret picture/secret word, along with all other teacher appropriate data. Peers see names and ids and little/nothing else.

This *might* be a place for a "?fields=" optimization because our UI does request a reveal of the secret picture/word in a context where that's the *only* piece of data it needs. The "Confirm your email" UI also has a loop where it would only need to query for the "email_confirmed" property.

```
GET /v2/students/1

200 OK
Content-Type: application/json
{
  "id":"1",
  "name":"Jeffrey"
}

403 FORBIDDEN (Not found/not owner/not teacher for or peer of)
```

### Update student profile

Self can change anything. Teachers can change names and secret picture/word.

A specific secret word/picture cannot be chosen, instead the property can be set to empty or null and a random one will be chosen and returned.

Adding an email address should also add an "email_confirmed" property and trigger the confirmation process.

```
PATCH  /v2/students/1 (or POST /v2/students/1/update)
Content-Type: application/json
{
  "name":"Geoffrey",
  "email":"geoffrey@code.org"
}

200 OK
Content-Type: application/json
{
  "id":"1",
  "name":"Geoffrey",
  "email":"geoffrey@code.org",
  "email_confirmed":false
}

403 FORBIDDEN (Not found/not owner/not teacher for)
```

### Delete a student

```
DELETE /v2/students/1 (or POST /v2/students/1/delete)

204 NO CONTENT (Success)
403 FORBIDDEN (Not found/not owner)
```

## Teachers

### List all teachers known to me

NOTE: I don't currently see a place in the UX where this is needed. Don't implement if not needed.

```
GET /v2/teachers

200 OK
Content-type: application/json
[
  { "id":"1", "name":"Roxanne", ... },
  { "id":"2", "name":"Laura", ... }
]
```

## Read teacher profile

```
GET /v2/teachers/1

200 OK
Content-Type: application/json
{
  "id":"1",
  "name":"Roxanne",
  "email","roxanne@code.org",
  "email_confirmed":true
}

403 FORBIDDEN (Not found/not owner/not peer of)
```

## Update teacher profile

```
PATCH  /v2/teachers/1 (or POST /v2/teachers/1/update)
Content-Type: application/json
{
  "name":"Ms. Emadi",
}

200 OK
Content-Type: application/json
{
  "id":"201",
  "name":"Ms. Emadi",
  "email","roxanne@code.org",
  "email_confirmed":true
}

403 FORBIDDEN (Not found/not owner)
```

### Delete a teacher

```
DELETE /v2/teachers/1 (or POST /v2/teachers/1/delete)

204 NO CONTENT (Success)
403 FORBIDDEN (Not found/not owner)
```

