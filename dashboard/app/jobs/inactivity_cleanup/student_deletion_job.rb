# frozen_string_literal: true

module InactivityCleanup
  class StudentDeletionJob < ApplicationJob
    rescue_from StandardError, with: :report_exception

    # @param dry_run [Boolean] If true, no accounts will actually be deleted.
    # @param limit [Integer, NullClass] The maximum number of accounts to delete in a single run.
    def perform(dry_run: false, limit: nil)
      InactivityCleanup::StudentDeleter.new(dry_run:, limit:).call
    end
  end
end
