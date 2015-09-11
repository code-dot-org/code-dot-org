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
    !!db[:users].where(id: user_id, admin: true).first
  end

  class User
    # Wrap dashboard user row in this helper object.
    # You can use this, but it's preferred that clients call User.get(user_id).
    def initialize(user_row)
      @row = user_row
    end

    # @returns [User] for given user_id, or nil if not found in database
    def self.get(user_id)
      return nil unless (row = Dashboard::db[:users][id: user_id])
      Dashboard::User.new(row)
    end

    def id
      @row[:id]
    end

    # @returns [Boolean] true if user is an admin
    def admin?
      !!@row[:admin]
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

    def owned_sections
      Dashboard::db[:sections].select(:id).where(user_id: id).all
    end

  end

end
