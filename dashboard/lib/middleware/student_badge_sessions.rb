module Middleware
  class StudentBadgeSessions
    def initialize(app)
      @app = app
    end

    def call(env)
      session = env['rack.session']
      if session && session[Services::StudentBadges::Session::KEY]
        unless Services::StudentBadges::Session.valid?(session)
          session.clear
          env['rack.session.options'][:renew] = true
          if env['HTTP_ACCEPT'].to_s.include?('text/html')
            destination = Policies::StudentBadges.authentication_enabled? ? '/badge_login' : '/users/sign_in'
            return [303, {'Location' => destination, 'Cache-Control' => 'no-store'}, []]
          end
          return [401, {'Content-Type' => 'application/json', 'Cache-Control' => 'no-store'}, ['{"error":"badge_session_expired"}']]
        end
        env['cdo.badge_verified'] = true
      end
      status, headers, body = @app.call(env)
      headers['Cache-Control'] = 'no-store' if env['cdo.badge_verified']
      [status, headers, body]
    end
  end
end
