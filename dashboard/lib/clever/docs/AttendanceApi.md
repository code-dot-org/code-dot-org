# Clever::AttendanceApi

All URIs are relative to *https://api.clever.com/v3.1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**list_attendance_for_school**](AttendanceApi.md#list_attendance_for_school) | **GET** /attendance/schools/{school_id} | Returns a list of attendance records for a school |
| [**list_attendance_for_section**](AttendanceApi.md#list_attendance_for_section) | **GET** /attendance/sections/{section_id} | Returns a list of attendance records for a section |


## list_attendance_for_school

> <AttendanceResponse> list_attendance_for_school(school_id, opts)

Returns a list of attendance records for a school

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::AttendanceApi.new
school_id = 'school_id_example' # String | 
opts = {
  date_range_start: Date.parse('2013-10-20'), # Date | 
  date_range_end: Date.parse('2013-10-20'), # Date | 
  attendance_status: 'present', # String | 
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example' # String | 
}

begin
  # Returns a list of attendance records for a school
  result = api_instance.list_attendance_for_school(school_id, opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling AttendanceApi->list_attendance_for_school: #{e}"
end
```

#### Using the list_attendance_for_school_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<AttendanceResponse>, Integer, Hash)> list_attendance_for_school_with_http_info(school_id, opts)

```ruby
begin
  # Returns a list of attendance records for a school
  data, status_code, headers = api_instance.list_attendance_for_school_with_http_info(school_id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <AttendanceResponse>
rescue Clever::ApiError => e
  puts "Error when calling AttendanceApi->list_attendance_for_school_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **school_id** | **String** |  |  |
| **date_range_start** | **Date** |  | [optional] |
| **date_range_end** | **Date** |  | [optional] |
| **attendance_status** | **String** |  | [optional] |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |

### Return type

[**AttendanceResponse**](AttendanceResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## list_attendance_for_section

> <AttendanceResponse> list_attendance_for_section(section_id, opts)

Returns a list of attendance records for a section

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::AttendanceApi.new
section_id = 'section_id_example' # String | 
opts = {
  date_range_start: Date.parse('2013-10-20'), # Date | 
  date_range_end: Date.parse('2013-10-20'), # Date | 
  attendance_status: 'present', # String | 
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example' # String | 
}

begin
  # Returns a list of attendance records for a section
  result = api_instance.list_attendance_for_section(section_id, opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling AttendanceApi->list_attendance_for_section: #{e}"
end
```

#### Using the list_attendance_for_section_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<AttendanceResponse>, Integer, Hash)> list_attendance_for_section_with_http_info(section_id, opts)

```ruby
begin
  # Returns a list of attendance records for a section
  data, status_code, headers = api_instance.list_attendance_for_section_with_http_info(section_id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <AttendanceResponse>
rescue Clever::ApiError => e
  puts "Error when calling AttendanceApi->list_attendance_for_section_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **section_id** | **String** |  |  |
| **date_range_start** | **Date** |  | [optional] |
| **date_range_end** | **Date** |  | [optional] |
| **attendance_status** | **String** |  | [optional] |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |

### Return type

[**AttendanceResponse**](AttendanceResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

