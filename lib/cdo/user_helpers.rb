module UserHelpers
  # Generate a unique* username based on a name. queryable is
  # interface that responds to 'where' (ie. an ActiveRecord::Base
  # class or a Sequel dataset)
  # * uniqueness subject to race conditions. There's a unique
  # constraint in the db -- callers should retry
  USERNAME_ALLOWED_CHARACTERS = /[a-z0-9\-\_\.]/

  def self.generate_username(queryable, name)
    prefix = name.downcase.gsub(/[^#{USERNAME_ALLOWED_CHARACTERS.source}]+/, ' ')[0..16].squish.gsub(' ', '_')

    prefix = 'coder' if prefix.empty? || prefix == '_'

    prefix = "coder_#{prefix}" if prefix.length < 5

    return prefix if queryable.where(username: prefix).limit(1).count == 0
    
    similar_users = queryable.where(["username like ?", prefix + '%']).select(:username).to_a
    similar_usernames = similar_users.map do |user|
      if user.respond_to?(:username)
        # AR returns a User instance
        user.username
      else
        # Sequel returns a hash
        user[:username]
      end
    end

    # find the current maximum integer suffix and add 1. Not guaranteed to be the "next" as in not leave holes,
    # but is guaranteed to be (currently) unique
    suffix = similar_usernames.map{|n| n[prefix.length..-1]}.map(&:to_i).max + 1
    return "#{prefix}#{suffix}"
  end
end
