# Clever::EventsApi

All URIs are relative to *https://api.clever.com/v3.1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**get_event**](EventsApi.md#get_event) | **GET** /events/{id} |  |
| [**get_events**](EventsApi.md#get_events) | **GET** /events |  |


## get_event

> <EventResponse> get_event(id)



Returns the specific event

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::EventsApi.new
id = 'id_example' # String | 

begin
  
  result = api_instance.get_event(id)
  p result
rescue Clever::ApiError => e
  puts "Error when calling EventsApi->get_event: #{e}"
end
```

#### Using the get_event_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<EventResponse>, Integer, Hash)> get_event_with_http_info(id)

```ruby
begin
  
  data, status_code, headers = api_instance.get_event_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <EventResponse>
rescue Clever::ApiError => e
  puts "Error when calling EventsApi->get_event_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**EventResponse**](EventResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## get_events

> <EventsResponse> get_events(opts)



Returns a list of events

### Examples

```ruby
require 'time'
require 'clever_client'
# setup authorization
Clever.configure do |config|
  # Configure OAuth2 access token for authorization: oauth
  config.access_token = 'YOUR ACCESS TOKEN'
end

api_instance = Clever::EventsApi.new
opts = {
  limit: 56, # Integer | 
  starting_after: 'starting_after_example', # String | 
  ending_before: 'ending_before_example', # String | 
  school: 'school_example', # String | 
  record_type: ['inner_example'] # Array<String> | 
}

begin
  
  result = api_instance.get_events(opts)
  p result
rescue Clever::ApiError => e
  puts "Error when calling EventsApi->get_events: #{e}"
end
```

#### Using the get_events_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<EventsResponse>, Integer, Hash)> get_events_with_http_info(opts)

```ruby
begin
  
  data, status_code, headers = api_instance.get_events_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <EventsResponse>
rescue Clever::ApiError => e
  puts "Error when calling EventsApi->get_events_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **limit** | **Integer** |  | [optional] |
| **starting_after** | **String** |  | [optional] |
| **ending_before** | **String** |  | [optional] |
| **school** | **String** |  | [optional] |
| **record_type** | [**Array&lt;String&gt;**](String.md) |  | [optional] |

### Return type

[**EventsResponse**](EventsResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

