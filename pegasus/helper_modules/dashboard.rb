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

  def self.admin?(user_id)
    !!db[:users][id: user_id, admin: true]
  end

  class User
    # Wrap dashboard user row in this helper object.
    # You can use this, but it's preferred that clients call User.get(user_id).
    def initialize(user_row)
      @row = user_row
    end

    # @returns [User] for given user_id, or nil if not found in database
    def self.get(user_id)
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
    def to_hash()
      @row.to_hash
    end

    # @returns [Hash] containing all the requested keys
    def select(*keys)
      {}.tap do |result|
        keys.each do |key|
          result[key] = if @row.has_key? key
                          @row[key]
                        elsif respond_to? key
                          send(key)
                        else
                          nil
                        end
        end
      end
    end

    def followed_by?(other_user_id)
      Dashboard.db[:followers].
        join(:users, :id=>:followers__student_user_id).
        where(followers__student_user_id: other_user_id).
        where(followers__user_id: id).
        where(users__deleted_at: nil, followers__deleted_at: nil).
        any?
    end

    def owned_sections
      Dashboard.db[:sections].
        select(:id).where(user_id: id, deleted_at: nil).all
    end

  end

end
