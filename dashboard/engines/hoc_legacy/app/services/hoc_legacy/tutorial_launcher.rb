# frozen_string_literal: true

require 'cdo/db'

module HocLegacy
  class TutorialLauncher < Services::Base
    include SessionManageable

    attr_reader :controller, :tutorial, :track_learn

    def initialize(controller:, tutorial:, track_learn: false)
      @controller = controller
      @tutorial = tutorial
      @track_learn = track_learn
    end

    def call
      return if CDO.read_only

      create_session_row(
        {
          referer: request.referer_site_with_port,
          tutorial: tutorial&.tutorial_id,
          started_at: DateTime.now,
          started_ip: request.ip,
        }
      )
    end

    private delegate :request, :response, to: :controller
  end
end
