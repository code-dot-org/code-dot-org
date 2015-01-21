require pegasus_dir('router')

class PegasusSites
  
  def initialize(app=nil, params={})
    @app = app

    @pegasus_app = Documents.new
    @pegasus_hosts = [
      'code.org',
      'csedweek.org',
    ].map{|i| canonical_hostname(i)}
  end
  
  def call(env)
    request = Rack::Request.new(env)
    
    if request.path_info =~ /^\/dashboardapi\//
      env['HTTP_HOST'] = canonical_hostname('studio.code.org') + ":#{CDO.dashboard_port}"
    end

    return @pegasus_app.call(env) if @pegasus_hosts.include?(request.host) && !(request.path_info =~ /^\/dashboardapi\//)
    return @pegasus_app.call(env) if request.path_info =~ /^\/v2\//

    @app.call(env)
  end

end
