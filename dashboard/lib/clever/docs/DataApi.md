# Clever::DataApi

All URIs are relative to *https://api.clever.com/v3.1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**get_contacts_for_user**](DataApi.md#get_contacts_for_user) | **GET** /users/{id}/mycontacts |  |
| [**get_course**](DataApi.md#get_course) | **GET** /courses/{id} |  |
| [**get_course_for_section**](DataApi.md#get_course_for_section) | **GET** /sections/{id}/course |  |
| [**get_courses**](DataApi.md#get_courses) | **GET** /courses |  |
| [**get_courses_for_resource**](DataApi.md#get_courses_for_resource) | **GET** /resources/{id}/courses |  |
| [**get_courses_for_school**](DataApi.md#get_courses_for_school) | **GET** /schools/{id}/courses |  |
| [**get_district**](DataApi.md#get_district) | **GET** /districts/{id} |  |
| [**get_district_for_course**](DataApi.md#get_district_for_course) | **GET** /courses/{id}/district |  |
| [**get_district_for_school**](DataApi.md#get_district_for_school) | **GET** /schools/{id}/district |  |
| [**get_district_for_section**](DataApi.md#get_district_for_section) | **GET** /sections/{id}/district |  |
| [**get_district_for_term**](DataApi.md#get_district_for_term) | **GET** /terms/{id}/district |  |
| [**get_district_for_user**](DataApi.md#get_district_for_user) | **GET** /users/{id}/district |  |
| [**get_districts**](DataApi.md#get_districts) | **GET** /districts |  |
| [**get_resource**](DataApi.md#get_resource) | **GET** /resources/{id} |  |
| [**get_resources**](DataApi.md#get_resources) | **GET** /resources |  |
| [**get_resources_for_course**](DataApi.md#get_resources_for_course) | **GET** /courses/{id}/resources |  |
| [**get_resources_for_section**](DataApi.md#get_resources_for_section) | **GET** /sections/{id}/resources |  |
| [**get_resources_for_user**](DataApi.md#get_resources_for_user) | **GET** /users/{id}/resources |  |
| [**get_school**](DataApi.md#get_school) | **GET** /schools/{id} |  |
| [**get_school_for_section**](DataApi.md#get_school_for_section) | **GET** /sections/{id}/school |  |
| [**get_schools**](DataApi.md#get_schools) | **GET** /schools |  |
| [**get_schools_for_course**](DataApi.md#get_schools_for_course) | **GET** /courses/{id}/schools |  |
| [**get_schools_for_term**](DataApi.md#get_schools_for_term) | **GET** /terms/{id}/schools |  |
| [**get_schools_for_user**](DataApi.md#get_schools_for_user) | **GET** /users/{id}/schools |  |
| [**get_section**](DataApi.md#get_section) | **GET** /sections/{id} |  |
| [**get_sections**](DataApi.md#get_sections) | **GET** /sections |  |
| [**get_sections_for_course**](DataApi.md#get_sections_for_course) | **GET** /courses/{id}/sections |  |
| [**get_sections_for_resource**](DataApi.md#get_sections_for_resource) | **GET** /resources/{id}/sections |  |
| [**get_sections_for_school**](DataApi.md#get_sections_for_school) | **GET** /schools/{id}/sections |  |
| [**get_sections_for_term**](DataApi.md#get_sections_for_term) | **GET** /terms/{id}/sections |  |
| [**get_sections_for_user**](DataApi.md#get_sections_for_user) | **GET** /users/{id}/sections |  |
| [**get_students_for_user**](DataApi.md#get_students_for_user) | **GET** /users/{id}/mystudents |  |
| [**get_teachers_for_user**](DataApi.md#get_teachers_for_user) | **GET** /users/{id}/myteachers |  |
| [**get_term**](DataApi.md#get_term) | **GET** /terms/{id} |  |
| [**get_term_for_section**](DataApi.md#get_term_for_section) | **GET** /sections/{id}/term |  |
| [**get_terms**](DataApi.md#get_terms) | **GET** /terms |  |
| [**get_terms_for_school**](DataApi.md#get_terms_for_school) | **GET** /schools/{id}/terms |  |
| [**get_user**](DataApi.md#get_user) | **GET** /users/{id} |  |
| [**get_users**](DataApi.md#get_users) | **GET** /users |  |
| [**get_users_for_resource**](DataApi.md#get_users_for_resource) | **GET** /resources/{id}/users |  |
| [**get_users_for_school**](DataApi.md#get_users_for_school) | **GET** /schools/{id}/users |  |
| [**get_users_for_section**](DataApi.md#get_users_for_section) | **GET** /sections/{id}/users |  |


## get_contacts_for_user

> <UsersResponse> get_contacts_for_user(id, opts)



Returns the contact users for a student user

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 
opts = {
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example' # String | 
}

begin
  
  result = api_instance.get_contacts_for_user(id, opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_contacts_for_user: #{e}"
end
```

#### Using the get_contacts_for_user_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<UsersResponse>, Integer, Hash)> get_contacts_for_user_with_http_info(id, opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_contacts_for_user_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <UsersResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_contacts_for_user_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |

### Return type

[**UsersResponse**](UsersResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_course

> <CourseResponse> get_course(id)



Returns a specific course

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 

begin
  
  result = api_instance.get_course(id)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_course: #{e}"
end
```

#### Using the get_course_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<CourseResponse>, Integer, Hash)> get_course_with_http_info(id)

```ruby
begin
  
  data, status_code, headers = api_instance.get_course_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <CourseResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_course_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**CourseResponse**](CourseResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_course_for_section

> <CourseResponse> get_course_for_section(id)



Returns the course for a section

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 

begin
  
  result = api_instance.get_course_for_section(id)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_course_for_section: #{e}"
end
```

#### Using the get_course_for_section_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<CourseResponse>, Integer, Hash)> get_course_for_section_with_http_info(id)

```ruby
begin
  
  data, status_code, headers = api_instance.get_course_for_section_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <CourseResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_course_for_section_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**CourseResponse**](CourseResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_courses

> <CoursesResponse> get_courses(opts)



Returns a list of courses

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
opts = {
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example', # String | 
  count: 'count_example' # String | 
}

begin
  
  result = api_instance.get_courses(opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_courses: #{e}"
end
```

#### Using the get_courses_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<CoursesResponse>, Integer, Hash)> get_courses_with_http_info(opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_courses_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <CoursesResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_courses_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |
| **count** | **String** |  | [optional] |

### Return type

[**CoursesResponse**](CoursesResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_courses_for_resource

> <CoursesResponse> get_courses_for_resource(id, opts)



Returns the courses for a resource

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 
opts = {
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example' # String | 
}

begin
  
  result = api_instance.get_courses_for_resource(id, opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_courses_for_resource: #{e}"
end
```

#### Using the get_courses_for_resource_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<CoursesResponse>, Integer, Hash)> get_courses_for_resource_with_http_info(id, opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_courses_for_resource_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <CoursesResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_courses_for_resource_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |

### Return type

[**CoursesResponse**](CoursesResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_courses_for_school

> <CoursesResponse> get_courses_for_school(id, opts)



Returns the courses for a school

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 
opts = {
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example' # String | 
}

begin
  
  result = api_instance.get_courses_for_school(id, opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_courses_for_school: #{e}"
end
```

#### Using the get_courses_for_school_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<CoursesResponse>, Integer, Hash)> get_courses_for_school_with_http_info(id, opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_courses_for_school_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <CoursesResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_courses_for_school_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |

### Return type

[**CoursesResponse**](CoursesResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_district

> <DistrictResponse> get_district(id)



Returns a specific district

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 

begin
  
  result = api_instance.get_district(id)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_district: #{e}"
end
```

#### Using the get_district_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<DistrictResponse>, Integer, Hash)> get_district_with_http_info(id)

```ruby
begin
  
  data, status_code, headers = api_instance.get_district_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <DistrictResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_district_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**DistrictResponse**](DistrictResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_district_for_course

> <DistrictResponse> get_district_for_course(id)



Returns the district for a course

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 

begin
  
  result = api_instance.get_district_for_course(id)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_district_for_course: #{e}"
end
```

#### Using the get_district_for_course_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<DistrictResponse>, Integer, Hash)> get_district_for_course_with_http_info(id)

```ruby
begin
  
  data, status_code, headers = api_instance.get_district_for_course_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <DistrictResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_district_for_course_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**DistrictResponse**](DistrictResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_district_for_school

> <DistrictResponse> get_district_for_school(id)



Returns the district for a school

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 

begin
  
  result = api_instance.get_district_for_school(id)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_district_for_school: #{e}"
end
```

#### Using the get_district_for_school_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<DistrictResponse>, Integer, Hash)> get_district_for_school_with_http_info(id)

```ruby
begin
  
  data, status_code, headers = api_instance.get_district_for_school_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <DistrictResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_district_for_school_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**DistrictResponse**](DistrictResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_district_for_section

> <DistrictResponse> get_district_for_section(id)



Returns the district for a section

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 

begin
  
  result = api_instance.get_district_for_section(id)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_district_for_section: #{e}"
end
```

#### Using the get_district_for_section_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<DistrictResponse>, Integer, Hash)> get_district_for_section_with_http_info(id)

```ruby
begin
  
  data, status_code, headers = api_instance.get_district_for_section_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <DistrictResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_district_for_section_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**DistrictResponse**](DistrictResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_district_for_term

> <DistrictResponse> get_district_for_term(id)



Returns the district for a term

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 

begin
  
  result = api_instance.get_district_for_term(id)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_district_for_term: #{e}"
end
```

#### Using the get_district_for_term_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<DistrictResponse>, Integer, Hash)> get_district_for_term_with_http_info(id)

```ruby
begin
  
  data, status_code, headers = api_instance.get_district_for_term_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <DistrictResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_district_for_term_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**DistrictResponse**](DistrictResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_district_for_user

> <DistrictResponse> get_district_for_user(id)



Returns the district for a user

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 

begin
  
  result = api_instance.get_district_for_user(id)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_district_for_user: #{e}"
end
```

#### Using the get_district_for_user_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<DistrictResponse>, Integer, Hash)> get_district_for_user_with_http_info(id)

```ruby
begin
  
  data, status_code, headers = api_instance.get_district_for_user_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <DistrictResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_district_for_user_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**DistrictResponse**](DistrictResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_districts

> <DistrictsResponse> get_districts(opts)



Returns a list of districts. In practice this will only return the one district associated with the bearer token

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
opts = {
  count: 'count_example' # String | 
}

begin
  
  result = api_instance.get_districts(opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_districts: #{e}"
end
```

#### Using the get_districts_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<DistrictsResponse>, Integer, Hash)> get_districts_with_http_info(opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_districts_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <DistrictsResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_districts_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **count** | **String** |  | [optional] |

### Return type

[**DistrictsResponse**](DistrictsResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_resource

> <ResourceResponse> get_resource(id)



Returns a specific resource

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 

begin
  
  result = api_instance.get_resource(id)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_resource: #{e}"
end
```

#### Using the get_resource_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<ResourceResponse>, Integer, Hash)> get_resource_with_http_info(id)

```ruby
begin
  
  data, status_code, headers = api_instance.get_resource_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <ResourceResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_resource_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**ResourceResponse**](ResourceResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_resources

> <ResourcesResponse> get_resources(opts)



Returns a list of resources

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
opts = {
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example' # String | 
}

begin
  
  result = api_instance.get_resources(opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_resources: #{e}"
end
```

#### Using the get_resources_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<ResourcesResponse>, Integer, Hash)> get_resources_with_http_info(opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_resources_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <ResourcesResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_resources_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |

### Return type

[**ResourcesResponse**](ResourcesResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_resources_for_course

> <ResourcesResponse> get_resources_for_course(id, opts)



Returns the resources for a course

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 
opts = {
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example' # String | 
}

begin
  
  result = api_instance.get_resources_for_course(id, opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_resources_for_course: #{e}"
end
```

#### Using the get_resources_for_course_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<ResourcesResponse>, Integer, Hash)> get_resources_for_course_with_http_info(id, opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_resources_for_course_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <ResourcesResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_resources_for_course_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |

### Return type

[**ResourcesResponse**](ResourcesResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_resources_for_section

> <ResourcesResponse> get_resources_for_section(id, opts)



Returns the resources for a section

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 
opts = {
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example' # String | 
}

begin
  
  result = api_instance.get_resources_for_section(id, opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_resources_for_section: #{e}"
end
```

#### Using the get_resources_for_section_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<ResourcesResponse>, Integer, Hash)> get_resources_for_section_with_http_info(id, opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_resources_for_section_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <ResourcesResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_resources_for_section_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |

### Return type

[**ResourcesResponse**](ResourcesResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_resources_for_user

> <ResourcesResponse> get_resources_for_user(id, opts)



Returns the resources for a user

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 
opts = {
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example' # String | 
}

begin
  
  result = api_instance.get_resources_for_user(id, opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_resources_for_user: #{e}"
end
```

#### Using the get_resources_for_user_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<ResourcesResponse>, Integer, Hash)> get_resources_for_user_with_http_info(id, opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_resources_for_user_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <ResourcesResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_resources_for_user_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |

### Return type

[**ResourcesResponse**](ResourcesResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_school

> <SchoolResponse> get_school(id)



Returns a specific school

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 

begin
  
  result = api_instance.get_school(id)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_school: #{e}"
end
```

#### Using the get_school_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<SchoolResponse>, Integer, Hash)> get_school_with_http_info(id)

```ruby
begin
  
  data, status_code, headers = api_instance.get_school_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <SchoolResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_school_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**SchoolResponse**](SchoolResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_school_for_section

> <SchoolResponse> get_school_for_section(id)



Returns the school for a section

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 

begin
  
  result = api_instance.get_school_for_section(id)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_school_for_section: #{e}"
end
```

#### Using the get_school_for_section_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<SchoolResponse>, Integer, Hash)> get_school_for_section_with_http_info(id)

```ruby
begin
  
  data, status_code, headers = api_instance.get_school_for_section_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <SchoolResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_school_for_section_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**SchoolResponse**](SchoolResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_schools

> <SchoolsResponse> get_schools(opts)



Returns a list of schools

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
opts = {
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example', # String | 
  count: 'count_example' # String | 
}

begin
  
  result = api_instance.get_schools(opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_schools: #{e}"
end
```

#### Using the get_schools_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<SchoolsResponse>, Integer, Hash)> get_schools_with_http_info(opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_schools_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <SchoolsResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_schools_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |
| **count** | **String** |  | [optional] |

### Return type

[**SchoolsResponse**](SchoolsResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_schools_for_course

> <SchoolsResponse> get_schools_for_course(id, opts)



Returns the schools for a course

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 
opts = {
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example' # String | 
}

begin
  
  result = api_instance.get_schools_for_course(id, opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_schools_for_course: #{e}"
end
```

#### Using the get_schools_for_course_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<SchoolsResponse>, Integer, Hash)> get_schools_for_course_with_http_info(id, opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_schools_for_course_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <SchoolsResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_schools_for_course_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |

### Return type

[**SchoolsResponse**](SchoolsResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_schools_for_term

> <SchoolsResponse> get_schools_for_term(id, opts)



Returns the schools for a term

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 
opts = {
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example' # String | 
}

begin
  
  result = api_instance.get_schools_for_term(id, opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_schools_for_term: #{e}"
end
```

#### Using the get_schools_for_term_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<SchoolsResponse>, Integer, Hash)> get_schools_for_term_with_http_info(id, opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_schools_for_term_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <SchoolsResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_schools_for_term_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |

### Return type

[**SchoolsResponse**](SchoolsResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_schools_for_user

> <SchoolsResponse> get_schools_for_user(id, opts)



Returns the schools for a user

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 
opts = {
  primary: 'primary_example', # String | 
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example' # String | 
}

begin
  
  result = api_instance.get_schools_for_user(id, opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_schools_for_user: #{e}"
end
```

#### Using the get_schools_for_user_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<SchoolsResponse>, Integer, Hash)> get_schools_for_user_with_http_info(id, opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_schools_for_user_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <SchoolsResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_schools_for_user_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **primary** | **String** |  | [optional] |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |

### Return type

[**SchoolsResponse**](SchoolsResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_section

> <SectionResponse> get_section(id)



Returns a specific section

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 

begin
  
  result = api_instance.get_section(id)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_section: #{e}"
end
```

#### Using the get_section_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<SectionResponse>, Integer, Hash)> get_section_with_http_info(id)

```ruby
begin
  
  data, status_code, headers = api_instance.get_section_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <SectionResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_section_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**SectionResponse**](SectionResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_sections

> <SectionsResponse> get_sections(opts)



Returns a list of sections

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
opts = {
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example', # String | 
  count: 'count_example' # String | 
}

begin
  
  result = api_instance.get_sections(opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_sections: #{e}"
end
```

#### Using the get_sections_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<SectionsResponse>, Integer, Hash)> get_sections_with_http_info(opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_sections_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <SectionsResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_sections_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |
| **count** | **String** |  | [optional] |

### Return type

[**SectionsResponse**](SectionsResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_sections_for_course

> <SectionsResponse> get_sections_for_course(id, opts)



Returns the sections for a course

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 
opts = {
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example' # String | 
}

begin
  
  result = api_instance.get_sections_for_course(id, opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_sections_for_course: #{e}"
end
```

#### Using the get_sections_for_course_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<SectionsResponse>, Integer, Hash)> get_sections_for_course_with_http_info(id, opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_sections_for_course_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <SectionsResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_sections_for_course_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |

### Return type

[**SectionsResponse**](SectionsResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_sections_for_resource

> <SectionsResponse> get_sections_for_resource(id, opts)



Returns the sections for a resource

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 
opts = {
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example' # String | 
}

begin
  
  result = api_instance.get_sections_for_resource(id, opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_sections_for_resource: #{e}"
end
```

#### Using the get_sections_for_resource_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<SectionsResponse>, Integer, Hash)> get_sections_for_resource_with_http_info(id, opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_sections_for_resource_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <SectionsResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_sections_for_resource_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |

### Return type

[**SectionsResponse**](SectionsResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_sections_for_school

> <SectionsResponse> get_sections_for_school(id, opts)



Returns the sections for a school

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 
opts = {
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example' # String | 
}

begin
  
  result = api_instance.get_sections_for_school(id, opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_sections_for_school: #{e}"
end
```

#### Using the get_sections_for_school_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<SectionsResponse>, Integer, Hash)> get_sections_for_school_with_http_info(id, opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_sections_for_school_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <SectionsResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_sections_for_school_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |

### Return type

[**SectionsResponse**](SectionsResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_sections_for_term

> <SectionsResponse> get_sections_for_term(id, opts)



Returns the sections for a term

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 
opts = {
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example' # String | 
}

begin
  
  result = api_instance.get_sections_for_term(id, opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_sections_for_term: #{e}"
end
```

#### Using the get_sections_for_term_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<SectionsResponse>, Integer, Hash)> get_sections_for_term_with_http_info(id, opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_sections_for_term_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <SectionsResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_sections_for_term_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |

### Return type

[**SectionsResponse**](SectionsResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_sections_for_user

> <SectionsResponse> get_sections_for_user(id, opts)



Returns the sections for a user

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 
opts = {
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example' # String | 
}

begin
  
  result = api_instance.get_sections_for_user(id, opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_sections_for_user: #{e}"
end
```

#### Using the get_sections_for_user_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<SectionsResponse>, Integer, Hash)> get_sections_for_user_with_http_info(id, opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_sections_for_user_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <SectionsResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_sections_for_user_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |

### Return type

[**SectionsResponse**](SectionsResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_students_for_user

> <UsersResponse> get_students_for_user(id, opts)



Returns the student users for a teacher or contact user

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 
opts = {
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example' # String | 
}

begin
  
  result = api_instance.get_students_for_user(id, opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_students_for_user: #{e}"
end
```

#### Using the get_students_for_user_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<UsersResponse>, Integer, Hash)> get_students_for_user_with_http_info(id, opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_students_for_user_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <UsersResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_students_for_user_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |

### Return type

[**UsersResponse**](UsersResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_teachers_for_user

> <UsersResponse> get_teachers_for_user(id, opts)



Returns the teacher users for a student user

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 
opts = {
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example' # String | 
}

begin
  
  result = api_instance.get_teachers_for_user(id, opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_teachers_for_user: #{e}"
end
```

#### Using the get_teachers_for_user_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<UsersResponse>, Integer, Hash)> get_teachers_for_user_with_http_info(id, opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_teachers_for_user_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <UsersResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_teachers_for_user_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |

### Return type

[**UsersResponse**](UsersResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_term

> <TermResponse> get_term(id)



Returns a specific term

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 

begin
  
  result = api_instance.get_term(id)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_term: #{e}"
end
```

#### Using the get_term_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<TermResponse>, Integer, Hash)> get_term_with_http_info(id)

```ruby
begin
  
  data, status_code, headers = api_instance.get_term_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <TermResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_term_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**TermResponse**](TermResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_term_for_section

> <TermResponse> get_term_for_section(id)



Returns the term for a section

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 

begin
  
  result = api_instance.get_term_for_section(id)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_term_for_section: #{e}"
end
```

#### Using the get_term_for_section_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<TermResponse>, Integer, Hash)> get_term_for_section_with_http_info(id)

```ruby
begin
  
  data, status_code, headers = api_instance.get_term_for_section_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <TermResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_term_for_section_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**TermResponse**](TermResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_terms

> <TermsResponse> get_terms(opts)



Returns a list of terms

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
opts = {
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example', # String | 
  count: 'count_example' # String | 
}

begin
  
  result = api_instance.get_terms(opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_terms: #{e}"
end
```

#### Using the get_terms_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<TermsResponse>, Integer, Hash)> get_terms_with_http_info(opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_terms_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <TermsResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_terms_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |
| **count** | **String** |  | [optional] |

### Return type

[**TermsResponse**](TermsResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_terms_for_school

> <TermsResponse> get_terms_for_school(id, opts)



Returns the terms for a school

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 
opts = {
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example' # String | 
}

begin
  
  result = api_instance.get_terms_for_school(id, opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_terms_for_school: #{e}"
end
```

#### Using the get_terms_for_school_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<TermsResponse>, Integer, Hash)> get_terms_for_school_with_http_info(id, opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_terms_for_school_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <TermsResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_terms_for_school_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |

### Return type

[**TermsResponse**](TermsResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_user

> <UserResponse> get_user(id)



Returns a specific user

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 

begin
  
  result = api_instance.get_user(id)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_user: #{e}"
end
```

#### Using the get_user_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<UserResponse>, Integer, Hash)> get_user_with_http_info(id)

```ruby
begin
  
  data, status_code, headers = api_instance.get_user_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <UserResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_user_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**UserResponse**](UserResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_users

> <UsersResponse> get_users(opts)



Returns a list of contact, district admin, staff, student, and/or teacher users

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
opts = {
  limit: 56, # Integer | 
  role: 'contact', # String | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example', # String | 
  count: 'count_example' # String | 
}

begin
  
  result = api_instance.get_users(opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_users: #{e}"
end
```

#### Using the get_users_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<UsersResponse>, Integer, Hash)> get_users_with_http_info(opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_users_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <UsersResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_users_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **limit** | **Integer** |  | [optional] |
| **role** | **String** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |
| **count** | **String** |  | [optional] |

### Return type

[**UsersResponse**](UsersResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_users_for_resource

> <UsersResponse> get_users_for_resource(id, opts)



Returns the student and/or teacher users for a resource

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 
opts = {
  role: 'student', # String | 
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example' # String | 
}

begin
  
  result = api_instance.get_users_for_resource(id, opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_users_for_resource: #{e}"
end
```

#### Using the get_users_for_resource_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<UsersResponse>, Integer, Hash)> get_users_for_resource_with_http_info(id, opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_users_for_resource_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <UsersResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_users_for_resource_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **role** | **String** |  | [optional] |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |

### Return type

[**UsersResponse**](UsersResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_users_for_school

> <UsersResponse> get_users_for_school(id, opts)



Returns the staff, student, and/or teacher users for a school

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 
opts = {
  role: 'staff', # String | 
  primary: 'primary_example', # String | 
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example' # String | 
}

begin
  
  result = api_instance.get_users_for_school(id, opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_users_for_school: #{e}"
end
```

#### Using the get_users_for_school_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<UsersResponse>, Integer, Hash)> get_users_for_school_with_http_info(id, opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_users_for_school_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <UsersResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_users_for_school_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **role** | **String** |  | [optional] |
| **primary** | **String** |  | [optional] |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |

### Return type

[**UsersResponse**](UsersResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_users_for_section

> <UsersResponse> get_users_for_section(id, opts)



Returns the student and/or teacher users for a section

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::DataApi.new
id = 'id_example' # String | 
opts = {
  role: 'student', # String | 
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example' # String | 
}

begin
  
  result = api_instance.get_users_for_section(id, opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_users_for_section: #{e}"
end
```

#### Using the get_users_for_section_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<UsersResponse>, Integer, Hash)> get_users_for_section_with_http_info(id, opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_users_for_section_with_http_info(id, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <UsersResponse>
rescue Clever::ApiError => e
  puts "Error when calling DataApi->get_users_for_section_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **role** | **String** |  | [optional] |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |

### Return type

[**UsersResponse**](UsersResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

