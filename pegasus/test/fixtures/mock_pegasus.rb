require_relative '../../router'

# Wrapper for the Pegasus "Documents" app that sets necessary environment
# variables for testing requests against it.
class MockPegasus
  def initialize(app=nil, params={})
    $log.level = Logger::ERROR # Pegasus spams debug logging, unneeded for tests
    @app = Documents.new(app)
  end

  def call(env)
    # Not sure why, but it seems necessary to set HTTP_HOST for Pegasus to find
    # the appropriate routes.
    env['HTTP_HOST'] = canonical_hostname('code.org') + (CDO.https_development ? '' : ":#{CDO.pegasus_port}")
    @app.call(env)
  end
end
