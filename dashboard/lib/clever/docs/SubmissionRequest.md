# Clever::SubmissionRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **attachments** | [**Array&lt;AttachmentRequest&gt;**](AttachmentRequest.md) |  | [optional] |
| **extra_attempts** | **Integer** |  | [optional] |
| **flags** | [**Array&lt;SubmissionFlag&gt;**](SubmissionFlag.md) |  | [optional] |
| **grade** | **String** |  | [optional] |
| **grade_comment** | **String** |  | [optional] |
| **grade_points** | **Float** |  | [optional] |
| **grader_id** | **String** |  | [optional] |
| **override_due_date** | **String** |  | [optional] |
| **state** | [**SubmissionState**](SubmissionState.md) |  | [optional] |

## Example

```ruby
require 'clever_client'

instance = Clever::SubmissionRequest.new(
  attachments: null,
  extra_attempts: null,
  flags: null,
  grade: null,
  grade_comment: null,
  grade_points: null,
  grader_id: null,
  override_due_date: null,
  state: null
)
```

