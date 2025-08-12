# frozen_string_literal: true

require 'cdo/db'

module HocLegacy
  class TutorialLauncher < Services::Base
    include SessionManageable

    attr_reader :controller, :tutorial, :company, :track_learn

    def initialize(controller:, tutorial:, company: nil, track_learn: false)
      @controller = controller
      @tutorial = tutorial
      @company = company
      @track_learn = track_learn
    end

    def call
      return if CDO.read_only

      session_row = create_session_row(
        {
          referer: request.referer_site_with_port,
          tutorial: tutorial[:code],
          company: company,
          started_at: DateTime.now,
          started_ip: request.ip,
        }
      )

      # TODO(elijah): this pathway (formerly used by /api/hour/begin_learn)
      #               is currently unused. Either reenable the pathway in a more-scalable way or remove this block.
      if track_learn
        PEGASUS_DB[:hoc_learn_activity].insert(
          referer: request.referer_site_with_port,
          weight: DCDO.get('hoc_learn_activity_sample_weight', 1).to_i,
          hoc_activity_id: session_row[:id],
          tutorial: tutorial[:code],
          created_at: DateTime.now,
        )
      end
    end

    private delegate :request, :response, to: :controller
  end
end
