# frozen_string_literal: true

module Api::V1
  module Roster
    module Clever
      class SectionsController < BaseController
        # POST /api/v1/roster/clever/sections/sync
        #
        # Enqueues a unique background sync of Clever roster sections for the current teacher.
        #
        # @note The job is only enqueued if an identical job is not already scheduled.
        # @see Roster::Clever::SyncSectionsJob
        def sync_all
          sync_sections_job = ::Roster::Clever::SyncSectionsJob.new(teacher_id: current_user.id)

          if sync_sections_job.unique?
            sync_sections_job.enqueue
            render json: {message: I18n.t('roster.sync.has_started')}
          else
            render json: {message: I18n.t('roster.sync.in_progress')}
          end
        end
      end
    end
  end
end
