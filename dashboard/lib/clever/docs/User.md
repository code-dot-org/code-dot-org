# Clever::User

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **created** | **String** |  | [optional] |
| **district** | **String** |  | [optional] |
| **email** | **String** |  | [optional] |
| **id** | **String** |  | [optional] |
| **last_modified** | **String** |  | [optional] |
| **lms_status** | [**LmsStatus**](LmsStatus.md) |  | [optional] |
| **name** | [**Name**](Name.md) |  | [optional] |
| **roles** | [**Roles**](Roles.md) |  | [optional] |

## Example

```ruby
require 'clever_client'

instance = Clever::User.new(
  created: null,
  district: null,
  email: null,
  id: null,
  last_modified: null,
  lms_status: null,
  name: null,
  roles: null
)
```

