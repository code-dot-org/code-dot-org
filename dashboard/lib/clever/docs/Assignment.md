# Clever::Assignment

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **assignee_ids** | **Array&lt;String&gt;** |  | [optional] |
| **assignee_mode** | [**AssigneeMode**](AssigneeMode.md) |  | [optional] |
| **attachments** | [**Array&lt;Attachment&gt;**](Attachment.md) |  | [optional] |
| **category_id** | **String** |  | [optional] |
| **created** | **String** |  | [optional] |
| **description** | **String** |  | [optional] |
| **description_plaintext** | **String** |  | [optional] |
| **display_date** | **String** |  | [optional] |
| **due_date** | **String** |  | [optional] |
| **end_date** | **String** |  | [optional] |
| **grading_scale** | [**Array&lt;GradingScale&gt;**](GradingScale.md) |  | [optional] |
| **grading_type** | [**GradingType**](GradingType.md) |  | [optional] |
| **id** | **String** |  | [optional] |
| **last_modified** | **String** |  | [optional] |
| **max_attempts** | **Integer** |  | [optional] |
| **points_possible** | **Float** |  | [optional] |
| **start_date** | **String** |  | [optional] |
| **state** | [**AssignmentState**](AssignmentState.md) |  | [optional] |
| **submission_types** | [**Array&lt;SubmissionType&gt;**](SubmissionType.md) |  | [optional] |
| **term_id** | **String** |  | [optional] |
| **title** | **String** |  | [optional] |

## Example

```ruby
require 'clever_client'

instance = Clever::Assignment.new(
  assignee_ids: null,
  assignee_mode: null,
  attachments: null,
  category_id: null,
  created: null,
  description: null,
  description_plaintext: null,
  display_date: null,
  due_date: null,
  end_date: null,
  grading_scale: null,
  grading_type: null,
  id: null,
  last_modified: null,
  max_attempts: null,
  points_possible: null,
  start_date: null,
  state: null,
  submission_types: null,
  term_id: null,
  title: null
)
```

