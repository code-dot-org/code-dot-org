module UserHelpers
  # Generate a unique* username based on a name. queryable is
  # interface that responds to 'where' (ie. an ActiveRecord::Base
  # class or a Sequel dataset)
  # * uniqueness subject to race conditions. There's a unique
  # constraint in the db -- callers should retry
  USERNAME_ALLOWED_CHARACTERS = /[a-z0-9\-\_\.]/

  def self.generate_username(queryable, name)
    prefix = name.downcase.gsub(/[^#{USERNAME_ALLOWED_CHARACTERS.source}]+/, ' ')[0..16].squish.gsub(' ', '_')

    if prefix.empty? || prefix == ''
      prefix = 'coder' + (rand(900000) + 100000).to_s
    end

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

  def self.random_donor
    weight = SecureRandom.random_number
    PEGASUS_DB[:cdo_donors].where('((weight_f - ?) >= 0)', weight).first
  end

  def self.sponsor_message(user)
    sponsor = random_donor[:name_s]

    if user.teacher?
      "#{sponsor} made the generous gift to sponsor your classroom's learning. Pay it forward, <a href=\"https://code.org/donate\">donate $25 to Code.org</a> to pay for another classroom's education."
    else
      "#{sponsor} made the generous gift to sponsor your learning. A generous <a href=\"https://code.org/donate\">gift of $1 to Code.org</a> will help another student learn."
    end
  end
end
