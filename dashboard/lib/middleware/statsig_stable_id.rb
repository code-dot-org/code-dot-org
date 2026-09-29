# frozen_string_literal: true

require 'cdo/anon_user_id'
require 'cdo/shared_constants'
require 'cdo/rack/request'

module Middleware
  # Maintains the Statsig stable ID before dispatching a request.
  #
  # With OneTrust performance-cookie consent, the ID is shared between the session
  # and the Code.org-domain cookie used by Statsig clients.
  # Without consent, the ID remains session-only and any existing shared cookie is deleted.
  #
  # @see Cdo::RequestExtension#statsig_stable_id
  # @see Cdo::RequestExtension#onetrust_performance_cookies_allowed?
  class StatsigStableId
    STORAGE_KEY = SharedConstants::STATSIG_STABLE_ID_KEY

    def initialize(app)
      @app = app
    end

    def call(env)
      request = ActionDispatch::Request.new(env)

      if request.onetrust_performance_cookies_allowed?
        statsig_stable_id = request.cookies[STORAGE_KEY].presence || request.session[STORAGE_KEY].presence || Cdo::AnonUserId.generate

        unless request.cookies[STORAGE_KEY] == statsig_stable_id
          # This cookie is used by the Statsig SDK for backend, frontend, and Marketing site.
          # See: `findOrCreateStableId()` in `apps/src/metrics/statsigHelpers.js`
          request.cookie_jar[STORAGE_KEY] = {
            value: statsig_stable_id,
            domain: request.shared_cookie_domain,
            path: '/',
            same_site: :lax,
            secure: !CDO.rack_env?(:development),
          }
        end

        unless request.session[STORAGE_KEY] == statsig_stable_id
          request.session[STORAGE_KEY] = statsig_stable_id
        end
      else
        request.cookie_jar.delete(STORAGE_KEY, domain: request.shared_cookie_domain, path: '/')
        request.session[STORAGE_KEY] ||= Cdo::AnonUserId.generate
      end

      @app.call(env)
    end
  end
end
