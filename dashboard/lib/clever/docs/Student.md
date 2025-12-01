# Clever::Student

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **created** | **String** |  | [optional] |
| **credentials** | [**Credentials**](Credentials.md) |  | [optional] |
| **disability** | [**Disability**](Disability.md) |  | [optional] |
| **dob** | **String** |  | [optional] |
| **ell_status** | **String** |  | [optional] |
| **enrollments** | [**Array&lt;SchoolEnrollment&gt;**](SchoolEnrollment.md) |  | [optional] |
| **ext** | **Object** |  | [optional] |
| **frl_status** | **String** |  | [optional] |
| **gender** | **String** |  | [optional] |
| **gifted_status** | **String** |  | [optional] |
| **grade** | **String** |  | [optional] |
| **graduation_year** | **String** |  | [optional] |
| **hispanic_ethnicity** | **String** |  | [optional] |
| **home_language** | **String** |  | [optional] |
| **home_language_code** | **String** |  | [optional] |
| **iep_status** | **String** |  | [optional] |
| **last_modified** | **String** |  | [optional] |
| **legacy_id** | **String** |  | [optional] |
| **location** | [**Location**](Location.md) |  | [optional] |
| **preferred_name** | [**PreferredName**](PreferredName.md) |  | [optional] |
| **race** | **String** |  | [optional] |
| **school** | **String** |  | [optional] |
| **schools** | **Array&lt;String&gt;** |  | [optional] |
| **section_504_status** | **String** |  | [optional] |
| **sis_id** | **String** |  | [optional] |
| **state_id** | **String** |  | [optional] |
| **student_number** | **String** |  | [optional] |
| **unweighted_gpa** | **String** |  | [optional] |
| **weighted_gpa** | **String** |  | [optional] |

## Example

```ruby
require 'clever_client'

instance = Clever::Student.new(
  created: null,
  credentials: null,
  disability: null,
  dob: null,
  ell_status: null,
  enrollments: null,
  ext: null,
  frl_status: null,
  gender: null,
  gifted_status: null,
  grade: null,
  graduation_year: null,
  hispanic_ethnicity: null,
  home_language: null,
  home_language_code: null,
  iep_status: null,
  last_modified: null,
  legacy_id: null,
  location: null,
  preferred_name: null,
  race: null,
  school: null,
  schools: null,
  section_504_status: null,
  sis_id: null,
  state_id: null,
  student_number: null,
  unweighted_gpa: null,
  weighted_gpa: null
)
```

