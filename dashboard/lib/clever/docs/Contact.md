# Clever::Contact

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **legacy_id** | **String** |  | [optional] |
| **phone** | **String** |  | [optional] |
| **phone_type** | **String** |  | [optional] |
| **sis_id** | **String** |  | [optional] |
| **student_relationships** | [**Array&lt;StudentRelationship&gt;**](StudentRelationship.md) |  | [optional] |

## Example

```ruby
require 'clever_client'

instance = Clever::Contact.new(
  legacy_id: null,
  phone: null,
  phone_type: null,
  sis_id: null,
  student_relationships: null
)
```

