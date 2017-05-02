# TODO: Change the APIs below to check logged in user instead of passing in a user id
class DashboardStudent
  # Returns all users who are followers of the user with ID user_id.
  def self.fetch_user_students(user_id)
    Dashboard.db[:sections].
      join(:followers, section_id: :sections__id).
      join(:users, id: :followers__student_user_id).
      where(sections__user_id: user_id, sections__deleted_at: nil).
      where(followers__deleted_at: nil).
      where(users__deleted_at: nil).
      select(*fields).
      all
  end

  def self.create(params)
    name = !params[:name].to_s.empty? ? params[:name].to_s : 'New Student'
    gender = valid_gender?(params[:gender]) ? params[:gender] : nil
    birthday = age_to_birthday(params[:age]) ?
      age_to_birthday(params[:age]) : params[:birthday]

    created_at = DateTime.now

    row = Dashboard.db[:users].insert(
      {
        name: name,
        user_type: 'student',
        provider: 'sponsored',
        gender: gender,
        birthday: birthday,
        created_at: created_at,
        updated_at: created_at,
        username: UserHelpers.generate_username(Dashboard.db[:users], name)
      }.merge(random_secrets)
    )
    return nil unless row

    row
  end

  # @param ids [Integer] the ID to fetch.
  # @param dashboard_user_id [Integer] the ID of the user doing the fetching.
  # @returns [Hash | nil] a hash (representing the requested user) or nil (if
  #   the requested user does not exist or is accessible by dashboard_user_id).
  def self.fetch_if_allowed(id, dashboard_user_id)
    user = Dashboard::User.get(dashboard_user_id)
    return unless user && (user.followed_by?(id) || user.admin?)

    row = Dashboard.db[:users].
      where(users__id: id, users__deleted_at: nil).
      left_outer_join(:secret_pictures, id: :secret_picture_id).
      select(*fields,
        :secret_pictures__name___secret_picture_name,
        :secret_pictures__path___secret_picture_path,
      ).
      server(:default).
      first

    return if row.nil?

    row.merge(age: birthday_to_age(row[:birthday]))
  end

  # @param ids [Array[Integer]] the IDs to fetch.
  # @param dashboard_user_id [Integer] the ID of the user doing the fetching.
  # @returns [Array[Hash | nil]] an array, one entry per requested ID, with each
  #   entry being a hash (representing the requested user) or nil (if the
  #   requested user does not exist or is accessible by dashboard_user_id).
  def self.fetch_if_allowed_array(ids, dashboard_user_id)
    user = Dashboard::User.get(dashboard_user_id)
    return ids.map {|_id| nil} unless user

    allowed_ids = user.admin? ? ids : user.get_followed_bys(ids)
    allowed_rows = Dashboard.db[:users].
      where(users__id: allowed_ids, users__deleted_at: nil).
      left_outer_join(:secret_pictures, id: :secret_picture_id).
      select(*fields,
        :secret_pictures__name___secret_picture_name,
        :secret_pictures__path___secret_picture_path
      )

    # Convert allowed_rows from an array of hashes (each representing a user)
    # to a hash of hashes (keys of user_id, values representing a user).
    allowed_rows = {}.tap do |allowed_rows_hash|
      allowed_rows.each do |allowed_row|
        allowed_rows_hash[allowed_row[:id]] = allowed_row
      end
    end

    # Add user age to the hash.
    ids.map do |id|
      if allowed_rows.key? id
        allowed_rows[id][:age] = birthday_to_age(allowed_rows[id][:birthday])
      end
    end

    # Return an array of hashes.
    allowed_rows.values
  end

  def self.update_if_allowed(params, dashboard_user_id)
    user_to_update = Dashboard.db[:users].where(id: params[:id], deleted_at: nil)
    return if user_to_update.empty?
    return if Dashboard.db[:sections].
      join(:followers, section_id: :sections__id).
      where(sections__user_id: dashboard_user_id, sections__deleted_at: nil).
      where(followers__student_user_id: params[:id], followers__deleted_at: nil).
      empty?

    fields = {updated_at: DateTime.now}
    fields[:name] = params[:name] unless params[:name].nil_or_empty?
    fields[:encrypted_password] = encrypt_password(params[:password]) unless params[:password].nil_or_empty?
    fields[:gender] = params[:gender] if valid_gender?(params[:gender])
    fields[:birthday] = age_to_birthday(params[:age]) if age_to_birthday(params[:age])
    # TODO: Only save birthday if age changed.
    fields.merge!(random_secrets) if params[:secrets].to_s == 'reset'

    rows_updated = user_to_update.update(fields)
    return nil unless rows_updated > 0

    fetch_if_allowed(params[:id], dashboard_user_id)
  end

  def self.birthday_to_age(birthday)
    return if birthday.nil?
    age = ((Date.today - birthday) / 365).to_i # TODO: Should this be 365.25?
    age = "21+" if age >= 21
    age
  end

  def self.fields
    [
      :users__id___id,
      :users__name___name,
      :users__username___username,
      :users__email___email,
      :users__hashed_email___hashed_email,
      :users__user_type___user_type,
      :users__gender___gender,
      :users__birthday___birthday,
      :users__prize_earned___prize_earned,
      :users__total_lines___total_lines,
      :users__secret_words___secret_words
    ]
  end

  def self.completed_levels(user_id)
    Dashboard.db[:user_levels].
      where(user_id: user_id).
      and("best_result >= #{ActivityConstants::MINIMUM_PASS_RESULT}")
  end

  VALID_GENDERS = %w(m f)
  def self.valid_gender?(gender)
    VALID_GENDERS.include?(gender)
  end

  def self.age_to_birthday(age)
    age = age.to_i
    return nil if age == 0
    Date.today - age * 365
  end

  def self.random_secrets
    {
      secret_picture_id: random_secret_picture_id,
      secret_words: random_secret_words
    }
  end

  def self.random_secret_picture_id
    SecureRandom.random_number(Dashboard.db[:secret_pictures].count) + 1
  end

  def self.random_secret_words
    "#{random_secret_word} #{random_secret_word}"
  end

  def self.random_secret_word
    random_id = SecureRandom.random_number(Dashboard.db[:secret_words].count) + 1
    Dashboard.db[:secret_words].first(id: random_id)[:word]
  end

  PEPPER = CDO.dashboard_devise_pepper
  STRETCHES = 10
  def self.encrypt_password(password)
    BCrypt::Password.create("#{password}#{PEPPER}", cost: STRETCHES).to_s
  end
end
