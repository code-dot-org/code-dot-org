# AlchemyCMS Dragonfly configuration.
#
# Consider using some kind of caching solution for image processing.
# For small projects, we have good experience with Rack::Cache.
#
# Larger installations should consider using a CDN, start reading
# http://markevans.github.io/dragonfly/cache/
#
# A complete reference can be found at
# http://markevans.github.io/dragonfly/configuration/
#
# Pictures
#
Dragonfly.app(:alchemy_pictures).configure do
  dragonfly_url nil
  plugin :imagemagick
  plugin :svg
  secret '49d640a338febd7b22a4a0ca88f58f2cd8a4117043b6b97b6648ec98b3de4117'
  url_format '/pictures/:job/:name.:ext'

  datastore :file,
    root_path: Rails.root.join('uploads/pictures').to_s,
    server_root: Rails.root.join('public'),
    store_meta: false
end

# Mount as middleware
Rails.application.middleware.use Dragonfly::Middleware, :alchemy_pictures

# Attachments
Dragonfly.app(:alchemy_attachments).configure do
  datastore :file,
    root_path:  Rails.root.join('uploads/attachments').to_s,
    store_meta: false
end
