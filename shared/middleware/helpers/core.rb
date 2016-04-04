def dont_cache
  cache_control(:private, :must_revalidate, max_age: 0)
end

def cache_for(seconds, proxy_seconds=nil)
  proxy_seconds ||= seconds / 2
  cache_control(:public, max_age: seconds, s_maxage: proxy_seconds)
end

def cache_one_hour
  cache_for 3600
end

def no_content()
  halt(204, "No content\n")
end

def not_modified
  halt(304, "Not Modified\n")
end

def bad_request()
  halt(400, "Bad Request\n")
end

# Stops processing the current request
# Returns status 400 BAD_REQUEST
# Optionally adds additional details to a JSON response body
def json_bad_request(details = nil)
  content_type :json
  body = { error: 'Bad Request' }
  body[:details] = details unless details.nil?
  halt(400, body.to_json)
end

def not_authorized()
  halt(401, "Not authorized\n")
end

def forbidden()
  halt(403, "Forbidden\n")
end

def not_found()
  halt(404, "Not found\n")
end

def too_large(msg = "Payload too large\n")
  halt(413, msg)
end

def unsupported_media_type()
  halt(415, "Unsupported Media Type\n")
end
