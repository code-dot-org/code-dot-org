# frozen_string_literal: true

module HocLegacy
  class TutorialPixelLauncher < Services::Base
    include SessionManageable

    attr_reader :controller, :tutorial

    def initialize(controller:, tutorial:)
      @controller = controller
      @tutorial = tutorial
    end

    def call
      return if CDO.read_only

      if session_pending?
        session_row_query.update(
          pixel_started_at: DateTime.now,
          pixel_started_ip: request.ip,
        )
      else
        create_session_row(
          {
            referer: request.host_with_port,
            tutorial: tutorial&.tutorial_id,
            pixel_started_at: DateTime.now,
            pixel_started_ip: request.ip,
          }
        )
      end
    end

    private delegate :request, :response, to: :controller

    private def session_row
      return @session_row if defined?(@session_row)
      @session_row = session_row_query.first
    end

    private def session_pending?
      session_row && !session_row[:pixel_started_at] && !session_row[:pixel_finished_at] && !session_row[:finished_at]
    end
  end
end
