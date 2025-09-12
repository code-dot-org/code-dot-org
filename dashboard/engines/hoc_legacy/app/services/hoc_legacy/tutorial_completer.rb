# frozen_string_literal: true

module HocLegacy
  class TutorialCompleter < Services::Base
    include SessionManageable

    attr_reader :controller, :tutorial

    def initialize(controller:, tutorial: nil)
      @controller = controller
      @tutorial = tutorial
    end

    # @return [String] Finish URL to redirect to after finishing the tutorial session
    def call
      return if CDO.read_only

      session_row = session_row_query.first

      # We intentionally allow this DB write even for otherwise unsampled sessions so we can generate personalized,
      # shareable certificates. Only a fraction of users reach the end so its OK to write here.
      if session_row
        new_row_data = {
          finished_at: DateTime.now,
          finished_ip: request.ip,
        }
        session_row_query.update(new_row_data)
        session_row.merge!(new_row_data)
      else
        session_row = create_session_row(
          {
            referer: request.host_with_port,
            tutorial: tutorial&.tutorial_id,
            finished_at: DateTime.now,
            finished_ip: request.ip
          }
        )
      end

      session_row
    end

    private delegate :request, :response, to: :controller
  end
end
