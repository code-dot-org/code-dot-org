---
title: How school data works
description: What CodeAI knows about your school and district, where the data comes from, and how teachers update it.
type: concept
---

CodeAI maintains a directory of U.S. schools and districts sourced from the National Center for Education Statistics (NCES). This page covers where the data comes from, how teachers associate with a school, and what district staff can and cannot access. District staff cannot edit this data or view it through CodeAI -- it is reference data used internally to connect teachers to schools, support the annual CS education census, and match teachers with local professional learning.

## School and district records

Each school record includes the school name, address, type (public, charter, private), state, and the district it belongs to. Teachers and students do not edit these records.

Teachers at schools not in the NCES dataset -- homeschool, afterschool programs, international schools, or organizations -- enter a school name manually during sign-up or in their account settings.

## Teacher-school association

When a teacher creates an account, CodeAI asks them to search for and select their school. Teachers can update their school at any time from their [account settings](/guide/getting-started/account-settings/).

CodeAI periodically asks teachers to confirm they still teach at the same school. The confirmation appears as a banner; teachers can confirm, update, or postpone.

## CS education census

CodeAI runs an annual census asking teachers whether their school offers computer science courses. Teachers see a banner inviting them to submit a census response. The data is aggregated at the school and district level and published in reports on CS education access.

Census data is self-reported by teachers. It is not pulled from the LMS, Clever, or any other automated source.

## What is not available

- **No district data entry or management.** District staff cannot edit school records, view which teachers are associated with their schools, or see census responses for their district through CodeAI.
- **No district login.** There is no account type or permission that gives district-level read access to school data in CodeAI.
- **No automated school association.** When a teacher signs in through Clever or an LMS, CodeAI does not automatically set their school from the external service's metadata.

To get data about your district's CodeAI usage, see [District reporting](/guide/integrations/reporting/).

## Further reading

- [Update your school](/guide/getting-started/account-settings/) (teacher-facing)
- [District reporting](/guide/integrations/reporting/)
