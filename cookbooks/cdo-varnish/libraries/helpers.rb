# Various Ruby helper methods to generate Varnish VCL from the base configuration.

# Basic regex matcher for the optional query part of a URL.
QUERY_REGEX = "(\\?.*)?$"

def path_to_regex(path)
  path = "^/#{path.sub(/^\//,'')}"
  if path[-1] == '*'
    path.slice!(-1)
  else
    path = path + QUERY_REGEX
  end
  path
end

# Varnish uses 'bereq' in the 'response' section, 'req' otherwise.
def req(section)
  section == 'response' ? 'bereq' : 'req'
end

# Returns a regex-matcher string based on an array of filename extensions.
def extensions_to_regex(exts)
  return [] if exts.empty?
  ["(?i)(#{exts.join('|').gsub('.','\.')})#{QUERY_REGEX}"]
end

# Returns a regex-conditional string fragment based on the provided behavior.
# In the 'proxy' section, ignore extension-based behaviors (e.g., *.png).
def paths_to_regex(path_config, section)
  path_config = [path_config] unless path_config.is_a?(Array)
  extensions, paths = path_config.partition{ |path| path[0] == '*' }
  elements = paths.map{|path| path_to_regex(path)}
  elements = extensions_to_regex(extensions.map{|x|x.sub(/^\*/,'')}) + elements unless section == 'proxy'
  elements.empty? ? 'false' : elements.map{|el| "#{req(section)}.url ~ \"#{el}\""}.join(' || ')
end

# Generates the logic string for the specified behavior.
def process_behavior(behavior, app, section)
  if section == 'proxy'
    process_proxy(behavior['proxy'] || app)
  else
    process_cookies(behavior['cookies'], section)
  end
end

# Returns the cookie-filter string for a given 'cookies' behavior.
def process_cookies(cookies, section)
  if section == 'request'
    cookies = ['NO_CACHE'] if cookies == 'none'
    "cookie.filter_except(\"#{cookies.join(',')}\");"
  else
    cookies == 'none' ?
      'unset beresp.http.set-cookie;' :
      ''
  end
end

# Returns the backend-redirect string for a given proxy.
def process_proxy(proxy)
  "set req.backend_hint = #{proxy}.backend();"
end

# Returns the canonical hostname based on the current Chef node's name/environment.
# Keep in sync with CDO.canonical_hostname in deployment.rb.
def canonical_hostname(domain)
  return "console.#{domain}" if node.name == 'production-console'
  return "daemon.#{domain}" if node.name == 'production-daemon'
  return domain if rack_env?(:production)

  # our HTTPS wildcard certificate only supports *.code.org
  # 'env', 'studio.code.org' over https must resolve to 'env-studio.code.org' for non-prod environments
  sep = domain.include?('.code.org') ? '-' : '.'

  # Handle some hard-coded exceptions
  {
    react: 'react',
    translate: 'crowdin',
    levelbuilder: 'levelbuilder-staging',
    'levelbuilder-dev' => 'levelbuilder-development',
  }.each do |subdomain, node_name|
    return "#{subdomain}#{sep}#{domain}" if node.name == node_name
  end

  "#{node.chef_environment}#{sep}#{domain}"
end

def rack_env?(env)
  env.to_s == node.chef_environment
end

# Returns the hostname-specific conditional expression for the app provided.
def if_app(app, section)
  app == 'dashboard' ? (req(section)+'.http.host ~ "(dashboard|studio).code.org$"') : nil
end

# Generate an "if(){} else if {} else {}" string from an array of items, conditional Proc, and a block.
def if_else(items, conditional)
  _buf = ''
  items.each_with_index do |item, i|
    condition = conditional.call(item)
    _buf << "#{i != 0 ? 'else ' : ''}#{condition && "if (#{condition}) "} {\n"
    _buf << yield(item).lines.map{|line| '  ' + line }.join << "\n"
    _buf << "}\n"
  end
  _buf
end

# Generates the VCL string for each section: 'request', 'response', or 'proxy'.
def setup_behavior(section)
  if_else(%w(dashboard pegasus), lambda{|app|if_app(app,section)}) do |app|
    config = node['cdo-varnish']['config'][app]
    configs = config['behaviors'] + [config['default']]
    if_else(configs, lambda{|b|b['path'] ? paths_to_regex(b['path'], section) : nil}) do |behavior|
      process_behavior(behavior, app, section)
    end
  end
end
