---
title: Surveys and Foorm
description: How the Foorm survey system serves PD workshops, and the legacy Jotform path.
type: concept
---

Workshop surveys collect feedback from participants and facilitators. The current system is Foorm, an internal JSON-defined form engine. A legacy Jotform path exists but is off by default.

## Foorm

Foorm forms are JSON files in `dashboard/config/foorm/`. Each form defines questions, validation rules, and conditional logic. The `Foorm::SimpleSurveyForm` model loads and renders these forms, and submissions are stored as `Foorm::SimpleSurveySubmission` records.

The `foorm_simple_survey_disabled` DCDO flag accepts an array of form names to disable. When a form name appears in this array, that survey returns a "disabled" response instead of rendering.

### Survey types and controllers

All survey routing lives in `Pd::WorkshopDailySurveyController`:

- **Daily surveys** (`/pd/workshop_survey/day/:day`, `/pd/workshop_daily_survey/day/:day`): one per workshop day.
- **Pre-workshop surveys** (`/pd/workshop_pre_survey`, `/pd/pre_workshop_survey/:enrollment_code`): sent before the workshop starts.
- **Post-workshop surveys** (`/pd/workshop_post_survey`, `/pd/workshop_survey/post/:enrollment_code`): sent after the final session.
- **Facilitator post surveys** (`/pd/workshop_survey/facilitator_post_foorm`): completed by facilitators after the workshop.
- **CSF-specific surveys** (`/pd/workshop_survey/csf/post101`, `/pd/workshop_survey/csf/post201`): surveys specific to CS Fundamentals Deep Dive and Intro workshops.
- **Academic year workshop surveys** (`/pd/:workshop_subject/pre/*`, `/pd/:workshop_subject/day/:day`, `/pd/:workshop_subject/post/*`): surveys for academic-year workshop modules.

`Pd::PostCourseSurveyController` handles post-course surveys at `/pd/post_course_survey/:course_initials`.

`Pd::MiscSurveyController` serves one-off surveys at `/pd/misc_survey/:form_tag`.

### Survey completion tracking

`Pd::Enrollment.filter_for_survey_completion` determines which enrollments have pending surveys. The PL landing page (`Pd::ProfessionalLearningController#index`) uses this to show a survey prompt to teachers who have not yet completed their exit survey.

## Jotform (legacy)

The `jotform_redirect` DCDO flag (default `false`) controls whether survey URLs redirect to Jotform-hosted forms instead of Foorm. When enabled, the `Pd::JotForm::EmbedHelper` generates embedded Jotform iframes. A cron job `fill_jotform_placeholders` runs every five minutes to sync Jotform submissions back into the PD data model.

Jotform is not the active survey path unless the flag is explicitly enabled.

## Survey reports

Survey results feed into several report endpoints:

- `Api::V1::Pd::WorkshopSurveyReportController` -- aggregated survey data
- `Pd::WorkshopSurveyResultsHelper` -- helpers for computing survey summaries

The stale design document at `docs/plc/survey-summary-design.md` (dated April 2019) describes an earlier iteration of the survey summary system. The current implementation has diverged.

## Related

- [PD object model](/developers/professional-learning/pd-object-model/)
- [Verification and permissions](/developers/professional-learning/verification-and-permissions/)
