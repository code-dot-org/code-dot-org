require pegasus_dir('router')

class PegasusSites

  def initialize(app=nil, params={})
    @app = app

    @pegasus_app = Documents.new
    @pegasus_hosts = [
      'code.org',
      'csedweek.org',
      'hourofcode.com',
    ].map{|i| canonical_hostname(i)}
  end

  def call(env)
    request = Rack::Request.new(env)

    # /dashboardapi at either host goes to dashboard
    if request.path =~ /^\/dashboardapi\//
      env['HTTP_HOST'] = canonical_hostname('studio.code.org') + ":#{CDO.dashboard_port}"
    end

    # /v2 at either host goes to pegasus
    if request.path =~ /^\/v2\//
      env['HTTP_HOST'] = canonical_hostname('code.org') + ":#{CDO.pegasus_port}"
    end

    if @pegasus_hosts.include?(request.host)
      @pegasus_app.call(env)
    else
      @app.call(env)
    end
  end

end
