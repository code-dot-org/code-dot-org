require 'cdo/aws/s3'

def avatar_image(name,width=320)
  basename = name.downcase.gsub(/\W/, '_').gsub(/_+/, '_')
  path = resolve_image("images/avatars/#{basename}")
  return nil unless path
  "/images/fit-#{width}/avatars/#{File.basename(path)}"
end

def authentication_required!(url=request.url)
  dont_cache
  return if dashboard_user
  redirect((request.scheme || 'http') + ':' + CDO.studio_url("/users/sign_in?return_to=#{url}"), 302)
end

def dont_cache()
  cache_control(:private, :must_revalidate, max_age:0)
end

def dashboard_user()
  @dashboard_user ||= DASHBOARD_DB[:users][id:dashboard_user_id]
end

def dashboard_user_id()
  request.user_id
end

def canonical_hostname(domain)
  CDO.canonical_hostname(domain)
end

def forbidden!()
  halt(403, "Forbidden\n")
end

def form_error!(e)
  halt(400, {'Content-Type'=>'text/json'}, e.errors.to_json)
end

def have_permission?(permission)
  return false unless user = dashboard_user

  permission = permission.to_s.strip.downcase
  case permission
  when 'admin'
    return !!user[:admin]
  when 'teacher'
    return user[:user_type] == 'teacher'
  end

  !!DASHBOARD_DB[:user_permissions].where(user_id:user[:id]).and(permission:permission).first
end

def no_content!()
  halt(204, "No content\n")
end

def not_authorized!()
  halt(401, "Not authorized\n")
end

def not_found!()
  path = resolve_template('views', settings.template_extnames, '404')
  content = path ? document(path) : "Not found\n"
  halt(404, content)
end

def only_for(site)
  if site.kind_of?(Array)
    pass unless site.include?(request.site)
  else
    pass unless request.site == site
  end
end

def service_unavailable!()
  halt(503, "Service Unavailable\n");
end

def unsupported_media_type!()
  halt(415, "Unsupported Media Type\n")
end

Dir.glob(pegasus_dir('helpers/*.rb')).sort.each{|path| load path}
