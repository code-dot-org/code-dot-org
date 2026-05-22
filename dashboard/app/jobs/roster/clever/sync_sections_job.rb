# frozen_string_literal: true

module Roster
  module Clever
    class SyncSectionsJob < ApplicationJob
      rescue_from StandardError, with: :report_exception

      def perform(teacher_id:)
        teacher = Teacher.find(teacher_id)

        CleverSection.visible.where(teacher:).find_each do |section|
          Services::Roster::Clever::SectionSyncer.call(teacher:, section:)
        end
      end
    end
  end
end
