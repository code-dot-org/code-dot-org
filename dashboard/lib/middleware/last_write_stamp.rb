# frozen_string_literal: true

module Middleware
  # Records when a session last made a write request, so that later reads can choose between the writer and a replica.
  # This is the write half of Rails' DatabaseSelector: a request other than GET or HEAD runs as usual and then stamps
  # session[:last_write]. Unlike DatabaseSelector, it moves no request to a replica.
  #
  # To read from a replica without missing the session's own recent writes, wrap the read in Resolver#read. It uses
  # the writer for Resolver::SEND_TO_REPLICA_DELAY (two seconds) after the stamp and a replica after that. Today the
  # only caller is the user-cookie hook in config/initializers/devise.rb.
  #
  # If dashboard adopts DatabaseSelector, Context can serve as config.active_record.database_resolver_context and this
  # class can be deleted.
  class LastWriteStamp
    Resolver = ActiveRecord::Middleware::DatabaseSelector::Resolver

    def initialize(app)
      @app = app
    end

    def call(env)
      request = ActionDispatch::Request.new(env)
      resolver = Resolver.call(Context.call(request))
      return @app.call(env) if resolver.reading_request?(request)

      resolver.write {@app.call(env)}
    end

    class Context < Resolver::Session
      # Milestones post on every level attempt and write only progress, which no caller of Resolver#read reads.
      EXEMPT_ROUTES = %w[activities#milestone].freeze

      def self.call(request)
        new(request)
      end

      def initialize(request)
        super(request.session)
        @request = request
      end

      def update_last_write_timestamp
        super if !exempt_route? && signed_in?
      end

      private def exempt_route?
        EXEMPT_ROUTES.include?(@request.path_parameters.values_at(:controller, :action).join('#'))
      end

      # Resolver#read is only called for signed-in users.
      private def signed_in?
        @request.env['warden']&.user(scope: :user, run_callbacks: false).present?
      end
    end
  end
end
