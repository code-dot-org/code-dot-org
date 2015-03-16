def dont_cache
  cache_control(:private, :must_revalidate, max_age:0)
end

def no_content()
  halt(204, "No content\n")
end

def bad_request()
  halt(400, "Bad Request\n")
end

def not_found()
  halt(404, "Not found\n")
end

def unsupported_media_type()
  halt(415, "Unsupported Media Type\n")
end
