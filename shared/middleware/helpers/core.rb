def dont_cache
  cache_control(:private, :must_revalidate, max_age: 0)
end

def cache_one_hour
  cache_control(:public, max_age: 3600)
end

def no_content()
  halt(204, "No content\n")
end

def bad_request()
  halt(400, "Bad Request\n")
end

def json_bad_request()
  content_type :json
  halt(400, { error: "Bad Request" }.to_json)
end

def not_authorized()
  halt(401, "Not authorized\n")
end

def not_found()
  halt(404, "Not found\n")
end

def unsupported_media_type()
  halt(415, "Unsupported Media Type\n")
end
