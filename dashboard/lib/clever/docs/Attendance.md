# Clever::Attendance

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **attendance_date** | **Date** |  | [optional] |
| **attendance_status** | [**AttendanceStatus**](AttendanceStatus.md) |  | [optional] |
| **attendance_type** | [**AttendanceType**](AttendanceType.md) |  | [optional] |
| **created** | **String** |  | [optional] |
| **district_id** | **String** |  | [optional] |
| **excuse_code** | **String** |  | [optional] |
| **last_modified** | **String** |  | [optional] |
| **school_id** | **String** |  | [optional] |
| **section_id** | **String** |  | [optional] |
| **sis_id** | **String** |  | [optional] |
| **student_id** | **String** |  | [optional] |

## Example

```ruby
require 'clever_client'

instance = Clever::Attendance.new(
  attendance_date: null,
  attendance_status: null,
  attendance_type: null,
  created: null,
  district_id: null,
  excuse_code: null,
  last_modified: null,
  school_id: null,
  section_id: null,
  sis_id: null,
  student_id: null
)
```

