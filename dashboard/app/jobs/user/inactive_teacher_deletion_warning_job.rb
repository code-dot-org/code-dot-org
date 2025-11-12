# frozen_string_literal: true

class User
  class InactiveTeacherDeletionWarningJob < ApplicationJob
    queue_as :default

    def perform(dry_run: false, limit: nil)
      InactiveTeacherDeletionWarningEmailer.new(dry_run:, limit:).call
    end
  end
end
