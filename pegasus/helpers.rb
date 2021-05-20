require 'cdo/aws/s3'
require 'rack/csrf'
require_relative '../shared/middleware/helpers/storage_id'
require 'cdo/asset_helper'
require 'cdo/cookie_helpers'
require 'cdo/language_dir'

def avatar_image(name, width=320, square_photo=false)
  basename = name.downcase.gsub(/\W/, '_').gsub(/_+/, '_')
  path = resolve_image("images/avatars/#{basename}")
  return nil unless path
  dimensions = "fit-#{width}"
  dimensions = "fill-#{width}x#{width}" if square_photo == true
  "/images/#{dimensions}/avatars/#{File.basename(path)}"
end

def authentication_required!(url=request.url)
  dont_cache
  return if dashboard_user_helper
  redirect((request.scheme || 'http') + ':' + CDO.studio_url("/users/sign_in?user_return_to=#{url}"), 302)
end

def dont_cache
  cache_control(:private, :must_revalidate, max_age: 0)
end

def cache_for(seconds, proxy_seconds=nil)
  proxy_seconds ||= seconds / 2
  cache_control(:public, :must_revalidate, max_age: seconds, s_maxage: proxy_seconds)
end

# Sets caching headers based on the document type,
# based on the :x_max_age and :x_proxy_max_age Sinatra settings.
def cache(type)
  max_age = settings.method("#{type}_max_age").call
  proxy_max_age = settings.method("#{type}_proxy_max_age").call
  cache_for(max_age, proxy_max_age)
end

def canonical_hostname(domain)
  CDO.canonical_hostname(domain)
end

def studio_url(path = '')
  port = (!rack_env?(:development) || CDO.https_development) ? '' : ":#{CDO.dashboard_port}"
  "//#{canonical_hostname('studio.code.org')}#{port}/#{path}"
end

def code_org_url(path = '')
  port = (!rack_env?(:development) || CDO.https_development) ? '' : ":#{CDO.pegasus_port}"
  "//#{canonical_hostname('code.org')}#{port}/#{path}"
end

def forbidden!
  halt(403, "Forbidden\n")
end

def form_error!(e)
  halt(400, {'Content-Type' => 'text/json'}, e.errors.to_json)
end

def have_permission?(permission)
  return false unless dashboard_user_helper
  dashboard_user_helper.has_permission?(permission)
end

def no_content!
  halt(204, "No content\n")
end

def not_authorized!
  halt(401, "Not authorized\n")
end

def not_found!
  path = resolve_template('views', settings.template_extnames, '404')
  content = path ? document(path) : "Not found\n"
  halt(404, content)
end

def only_for(site)
  if site.is_a?(Array)
    pass unless site.include?(request.site)
  else
    pass unless request.site == site
  end
end

def service_unavailable!
  halt(503, "Service Unavailable\n")
end

def unsupported_media_type!
  halt(415, "Unsupported Media Type\n")
end

def csrf_token
  Rack::Csrf.csrf_token(env)
end

def csrf_tag
  Rack::Csrf.csrf_tag(env)
end

def curriculum_url(resource)
  CDO.curriculum_url(request.locale, resource)
end

def verify_signature(token)
  request.body.rewind
  payload_body = request.body.read
  signature = 'sha1=' + OpenSSL::HMAC.hexdigest(
    OpenSSL::Digest.new('sha1'),
    token,
    payload_body
  )
  Rack::Utils.secure_compare(signature, request.env['HTTP_X_HUB_SIGNATURE'])
end

Dir.glob(pegasus_dir('helpers/*.rb')).sort.each {|path| require path}
