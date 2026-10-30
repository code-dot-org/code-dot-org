# Clever::Roles

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **contact** | [**Contact**](Contact.md) |  | [optional] |
| **district_admin** | [**DistrictAdmin**](DistrictAdmin.md) |  | [optional] |
| **staff** | [**Staff**](Staff.md) |  | [optional] |
| **student** | [**Student**](Student.md) |  | [optional] |
| **teacher** | [**Teacher**](Teacher.md) |  | [optional] |

## Example

```ruby
require 'clever_client'

instance = Clever::Roles.new(
  contact: null,
  district_admin: null,
  staff: null,
  student: null,
  teacher: null
)
```

