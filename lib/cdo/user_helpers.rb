module UserHelpers
  # Generate a unique* username based on a name. queryable is
  # interface that responds to 'where' (ie. an ActiveRecord::Base
  # class or a Sequel dataset)
  # * uniqueness subject to race conditions. There's a unique
  # constraint in the db -- callers should retry
  USERNAME_ALLOWED_CHARACTERS = /[a-z0-9\-\_\.]/

  def self.generate_username(queryable, name)
    prefix = name.downcase.
      gsub(/[^#{USERNAME_ALLOWED_CHARACTERS.source}]+/, ' ')[0..16].
      squish.
      tr(' ', '_')

    if prefix.empty? || prefix == ''
      prefix = 'coder' + (rand(900000) + 100000).to_s
    end
    prefix = "coder_#{prefix}" if prefix.length < 5

    return prefix if queryable.where(username: prefix).limit(1).empty?

    # Throw darts to find an appropriate suffix, using it if we hit bullseye.
    (0..2).each do |exponent|
      min_index = 10**exponent
      max_index = 10**(exponent + 1) - 1
      3.times do |_i|
        suffix = Random.rand(min_index..max_index)
        if queryable.where(username: "#{prefix}#{suffix}").limit(1).empty?
          return "#{prefix}#{suffix}"
        end
      end
    end

    # The darts missed, so revert to using a slow query.
    similar_users = queryable.where(["username like ?", prefix + '%']).select(:username).to_a
    similar_usernames = similar_users.map do |user|
      # ActiveRecord returns a User instance, whereas Sequel returns a hash.
      user.respond_to?(:username) ? user.username : user[:username]
    end

    # Increment the current maximum integer suffix. Though it may leave holes,
    # it is guaranteed to be (currently) unique.
    suffix = similar_usernames.map {|n| n[prefix.length..-1]}.map(&:to_i).max + 1
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

  def self.age_from_birthday(birthday)
    ((Date.today - birthday) / 365).to_i
  end
end
