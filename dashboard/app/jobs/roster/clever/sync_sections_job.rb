# frozen_string_literal: true

module Roster
  module Clever
    class SyncSectionsJob < ApplicationJob
      THREADS = 6

      rescue_from StandardError, with: :report_exception

      def perform(teacher_id:)
        teacher = Teacher.find(teacher_id)

        CleverSection.where(teacher:).in_batches do |sections_batch|
          Parallel.each(sections_batch, in_threads: THREADS) do |section|
            Services::Roster::Clever::SectionSyncer.call(teacher:, section:)
          end
        end
      end
    end
  end
end
