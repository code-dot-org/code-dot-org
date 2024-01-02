#
# A set of utilities that provide access to the current user, their
# authentication state, and other DASHBOARD_DB access.
#
module Dashboard
  # Get the dashboard database
  # The static constant is wrapped here so it's easy to stub for tests.
  # @returns [Database]
  def self.db
    # rubocop:disable CustomCops/DashboardDbUsage
    DASHBOARD_DB
    # rubocop:enable CustomCops/DashboardDbUsage
  end

  def self.admin?(user_id)
    !!db[:users][id: user_id, admin: true]
  end

  class User
    # Wrap dashboard user row in this helper object.
    # You can use this, but it's preferred that clients call User.get(user_id).
    def initialize(user_row)
      @row = user_row
    end

    # Retrieves the indicated user from the database, respecting soft-deletes.
    # @returns [User] for given user_id, or nil if not found in database
    def self.get(user_id)
      return nil if user_id.nil?
      row = Dashboard.db[:users].where(id: user_id, deleted_at: nil).first
      return nil unless row
      Dashboard::User.new(row)
    end

    def id
      @row[:id]
    end

    # @returns [Boolean] true if user is an admin
    def admin?
      !!@row[:admin]
    end

    # @returns [Boolean] true if user is a teacher
    def teacher?
      @row[:user_type] == 'teacher'
    end

    # @returns [Hash] dashboard DB row for this user as a hash
    def to_hash
      @row.to_hash
    end
  end
end
