# frozen_string_literal: true

module Api::V1
  module Roster
    module Clever
      class SectionsController < BaseController
        # POST /api/v1/roster/clever/sections/sync
        #
        # Enqueues a unique background sync of Clever roster sections for the current teacher.
        # @see Roster::Clever::SyncSectionsJob
        def sync_all
          ::Roster::Clever::SyncSectionsJob.perform_later(teacher_id: current_user.id)
          render json: {message: I18n.t('roster.sync.has_started')}
        end
      end
    end
  end
end
