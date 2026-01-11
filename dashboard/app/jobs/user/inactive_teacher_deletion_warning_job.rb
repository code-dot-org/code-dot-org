# frozen_string_literal: true

class User
  class InactiveTeacherDeletionWarningJob < ApplicationJob
    queue_as :default

    rescue_from StandardError, with: :report_exception

    def perform(dry_run: false, limit: nil)
      InactiveTeacherDeletionWarningMailer.new(dry_run:, limit:).call
    end
  end
end
