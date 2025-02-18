require pegasus_dir('router')
require 'cdo/http_cache'
require 'cdo/legacy_varnish_helpers'

# Simple Rack middleware that forwards requests to Pegasus or Dashboard where appropriate.
# Matches `Host` HTTP request headers against standard Pegasus hosts.
# Also processes HTTP-Cache `proxy` values for correct path-specific behaviors.
class PegasusSites
  def initialize(app = nil, params = {})
    @app = app

    config_ru = File.absolute_path(File.dirname(__FILE__) + '/../../pegasus/config.ru')
    @pegasus_app = Rack::Builder.parse_file(config_ru).first
    pegasus_domains = %w(
      code.org
      csedweek.org
      hourofcode.com
    ).concat(CDO.partners.map {|partner| "#{partner}.code.org"})
    @pegasus_hosts = pegasus_domains.map {|i| CDO.canonical_hostname(i)}
    @config = HttpCache.config(rack_env)
  end

  def call(env)
    request = Rack::Request.new(env)
    path = request.path

    # Match against standard Pegasus hosts.
    backend = if @pegasus_hosts.any? {|host| host.include? request.host}
                :pegasus
              else
                :dashboard
              end

    # Process HTTP-cache `proxy` values for path-specific behavior.
    config = @config[backend][:behaviors] + [@config[backend][:default]]
    behavior = LegacyVarnishHelpers.behavior_for_path(config, path)
    if (proxy = behavior[:proxy])
      if proxy == 'pegasus'
        backend = :pegasus
        env['HTTP_HOST'] = CDO.site_url('code.org')
      elsif %w(cdo-assets dashboard).include?(proxy)
        backend = :dashboard
        env['HTTP_HOST'] = CDO.site_url('studio.code.org')
      end
    end

    app = backend == :pegasus ? @pegasus_app : @app
    app.call(env)
  end
end
