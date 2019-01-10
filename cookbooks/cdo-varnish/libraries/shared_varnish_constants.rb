# module containing varnish-related constants which need to be shared between
# chef and application server code. Storing constants here allows them to be
# accessed without pulling in anything else in HttpCache.

module SharedVarnishConstants
  ALLOWED_WEB_REQUEST_HEADERS = %w(
    Authorization
  )
end
