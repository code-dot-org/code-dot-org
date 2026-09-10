---
title: Clever and Google Classroom
description: How Clever and Google Classroom roster sync works with CodeAI, and what district staff should expect.
type: concept
---

Clever and Google Classroom roster import in CodeAI is teacher-driven. Each teacher imports their own classes individually. There is no district-wide setup step and no district-level sync.

## How teachers import rosters

A teacher creates a section in CodeAI and chooses **Clever** or **Google Classroom** as the login type. CodeAI uses the teacher's own Clever or Google credentials to pull the roster. Students then sign in through Clever or Google.

The roster stays in sync with the external service. When the teacher adds or removes a student in Clever or Google Classroom, they sync the section in CodeAI to pick up the change.

For step-by-step instructions, see [Import a roster](/guide/sections/import-a-roster/).

## Clever admin accounts in CodeAI

CodeAI has only two account types: student and teacher. When a Clever district administrator or school administrator signs in to CodeAI through Clever, CodeAI creates a standard teacher account for them. The Clever admin role is not carried over and grants no additional permissions in CodeAI.

If you sign in through Clever as a district admin, you can do everything a teacher can do: create sections, assign courses, and view your own students' progress. You cannot view other teachers' sections or see district-wide data.

## What is not available

- **No district-level roster sync.** CodeAI does not sync an entire district's roster from Clever. Each teacher syncs their own classes individually.
- **No admin dashboard.** There is no view in CodeAI that shows all Clever-synced or Google Classroom-synced sections across a school or district.
- **No automatic section creation.** The teacher must create the section in CodeAI and choose the roster source. CodeAI does not auto-create sections from Clever or Google Classroom.

## Further reading

- [Import a roster](/guide/sections/import-a-roster/) (teacher-facing)
- [Connect your LMS to CodeAI](/guide/integrations/connect-your-lms/) (for Canvas or Schoology)
- [District reporting](/guide/integrations/reporting/)
