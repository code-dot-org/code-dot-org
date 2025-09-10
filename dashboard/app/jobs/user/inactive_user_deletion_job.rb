# frozen_string_literal: true

class User
  class InactiveUserDeletionJob < ApplicationJob
    def perform
      inactive_users.find_each(&:destroy!)
    end

    private def inactive_users
      inactive_query = Queries::User::Inactive.new(
        inactive_since: 54.months.ago,
      )
      @inactive_users ||= inactive_query.call
      puts @inactive_users.count
      @inactive_users
    end
  end
end
