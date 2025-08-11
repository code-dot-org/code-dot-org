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
      unless CDO.read_only || unsampled_session?
        session_row = create_session_row_unless_unsampled(
          referer: request.referer_site_with_port,
          tutorial: tutorial[:code],
          company: company,
          started_at: DateTime.now,
          started_ip: request.ip
        )
      end

      # TODO(elijah): this pathway (formerly used by /api/hour/begin_learn)
      #               is currently unused. Either reenable the pathway in a more-scalable way or remove this block.
      if track_learn && !CDO.read_only
        learn_weight = DCDO.get('hoc_learn_activity_sample_weight', 1).to_i

        if learn_weight > 0 && Kernel.rand < (1.0 / learn_weight)
          PEGASUS_DB[:hoc_learn_activity].insert(
            referer: request.referer_site_with_port,
            weight: learn_weight,
            hoc_activity_id: session_row.try(:[], :id),
            tutorial: tutorial[:code],
            created_at: DateTime.now,
          )
        end
      end
    end

    private delegate :request, :response, to: :controller
  end
end
