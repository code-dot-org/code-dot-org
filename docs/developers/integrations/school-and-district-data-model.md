---
title: School and district data model
description: How schools, districts, and teacher-school associations are modeled in CodeAI.
type: reference
---

CodeAI maintains reference data for U.S. schools and districts sourced from the National Center for Education Statistics (NCES). Teachers associate themselves with a school at sign-up or later in account settings.

## Models

### `School`

Reference data. One row per NCES school.

| Column | Description |
|---|---|
| `id` | NCES school ID (12-digit string) |
| `school_district_id` | FK to `SchoolDistrict` |
| `name`, `address_line1`, `city`, `state`, `zip` | Location |
| `school_type` | `public`, `charter`, `private` |
| `state_school_id` | State-assigned ID |

Associations: `belongs_to :school_district`, `has_many :school_infos`.

Seeded by `rake seed:schools` from `dashboard/config/schools.tsv`.

### `SchoolDistrict`

Reference data. One row per NCES district.

| Column | Description |
|---|---|
| `id` | NCES district ID (7-digit integer) |
| `name`, `city`, `state`, `zip` | Location |

Associations: `has_many :schools`, `has_many :regional_partners, through: :regional_partners_school_districts`.

Seeded by `rake seed:school_districts` from `dashboard/config/school_districts.tsv`.

### `SchoolInfo`

An intermediate record linking a user's self-reported school data to a canonical `School` record when one exists. For schools not in the NCES dataset (homeschool, afterschool, international, or organizations), `SchoolInfo` stores free-text fields directly.

| Column | Description |
|---|---|
| `school_id` | FK to `School` (nullable) |
| `school_district_id` | FK to `SchoolDistrict` (nullable) |
| `school_type` | One of: `public`, `charter`, `private`, `homeschool`, `afterschool`, `organization`, `noSchoolSetting`, `other` |
| `school_name`, `school_district_name` | Free text (used when no NCES match) |
| `country`, `state`, `zip` | Location |
| `validation_type` | `full`, `none`, or `complete` |

When `school_id` is present, the denormalized columns (`school_type`, `state`, `zip`, `school_district_id`) are copied from the `School` record. Historical inconsistencies exist; see `dashboard/app/models/SCHOOL_DATA_README.md`.

Deduplication: `SchoolInfoDeduplicator` (`dashboard/lib/school_info_deduplicator.rb`) attempts to find an existing `SchoolInfo` row before creating a new one. Deduplication is not transactional and must be called explicitly.

### `UserSchoolInfo`

Links a user to a `SchoolInfo` record with temporal metadata.

| Column | Description |
|---|---|
| `user_id` | FK to `User` |
| `school_info_id` | FK to `SchoolInfo` |
| `start_date`, `end_date` | When the association was active |
| `last_confirmation_date` | When the teacher last confirmed this school |

Teachers periodically confirm their school via a census banner. The confirmation updates `last_confirmation_date` through `PATCH /api/v1/user_school_infos/:id/update_last_confirmation_date`.

## Census

`Census::CensusSubmission` records teacher-reported data about whether their school offers CS courses. Submitted via `POST /api/v1/census`. Aggregated results are stored in `SchoolStatsByYear`.

## Key invariants

- There is no model, column, or authorization rule that grants a user authority over a district or its schools. The only district-level relationship in the schema is `SchoolDistrict` to `RegionalPartner` (Code.org's partner-territory bookkeeping).
- `SchoolInfo` rows can duplicate for the same `school_id` due to deduplication timing and validation-type mismatch. See `SCHOOL_DATA_README.md` for known data quality issues.
- School data is confidential (`data_classification :confidential` on all columns).

## Related pages

- [How school data works](/guide/integrations/how-school-data-works/) (admin-facing)
- [LTI 1.3 integration](/developers/integrations/lti-integration/)
- [Roster sync architecture](/developers/integrations/roster-sync-architecture/)
