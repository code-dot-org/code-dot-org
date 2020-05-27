module UserHelpers
  # Generate a unique* username based on a name. queryable is
  # interface that responds to 'where' (ie. an ActiveRecord::Base
  # class or a Sequel dataset)
  # * uniqueness subject to race conditions. There's a unique
  # constraint in the db -- callers should retry
  USERNAME_ALLOWED_CHARACTERS = /[a-z0-9\-\_\.]/
  USERNAME_MAX_LENGTH = 20

  def self.generate_username(queryable, name)
    prefix = name.downcase.
      gsub(/[^#{USERNAME_ALLOWED_CHARACTERS.source}]+/, ' ')[0..USERNAME_MAX_LENGTH - 5].
      squish.
      tr(' ', '_')

    if prefix.empty? || prefix == ''
      prefix = 'coder' + rand(100000..999999).to_s
    end
    prefix = "coder_#{prefix}" if prefix.length < 5

    return prefix if queryable.where(username: prefix).limit(1).empty?

    # Throw random darts of increasing length (3 to 7 digits) to find an unused suffix.
    (2..6).each do |exponent|
      min_index = 10**exponent
      max_index = 10**(exponent + 1) - 1
      2.times do |_i|
        suffix = Random.rand(min_index..max_index)
        # Truncate generated username to max allowed length.
        username = "#{prefix}#{suffix}"[0..USERNAME_MAX_LENGTH - 1]
        if queryable.where(username: username).limit(1).empty?
          return username
        end
      end
    end

    # Fallback to a range-scan query to find an available gap in the integer sequence.

    # Use CAST() and SUBSTRING() to parse the suffix as an integer.
    cast = lambda {|t| "CAST(SUBSTRING(#{t}, #{prefix.length + 1}) as unsigned)"}

    query = <<SQL
SELECT #{cast.call('username')} + 1
  FROM users u
  WHERE username LIKE "#{prefix}%"
    AND username RLIKE "^#{prefix}[0-9]+$"
    AND NOT EXISTS (
      SELECT 1
      FROM users u2
      WHERE u2.username = CONCAT("#{prefix}", #{cast.call('u.username')} + 1)
    )
  LIMIT 1;
SQL
    # Execute raw query using either ActiveRecord or Sequel object.
    next_id = queryable.respond_to?(:connection) ?
      queryable.connection.execute(query).first.first :
      queryable.db.fetch(query).first.values.first
    username = "#{prefix}#{next_id}"
    raise "generate_username overflow: #{username}" if username.length > USERNAME_MAX_LENGTH
    username
  end

  def self.random_donor
    weight = SecureRandom.random_number
    PEGASUS_DB[:cdo_donors].all.find {|d| d[:weight_f] - weight >= 0}
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

  AGE_CUTOFFS = [18, 13, 8, 4].freeze

  # Return the highest age range for the given birthday, e.g.
  # 18+, 13+, 8+ or 4+
  def self.age_range_from_birthday(birthday)
    return "unknown" unless birthday
    age = age_from_birthday(birthday)
    age_cutoff = AGE_CUTOFFS.find {|cutoff| cutoff <= age}
    age_cutoff ? "#{age_cutoff}+" : nil
  end

  # Upcase and return the first non-whitespace character of the user's name.
  def self.initial(name)
    return nil if name.blank?
    return name.strip[0].upcase
  end
end
