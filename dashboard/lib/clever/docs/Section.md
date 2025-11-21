# Clever::Section

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **course** | **String** |  | [optional] |
| **created** | **String** |  | [optional] |
| **district** | **String** |  | [optional] |
| **ext** | **Object** |  | [optional] |
| **grade** | **String** |  | [optional] |
| **id** | **String** |  | [optional] |
| **last_modified** | **String** |  | [optional] |
| **lms_status** | [**LmsStatus**](LmsStatus.md) |  | [optional] |
| **name** | **String** |  | [optional] |
| **period** | **String** |  | [optional] |
| **school** | **String** |  | [optional] |
| **section_number** | **String** |  | [optional] |
| **sis_id** | **String** |  | [optional] |
| **students** | **Array&lt;String&gt;** |  | [optional] |
| **subject** | **String** |  | [optional] |
| **teacher** | **String** |  | [optional] |
| **teachers** | **Array&lt;String&gt;** |  | [optional] |
| **term_id** | **String** |  | [optional] |

## Example

```ruby
require 'clever_client'

instance = Clever::Section.new(
  course: null,
  created: null,
  district: null,
  ext: null,
  grade: null,
  id: null,
  last_modified: null,
  lms_status: null,
  name: null,
  period: null,
  school: null,
  section_number: null,
  sis_id: null,
  students: null,
  subject: null,
  teacher: null,
  teachers: null,
  term_id: null
)
```

