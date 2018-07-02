#
# A set of utilities that provide access to the current user, their
# authentication state, and other DASHBOARD_DB access.
#
module Dashboard
  # Get the dashboard database
  # The static constant is wrapped here so it's easy to stub for tests.
  # @returns [Database]
  def self.db
    DASHBOARD_DB
  end

  def self.db_reporting_reader
    DASHBOARD_REPORTING_DB_READER
  end

  def self.admin?(user_id)
    !!db[:users][id: user_id, admin: true]
  end

  def self.hidden_script_access?(user_id)
    user = User.get(user_id)
    user && (user.admin? || user.has_permission?('hidden_script_access'))
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
      row = Dashboard.db[:users].where(id: user_id, deleted_at: nil).first
      return nil unless row
      Dashboard::User.new(row)
    end

    # Retrieves the indicated user from the database, ignoring soft-deletes.
    # @returns [User] for given user_id, or nil if not found in database
    def self.get_with_deleted(user_id)
      row = Dashboard.db[:users].where(id: user_id).first
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

    # @param [String|Symbol] permission
    # @returns [Boolean] true if user has the named permission
    def has_permission?(permission)
      permission = permission.to_s.strip.downcase
      case permission
        when 'admin' then admin?
        when 'teacher' then teacher?
        else !!Dashboard.db[:user_permissions][user_id: id, permission: permission]
      end
    end

    # @returns [Hash] dashboard DB row for this user as a hash
    def to_hash
      @row.to_hash
    end

    # @returns [Hash] containing all the requested keys
    def select(*keys)
      {}.tap do |result|
        keys.each do |key|
          result[key] = if @row.key? key
                          @row[key]
                        elsif respond_to? key
                          send(key)
                        else
                          nil
                        end
        end
      end
    end

    # @param other_user_ids [Array[Integer]] the user IDs to check.
    # @return [Array[Integer]] the subset of other_user_ids that are followeds
    #   of the user encapsulated by this class.
    def get_followed_bys(other_user_ids)
      Dashboard.db[:sections].
        join(:followers, section_id: :sections__id).
        join(:users, id: :followers__student_user_id).
        where(sections__user_id: id, sections__deleted_at: nil).
        where(followers__student_user_id: other_user_ids, followers__deleted_at: nil).
        where(users__deleted_at: nil).
        select_map(:followers__student_user_id)
    end

    # @param other_user_id [Integer] the user ID to check.
    # @return [Boolean] whether other_user_id is a followed of the user
    #   encapsulated by this class.
    def followed_by?(other_user_id)
      Dashboard.db[:sections].
        join(:followers, section_id: :sections__id).
        join(:users, id: :followers__student_user_id).
        where(sections__user_id: id, sections__deleted_at: nil).
        where(followers__student_user_id: other_user_id, followers__deleted_at: nil).
        where(users__deleted_at: nil).
        any?
    end

    def owned_sections
      Dashboard.db[:sections].
        select(:id).where(user_id: id, deleted_at: nil).all
    end
  end
end
