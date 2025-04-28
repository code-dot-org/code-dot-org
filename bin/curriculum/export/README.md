## export unit progress

This directory contains ruby scripts for exporting unit progress data from the database,
adding student source code from S3, and filtering the results to exclude PII. the PII filtering
is done using AWS Comprehend.

## 💰💰 WARNING 💰💰

The PII filtering step can incur substantial costs. Please be sure to
double-check your requirements before running through these steps. Also check to
see if the data you need is already available by checking the 
[unit progress shares](https://docs.google.com/spreadsheets/d/1BiK3a3rlEEto1x9_ITjX7l0CsbhO0WZQrdYNdISWKQA/edit)
gsheet which should contain links to the data in S3.

## Overview
  
the export process is broken into a few distinct steps: 

| step                    | command                  | output location                                         |
|-------------------------|--------------------------|---------------------------------------------------------|
| export from redshift    | export_unit_progress.rb  | s3://cdo-data-sharing-internal/unloaded-unit-progress/  |
| add project source code | add_unit_source.rb       | production-daemon:/mnt/tmp-curriculum-export/sourced/   |
| filter pii              | filter_unit_pii.rb       | production-daemon:/mnt/tmp-curriculum-export/filtered/  |
| upload to s3            | aws s3 cp --recursive    | s3://cdo-data-sharing/filtered-unit-progress/           |

note that we write to:
* **s3://cdo-data-sharing-internal** in the first step because this is where redshift has permission to write to, and
* **s3://cdo-data-sharing** in the last step because this is a more appropriate location for data to be shared externally.



## Usage

To export progress for a given unit:

1. check the [unit progress shares](https://docs.google.com/spreadsheets/d/1BiK3a3rlEEto1x9_ITjX7l0CsbhO0WZQrdYNdISWKQA/edit)
   gsheet to confirm that the data you need is not already available.

2. choose a descriptive name for your new dataset indicating the unit name and date range:
  - `<unit-name>-ending-YYYY-MM-DD` (e.g. `csd3-2024-ending-2025-04-01` for units less than 1 year old)
  - `<unit-name>-school-year-2023` (prefer capturing one entire school year at a time for units > 1 year old)
  -  see [unit progress shares](https://docs.google.com/spreadsheets/d/1BiK3a3rlEEto1x9_ITjX7l0CsbhO0WZQrdYNdISWKQA/edit)
     gsheet for more details and examples.

3. connect to production-daemon
```bash
ssh -t gateway ssh production-daemon
cd production
```

4. export unit progress from redshift
```bash
SKIP_SCRIPT_PRELOAD=1 bin/curriculum/export/export_unit_progress.rb -u unit-name -o unit-name-and-date-range
```
where `unit-name-and-date-range` is something like `csd3-2024-ending-2025-04-01`.
the above command runs a redshift query whose results are written to
s3://cdo-data-sharing-internal via the `UNLOAD` command.

5. add student source code from S3
```bash
SKIP_SCRIPT_PRELOAD=1 bin/curriculum/export/add_unit_source.rb -i unit-name-and-date-range
```

6. inspect the output for validity before performing the expensive PII filtering step
```bash
ls -l /mnt/tmp-curriculum-export/sourced/<unit-name-and-date-range>/progress
less /mnt/tmp-curriculum-export/sourced/<unit-name-and-date-range>/progress/<filename>
```

7. filter the output to exclude PII
```bash
bin/curriculum/export/filter_unit_pii.rb -i unit-name-and-date-range
```

8. inspect the output for validity before uploading to S3
```bash
ls -l /mnt/tmp-curriculum-export/filtered/<unit-name-and-date-range>/progress
less /mnt/tmp-curriculum-export/filtered/<unit-name-and-date-range>/progress/<filename>
```

9. upload the filtered output to S3
```bash
# s3 dir should be empty to start
aws s3 ls s3://cdo-data-sharing/filtered-unit-progress/<unit-name-and-date-range>/
# if the dir is empty, go ahead and upload 
aws s3 cp --recursive /mnt/tmp-curriculum-export/filtered/<unit-name-and-date-range> s3://cdo-data-sharing/filtered-unit-progress/<unit-name-and-date-range>
```

10. add a row to the 
   [unit progress shares](https://docs.google.com/spreadsheets/d/1BiK3a3rlEEto1x9_ITjX7l0CsbhO0WZQrdYNdISWKQA/edit)
   gsheet describing your data so that it can be used again by others. be sure to include exact date range.

11. share the data with the requester

    - login to AWS console in your web browser
    - navigate to https://us-east-1.console.aws.amazon.com/s3/buckets/cdo-data-sharing?region=us-east-1&bucketType=general&prefix=unit-export/&showversions=false 

12. clean up

Once you are happy with the data you've uploaded to S3, you should clean up the temporary files on production-daemon:
```bash
rm -rf /mnt/tmp-curriculum-export/sourced/<unit-name-and-date-range>
rm -rf /mnt/tmp-curriculum-export/filtered/<unit-name-and-date-range>
```
## Troubleshooting

* if you run out of disk space on /mnt/tmp-curriculum-export, you can clean up old files from `/mnt/tmp-curriculum-export/sourced/` and `/mnt/tmp-curriculum-export/filtered/` and try again. `add_unit_source.rb` and `filter_unit_pii.rb` are safe to rerun, as they are designed to skip over any input files if the output file already exists.
* if you need to rerun any of the scripts and the output location dir is already in use from a previous run which you do not want to throw away, you can specify a new output location with `-o`.
* for more options, see the `--help` output for each script.
 

## Development

to minimize time and cost while iterating during development, you should work on
a small dataset.  In case the unit you're working on has many progress rows,
ways you can accomplish this include:
* pass `-l <level_id>` to `export_unit_progress.rb` 
* truncate the files output by `export_unit_progress.rb`, for example:
```bash
aws s3 cp s3://cdo-data-sharing-internal/unloaded-unit-progress/csd3-2023/progress/csd3-2023_0000_part_00.jsonl <local-file-1>
head -n 1000 <local-file-1> > <local-file-2> 
aws s3 cp <local-file-2> s3://cdo-data-sharing-internal/unloaded-unit-progress/csd3-2023-1K/progress/csd3-2023_0000_part_00.jsonl    
```
then use `csd3-2023-1K` as the unit name for subsequent steps. 
* To use a dataset that's already been truncated, look at `s3://cdo-data-sharing-internal/unloaded-unit-progress/csd3-2023-30K/progress/`. this directory should contain 3 files with 10K lines each.

## Understanding the data

Here is the layout of the data in a typical dataset:
```
$ aws s3 ls --recursive s3://cdo-data-sharing/filtered-unit-progress/csd3-2024-ending-2025-04-22-rubrics/
evals/csd3-2024_ai_evals_000.jsonl
evals/csd3-2024_evidence_levels_000.jsonl
evals/csd3-2024_teacher_evals_000.jsonl
progress/csd3-2024_0000_part_00.jsonl
progress/csd3-2024_0001_part_00.jsonl
...
progress/csd3-2024_0011_part_00.jsonl
```

### Progress

The files in the `progress` directory includes student source code, except where
PII was detected. The rows are split into multiple files and are not bucketed or
sorted in any order. Here are some of the key fields:
* `hashed_user_id`: anonymized identifier for the student
* `level_id`: the level id for the level the student was working on
* `script_id`: the script id for the script (a.k.a. unit) the student was working on
* `user_level_id`: unique identifier for a row in this dataset representing a
  student's work on this level within this script / unit.
* `source`: the source code the student wrote, unless PII score was above a threshold of 0.7
* `source_pii_score`: the PII score for the source code
* `source_pii_entities`: metadata regarding the pii entities detected in the source code
* `student_answer`: in some cases the student's answer to a question will appear
  here instead of in `source`. this can be an answer to a free response
  question, or it can in some cases be source code. the location of the
  student's work will be consistent for a given level.
* `student_answer_pii_score`: see `source_pii_score` 
* `student_answer_pii_entities`: see `source_pii_entities`
* `source_versions`: see below

#### Source Versions

The `source_versions` field is a JSON array containing the source code for each
version of the project. Here is an example:
```
{
  "source_versions": [
    {
      "versionId": "e6vJbk8B17DM9eag36pAfsPxI_2kkJ6A",
      "lastModified": "2024-12-05T18:34:25.000Z",
      "isLatest": true,
      "version_source": "...",
      "version_source_pii_score": 0,
      "version_source_pii_entities": []
    }
    ...
  ],
  ...
}
```

If any versions are present, one of them will be marked as `isLatest`. This will
contain an exact copy of the `source`, `source_pii_score` and `source_pii_entities`
top-level fields. Non-latest versions will contain past versions of the project source
code, each with their own pii score and pii entities. `versionId` can be
joined against the `project_version` field in the `evals` files.

### Evaluations

There are three files that can appear in the `evals` directory. Note that all 3
of these files apply only to a small subset of levels which have rubrics and AI
/ teacher assessments enabled for them. These levels typically represent longer
assignments that students spent more time on than other levels.

#### AI Evaluations

AI evaluations of student work, as well as any teacher feedback regarding the
accuracy or quality of the AI response. key fields:
* `user_level_id`: the join key to join against the `progress` file.
  alternately, `[hashed_user_id, script_id, level_id]` can be used.
* `learning_goal_text` and `learning_goal_tips` describe what the student is 
  expected to do on this level to achieve the learning goal (together with 
  "evidence levels" below)
* `project_version` the version of the project which was evaluated. if the
  dataset includes past versions, this can be matched against the `versionId`
  field in the `source_versions` array in the `progress` file.
* `ai_understanding`: the understanding level assigned by the AI. this is a number
  between 0 and 3, where 0 means "no evidence" and 3 means "extensive evidence".
  see "evidence levels" below for a definition of what each level means for the
  particular learning goal.
* `ai_confidence_exact_match`: our confidence level that the `ai_understanding` is correct on the 0-3 scale. 
* `ai_confidence_pass_fail`: our confidence level that the `ai_understanding` is
  correct on a pass-fail basis, where scores of 0 or 1 are failing and 2 or 3 are
  passing. e.g. if the `ai_understanding` is 2, then this field indicates our
  confidence that either 2 or 3 is correct.
* `ai_feedback`: if present, indicates whether the teacher agreed with the AI assessment.
* `ai_feedback_*`: other fields containing more details on what the teacher said about the AI assessment.

#### Teacher Evaluations

Teacher evaluations of student work. key fields:
* `user_level_id`: the join key to join against the `progress` file. alternately, 
  `[hashed_user_id, script_id, level_id]` can be used.
* `understanding`: the understanding level assigned by the teacher. see "evidence levels" below.
* `teacher_feedback`: any free text the teacher included to justify or elaborate upon their assessment.
* `project_version` the version of the project which was evaluated (see above).

#### Evidence Levels

Metadata for each level describing what is required to achieve each evidence
level 0-3 for each learning goal on the rubric for the specified level. Note
that it will generally be necessary to consider all rows for a given script_id +
level_id + learning goal, because the teacher or AI will typically look at the
requirements for all evidence levels for that learning goal before deciding what
understanding level to assign. while it might be tempting to just look at the
evidence level which matches the understanding level assigned by the teacher or
AI, this would likely leave out key context.

key fields: 
* `learning_goal_id`: the join key to join against the other datasets.
  alternately, `[script_id, level_id, learning_goal_position]` can be used.
* `learning_goal_description`: same as `learning_goal_text` in the other files.
* `learning_goal_tips`: see above
* `understanding`: the understanding level described by this row.
* `teacher_description`: teacher-facing text describing what the student must do
  to achieve this `understanding` level.
