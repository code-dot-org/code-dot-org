class User
  class InactiveUserDeletionJob < ApplicationJob
    def perform(dry_run: false, limit: nil)
      InactiveUserDeleter.new(dry_run:, limit:).call
    end
  end
end
