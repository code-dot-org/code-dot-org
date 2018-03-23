require pegasus_dir('router')

class PegasusSites
  def initialize(app=nil, params={})
    @app = app

    config_ru = File.absolute_path(File.dirname(__FILE__) + '/../../pegasus/config.ru')
    @pegasus_app = Rack::Builder.parse_file(config_ru).first
    pegasus_domains = %w(
      code.org
      codeprojects.org
      csedweek.org
      hourofcode.com
      advocacy.code.org
    ).concat(CDO.partners.map {|partner| "#{partner}.code.org"})
    @pegasus_hosts = pegasus_domains.map {|i| canonical_hostname(i)}
  end

  def call(env)
    request = Rack::Request.new(env)

    # /dashboardapi at either host goes to dashboard
    if request.path =~ /^\/dashboardapi\//
      env['HTTP_HOST'] = canonical_hostname('studio.code.org') + (CDO.https_development ? '' : ":#{CDO.dashboard_port}")
    end

    # /v2 at either host goes to pegasus
    if request.path =~ /^\/v2\//
      env['HTTP_HOST'] = canonical_hostname('code.org') + (CDO.https_development ? '' : ":#{CDO.pegasus_port}")
    end

    if @pegasus_hosts.any? {|host| host.include? request.host}
      @pegasus_app.call(env)
    else
      @app.call(env)
    end
  end
end
