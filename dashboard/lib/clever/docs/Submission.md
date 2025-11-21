# Clever::Submission

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **assignment_id** | **String** |  | [optional] |
| **attachments** | [**Array&lt;Attachment&gt;**](Attachment.md) |  | [optional] |
| **created** | **String** |  | [optional] |
| **extra_attempts** | **Integer** |  | [optional] |
| **flags** | [**Array&lt;SubmissionFlag&gt;**](SubmissionFlag.md) |  | [optional] |
| **grade** | **String** |  | [optional] |
| **grade_comment** | **String** |  | [optional] |
| **grade_points** | **Float** |  | [optional] |
| **grader_id** | **String** |  | [optional] |
| **id** | **String** |  | [optional] |
| **last_modified** | **String** |  | [optional] |
| **override_due_date** | **String** |  | [optional] |
| **state** | [**SubmissionState**](SubmissionState.md) |  | [optional] |
| **user_id** | **String** |  | [optional] |

## Example

```ruby
require 'clever_client'

instance = Clever::Submission.new(
  assignment_id: null,
  attachments: null,
  created: null,
  extra_attempts: null,
  flags: null,
  grade: null,
  grade_comment: null,
  grade_points: null,
  grader_id: null,
  id: null,
  last_modified: null,
  override_due_date: null,
  state: null,
  user_id: null
)
```

