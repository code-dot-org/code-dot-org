# Clever::LMSConnectApi

All URIs are relative to *https://api.clever.com/v3.1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**create_assignment_for_section**](LMSConnectApi.md#create_assignment_for_section) | **POST** /sections/{section_id}/assignments |  |
| [**delete_assignment_for_section**](LMSConnectApi.md#delete_assignment_for_section) | **DELETE** /sections/{section_id}/assignments/{assignment_id} |  |
| [**get_assignment_for_section**](LMSConnectApi.md#get_assignment_for_section) | **GET** /sections/{section_id}/assignments/{assignment_id} |  |
| [**get_submission_for_assignment**](LMSConnectApi.md#get_submission_for_assignment) | **GET** /sections/{section_id}/assignments/{assignment_id}/submissions/{user_id} |  |
| [**get_submissions_for_assignment**](LMSConnectApi.md#get_submissions_for_assignment) | **GET** /sections/{section_id}/assignments/{assignment_id}/submissions |  |
| [**update_assignment_for_section**](LMSConnectApi.md#update_assignment_for_section) | **PATCH** /sections/{section_id}/assignments/{assignment_id} |  |
| [**update_submission_for_assignment**](LMSConnectApi.md#update_submission_for_assignment) | **PATCH** /sections/{section_id}/assignments/{assignment_id}/submissions/{user_id} |  |


## create_assignment_for_section

> <AssignmentResponse> create_assignment_for_section(section_id, assignment_request_body)



Creates a new assignment in the specified section

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::LMSConnectApi.new
section_id = 'section_id_example' # String | 
assignment_request_body = Clever::AssignmentRequest.new # AssignmentRequest | 

begin
  
  result = api_instance.create_assignment_for_section(section_id, assignment_request_body)
  p result
rescue Clever::ApiError => e
  puts "Error when calling LMSConnectApi->create_assignment_for_section: #{e}"
end
```

#### Using the create_assignment_for_section_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<AssignmentResponse>, Integer, Hash)> create_assignment_for_section_with_http_info(section_id, assignment_request_body)

```ruby
begin
  
  data, status_code, headers = api_instance.create_assignment_for_section_with_http_info(section_id, assignment_request_body)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <AssignmentResponse>
rescue Clever::ApiError => e
  puts "Error when calling LMSConnectApi->create_assignment_for_section_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **section_id** | **String** |  |  |
| **assignment_request_body** | [**AssignmentRequest**](AssignmentRequest.md) |  |  |

### Return type

[**AssignmentResponse**](AssignmentResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## delete_assignment_for_section

> delete_assignment_for_section(section_id, assignment_id)



Deletes an existing assignment in the specified section

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::LMSConnectApi.new
section_id = 'section_id_example' # String | 
assignment_id = 'assignment_id_example' # String | 

begin
  
  api_instance.delete_assignment_for_section(section_id, assignment_id)
rescue Clever::ApiError => e
  puts "Error when calling LMSConnectApi->delete_assignment_for_section: #{e}"
end
```

#### Using the delete_assignment_for_section_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> delete_assignment_for_section_with_http_info(section_id, assignment_id)

```ruby
begin
  
  data, status_code, headers = api_instance.delete_assignment_for_section_with_http_info(section_id, assignment_id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue Clever::ApiError => e
  puts "Error when calling LMSConnectApi->delete_assignment_for_section_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **section_id** | **String** |  |  |
| **assignment_id** | **String** |  |  |

### Return type

nil (empty response body)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_assignment_for_section

> <AssignmentResponse> get_assignment_for_section(section_id, assignment_id)



Returns a specific assignment for a section

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::LMSConnectApi.new
section_id = 'section_id_example' # String | 
assignment_id = 'assignment_id_example' # String | 

begin
  
  result = api_instance.get_assignment_for_section(section_id, assignment_id)
  p result
rescue Clever::ApiError => e
  puts "Error when calling LMSConnectApi->get_assignment_for_section: #{e}"
end
```

#### Using the get_assignment_for_section_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<AssignmentResponse>, Integer, Hash)> get_assignment_for_section_with_http_info(section_id, assignment_id)

```ruby
begin
  
  data, status_code, headers = api_instance.get_assignment_for_section_with_http_info(section_id, assignment_id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <AssignmentResponse>
rescue Clever::ApiError => e
  puts "Error when calling LMSConnectApi->get_assignment_for_section_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **section_id** | **String** |  |  |
| **assignment_id** | **String** |  |  |

### Return type

[**AssignmentResponse**](AssignmentResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_submission_for_assignment

> <SubmissionResponse> get_submission_for_assignment(section_id, assignment_id, user_id)



Returns a specific user's submission for an assignment.

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::LMSConnectApi.new
section_id = 'section_id_example' # String | 
assignment_id = 'assignment_id_example' # String | 
user_id = 'user_id_example' # String | 

begin
  
  result = api_instance.get_submission_for_assignment(section_id, assignment_id, user_id)
  p result
rescue Clever::ApiError => e
  puts "Error when calling LMSConnectApi->get_submission_for_assignment: #{e}"
end
```

#### Using the get_submission_for_assignment_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<SubmissionResponse>, Integer, Hash)> get_submission_for_assignment_with_http_info(section_id, assignment_id, user_id)

```ruby
begin
  
  data, status_code, headers = api_instance.get_submission_for_assignment_with_http_info(section_id, assignment_id, user_id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <SubmissionResponse>
rescue Clever::ApiError => e
  puts "Error when calling LMSConnectApi->get_submission_for_assignment_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **section_id** | **String** |  |  |
| **assignment_id** | **String** |  |  |
| **user_id** | **String** |  |  |

### Return type

[**SubmissionResponse**](SubmissionResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_submissions_for_assignment

> <SubmissionsResponse> get_submissions_for_assignment(section_id, assignment_id, opts)



Returns the submissions for an assignment.

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::LMSConnectApi.new
section_id = 'section_id_example' # String | 
assignment_id = 'assignment_id_example' # String | 
opts = {
  cursor: 'cursor_example', # String | 
  limit: 56 # Integer | 
}

begin
  
  result = api_instance.get_submissions_for_assignment(section_id, assignment_id, opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling LMSConnectApi->get_submissions_for_assignment: #{e}"
end
```

#### Using the get_submissions_for_assignment_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<SubmissionsResponse>, Integer, Hash)> get_submissions_for_assignment_with_http_info(section_id, assignment_id, opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_submissions_for_assignment_with_http_info(section_id, assignment_id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <SubmissionsResponse>
rescue Clever::ApiError => e
  puts "Error when calling LMSConnectApi->get_submissions_for_assignment_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **section_id** | **String** |  |  |
| **assignment_id** | **String** |  |  |
| **cursor** | **String** |  | [optional] |
| **limit** | **Integer** |  | [optional] |

### Return type

[**SubmissionsResponse**](SubmissionsResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## update_assignment_for_section

> <AssignmentResponse> update_assignment_for_section(section_id, assignment_id, assignment_request_body)



Updates an existing assignment in the specified section

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::LMSConnectApi.new
section_id = 'section_id_example' # String | 
assignment_id = 'assignment_id_example' # String | 
assignment_request_body = Clever::AssignmentRequest.new # AssignmentRequest | 

begin
  
  result = api_instance.update_assignment_for_section(section_id, assignment_id, assignment_request_body)
  p result
rescue Clever::ApiError => e
  puts "Error when calling LMSConnectApi->update_assignment_for_section: #{e}"
end
```

#### Using the update_assignment_for_section_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<AssignmentResponse>, Integer, Hash)> update_assignment_for_section_with_http_info(section_id, assignment_id, assignment_request_body)

```ruby
begin
  
  data, status_code, headers = api_instance.update_assignment_for_section_with_http_info(section_id, assignment_id, assignment_request_body)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <AssignmentResponse>
rescue Clever::ApiError => e
  puts "Error when calling LMSConnectApi->update_assignment_for_section_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **section_id** | **String** |  |  |
| **assignment_id** | **String** |  |  |
| **assignment_request_body** | [**AssignmentRequest**](AssignmentRequest.md) |  |  |

### Return type

[**AssignmentResponse**](AssignmentResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## update_submission_for_assignment

> <SubmissionResponse> update_submission_for_assignment(section_id, assignment_id, user_id, submission_request_body)



Updates an existing submission in the specified assignment for a user.

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::LMSConnectApi.new
section_id = 'section_id_example' # String | 
assignment_id = 'assignment_id_example' # String | 
user_id = 'user_id_example' # String | 
submission_request_body = Clever::SubmissionRequest.new # SubmissionRequest | 

begin
  
  result = api_instance.update_submission_for_assignment(section_id, assignment_id, user_id, submission_request_body)
  p result
rescue Clever::ApiError => e
  puts "Error when calling LMSConnectApi->update_submission_for_assignment: #{e}"
end
```

#### Using the update_submission_for_assignment_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<SubmissionResponse>, Integer, Hash)> update_submission_for_assignment_with_http_info(section_id, assignment_id, user_id, submission_request_body)

```ruby
begin
  
  data, status_code, headers = api_instance.update_submission_for_assignment_with_http_info(section_id, assignment_id, user_id, submission_request_body)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <SubmissionResponse>
rescue Clever::ApiError => e
  puts "Error when calling LMSConnectApi->update_submission_for_assignment_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **section_id** | **String** |  |  |
| **assignment_id** | **String** |  |  |
| **user_id** | **String** |  |  |
| **submission_request_body** | [**SubmissionRequest**](SubmissionRequest.md) |  |  |

### Return type

[**SubmissionResponse**](SubmissionResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

