# Various Ruby helper methods to generate Varnish VCL from the base configuration.

# TODO: Find a better way of passing node configuration to Chef config helpers.
$node_env = 'development'
$node_name = 'default'

# Keep these hostname helper methods in sync with deployment.rb.
# TODO Find a better way to reuse existing application configuration in Chef config helpers.
def canonical_hostname(domain)
  # Allow hostname overrides
  return $override_dashboard if $override_dashboard && domain == 'studio.code.org'
  return $override_pegasus if $override_pegasus && domain == 'code.org'

  return "#{name}.#{domain}" if ['console', 'hoc-levels'].include?($node_name)
  return domain if $node_env == 'production'

  # our HTTPS wildcard certificate only supports *.code.org
  # 'env', 'studio.code.org' over https must resolve to 'env-studio.code.org' for non-prod environments
  sep = (domain.include?('.code.org')) ? '-' : '.'
  return "localhost#{sep}#{domain}" if $node_env == 'development'
  return "translate#{sep}#{domain}" if $node_name == 'crowdin'
  "#{$node_env}#{sep}#{domain}"
end

def dashboard_hostname
  canonical_hostname('studio.code.org')
end

def pegasus_hostname
  canonical_hostname('code.org')
end

# Basic regex matcher for an optional query part of a URL followed by end-of-string anchor.
END_URL_REGEX = "(\\?.*)?$".freeze

# Takes an array of path-patterns as input, validating and normalizing
# them for use within a Varnish (or Ruby) regular expression.
# Returns an array of path-matching Varnish/Ruby regular expression strings.
def normalize_paths(paths)
  paths = [paths] unless paths.is_a?(Array)
  paths.map(&:dup).map do |path|
    raise ArgumentError.new("Invalid path: #{path}") unless valid_path?(path)
    # Strip leading slash from extension path
    path.gsub!(/^\/(?=\*.)/, '')
    # Escape some valid special characters
    path.gsub!(/[.+$"]/) {|s| '\\' + s}
    # Replace * wildcards with .* regex fragment
    path.gsub!(/\*/, '.*')
    "^#{path}#{END_URL_REGEX}"
  end
end

# Ensures paths are valid, but don't return any processed results.
# Used by the CloudFront layer to avoid duplicating path-validation logic.
def validate_paths(paths)
  normalize_paths paths
  nil
end

# The maximum length of a path pattern is 255 characters.
# The value can contain any of the following characters:
# A-Z, a-z (case sensitive, so the path pattern /*.jpg doesn't apply to the file /LOGO.JPG.)
# 0-9
# _ - . $ / ~ " ' @ : +
#
# The following characters are allowed in CloudFront path patterns, but
# are not allowed in our configuration format to reduce complexity:
# * (exactly one wildcard required, either at the start or end of the path)
# ? (No 1-character wildcards allowed)
# &, passed and returned as &amp;
def valid_path?(path)
  # Maximum length
  return false if path.length > 255
  # Valid characters allowed
  ch = /[A-Za-z0-9_\-.$\/~"'@:+]*/
  # Require leading slash, maximum one wildcard allowed at start or end
  !!path.match(/^\/( \*#{ch} | #{ch}\* | #{ch} )$/x)
end

# Returns a regex-conditional string fragment based on the provided behavior.
# In the 'proxy' section, ignore extension-based behaviors (e.g., *.png).
def paths_to_regex(path_config, req='req')
  paths = normalize_paths(path_config)
  paths.empty? ? 'false' : paths.map {|path| "#{req}.url ~ \"#{path}\""}.join(' || ')
end

# Evaluate the provided path against the provided config, returning the first matched behavior.
def behavior_for_path(behaviors, path)
  behaviors.detect do |behavior|
    paths = behavior[:path]
    next true unless paths
    normalize_paths(paths).any? {|p| path.match p}
  end
end

# VCL string to create or update a Vary header field with the provided Vary header.
def set_vary(header, resp)
  # Matches a Vary header field delimiter.
  sep = '(\\s|,|^|$)'
  <<-VCL
if (!#{resp}.http.Vary) {
  set #{resp}.http.Vary = "#{header}";
} elseif (#{resp}.http.Vary !~ "#{sep}#{header}#{sep}") {
  set #{resp}.http.Vary = #{resp}.http.Vary + ", #{header}";
}
  VCL
end

# VCL string to set the appropriate Vary header fields based on the provided cache behavior.
# Whitelisted headers are added to Vary directly.
# Whitelisted cookies are added to Vary via their extracted X-COOKIE headers.
def process_vary(behavior, _)
  out = ''
  behavior[:headers].each do |header|
    out << set_vary(header, 'beresp')
  end
  if behavior[:cookies] == 'all'
    out << set_vary('Cookie', 'beresp')
  elsif behavior[:cookies] != 'none'
    behavior[:cookies].each do |cookie|
      out << set_vary("X-COOKIE-#{cookie}", 'beresp')
    end
  end
  out
end

# VCL string to extract a cookie into an internal X-COOKIE HTTP header.
def extract_cookie(cookie)
  <<-VCL
if(cookie.isset("#{cookie}")) {
  set req.http.X-COOKIE-#{cookie} = cookie.get("#{cookie}");
}
  VCL
end

# CloudFront removes these headers by default, but can be added back via whitelist.
# Ref: http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/RequestAndResponseBehaviorCustomOrigin.html#request-custom-headers-behavior
# Simulate similar behavior in Varnish, with optional defaults.
REMOVED_HEADERS = %w(
  Accept
  Accept-Charset
  Accept-Language:en-US
  Referer
  User-Agent:Cached-Request
).freeze

def process_request(behavior, _)
  cookies = behavior[:cookies]
  out = (
    case cookies
    when 'all'
      '# Allow all request cookies.'
    when 'none'
      'cookie.filter_except("NO_CACHE");'
    else
      cookies.map {|c| extract_cookie(c)}.join + "cookie.filter_except(\"#{cookies.join(',')}\");"
    end
  )
  if behavior[:query] == false
    out << "\n" + 'set req.url = regsub(req.url, "\?.*$", "");'
  end
  REMOVED_HEADERS.each do |remove_header|
    name, value = remove_header.split ':'
    next if behavior[:headers].include? name
    out <<
      if value.nil?
        "\nunset req.http.#{name};"
      else
        "\nset req.http.#{name} = \"#{value}\";"
      end
  end
  out
end

def unset_header(header)
  <<-VCL
if(req.http.#{header}) { unset req.http.#{header}; }
  VCL
end

# Returns the cookie-filter string for a given 'cookies' behavior.
def process_response(behavior, _)
  behavior[:cookies] == 'none' ?
    'unset beresp.http.set-cookie;' :
    '# Allow set-cookie responses.'
end

# Returns the backend-redirect string for a given proxy.
# 'pegasus', 'dashboard' or 'cdo-assets' are the only supported values.
def process_proxy(behavior, app)
  proxy = (behavior[:proxy] || app).to_s
  proxy = 'dashboard' if proxy == 'cdo-assets'
  proxy = 'dashboard' if proxy == 'cdo-restricted'
  unless %w(pegasus dashboard).include? proxy
    raise ArgumentError.new("Invalid proxy: #{proxy}")
  end
  hostname = proxy == 'pegasus' ? pegasus_hostname : dashboard_hostname
  out = "set req.backend_hint = #{proxy}.backend();"
  if proxy != app.to_s
    out << "\nset req.http.host = \"#{hostname}\";"
  end
  out
end

# Returns the hostname-specific conditional expression for the app provided.
def if_app(app, req)
  app == :dashboard ? (req + '.http.host ~ "(dashboard|studio)"') : nil
end

# Generate an "if(){} else if {} else {}" string from an array of items, conditional Proc, and a block.
def if_else(items, conditional)
  buf = ''
  if items.one? && conditional.call(items.first).nil?
    return yield(items.first)
  end
  items.each_with_index do |item, i|
    condition = conditional.call(item)
    next if condition.to_s == 'false'
    buf << "#{i != 0 ? 'else ' : ''}#{condition && "if (#{condition}) "}{\n"
    buf << yield(item).lines.map {|line| '  ' + line}.join << "\n} "
  end
  buf.slice!(-1)
  buf
end

# Generates a VCL string for all behaviors in the provided config,
# by executing the given block on each behavior.
def setup_behavior(config, req='req')
  app_condition = lambda do |app|
    if_app(app, req)
  end
  if_else([:dashboard, :pegasus], app_condition) do |app|
    app_config = config[app]
    configs = app_config[:behaviors] + [app_config[:default]]
    path_condition = lambda do |behavior|
      behavior[:path] ? paths_to_regex(behavior[:path], req) : nil
    end
    if_else(configs, path_condition) do |behavior|
      yield behavior, app
    end
  end
end
