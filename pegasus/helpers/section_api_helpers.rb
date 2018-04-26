require 'cdo/activity_constants'
require 'cdo/script_constants'
require 'cdo/user_helpers'
require_relative '../helper_modules/dashboard'
require 'cdo/code_generation'
require 'cdo/shared_constants'

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
    sharing_disabled = !!params[:sharing_disabled]
    created_at = DateTime.now

    row = Dashboard.db[:users].insert(
      {
        name: name,
        user_type: 'student',
        provider: 'sponsored',
        gender: gender,
        properties: {sharing_disabled: sharing_disabled}.to_json,
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
        :secret_pictures__path___secret_picture_path,
        :properties___properties,
      )

    # Convert allowed_rows from an array of hashes (each representing a user)
    # to a hash of hashes (keys of user_id, values representing a user).
    allowed_rows = {}.tap do |allowed_rows_hash|
      allowed_rows.each do |allowed_row|
        allowed_rows_hash[allowed_row[:id]] = allowed_row
      end
    end

    # Add user age and sharing_disabled to the hash.
    ids.map do |id|
      next unless allowed_rows.key? id
      allowed_rows[id][:age] = birthday_to_age(allowed_rows[id][:birthday])
      allowed_rows[id][:sharing_disabled] = JSON.parse(allowed_rows[id][:properties])["sharing_disabled"]
      allowed_rows[id].delete(:properties)
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
      :users__total_lines___total_lines,
      :users__secret_words___secret_words
    ]
  end

  def self.completed_levels(user_id)
    Dashboard.db[:user_levels].
      where(user_id: user_id).
      and("best_result >= #{ActivityConstants::MINIMUM_PASS_RESULT}")
  end

  VALID_GENDERS = %w(m f).freeze
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

class DashboardCourseExperiments
  # Fetches a list of all experiments pertaining to courses and caches the
  # result.
  # @return [Array[String] An array of experiment names.
  @@course_experiments = nil
  def self.course_experiments
    @@course_experiments ||= Dashboard.db[:course_scripts].
      exclude(experiment_name: nil).
      all.
      map {|cs| cs[:experiment_name]}
  end

  # Fetches course experiment data from the dashboard DB and returns
  # a map such that map[user_id][experiment_name] is true if the user
  # belongs to the specified experiment. Caches the map so that the
  # database fetch is only done once per frontend.
  # @return [Hash[Hash[Boolean]]] A 2-dimensional map from user id and
  # experiment name to boolean.
  @@course_experiment_map = nil
  @@course_experiment_map_last_update = 0
  MAX_COURSE_EXPERIMENT_CACHE_SEC = 60
  def self.course_experiment_map
    @@course_experiment_map = nil if Time.now > @@course_experiment_map_last_update + MAX_COURSE_EXPERIMENT_CACHE_SEC
    @@course_experiment_map ||= {}.tap do |map|
      @@course_experiment_map_last_update = Time.now
      Dashboard.db[:experiments].
        where(name: course_experiments, type: 'SingleUserExperiment').
        all.
        each do |row|
        user_id = row[:min_user_id]
        map[user_id] ||= {}
        map[user_id][row[:name]] = true
      end
    end
  end

  def self.has_experiment?(user_id, experiment_name)
    raise "experiment_name is required" unless experiment_name && !experiment_name.empty?
    !!course_experiment_map[user_id] && course_experiment_map[user_id][experiment_name]
  end

  def self.has_any_experiment?(user_id)
    !!course_experiment_map[user_id]
  end

  def self.clear_caches
    @@course_experiments = nil
    @@course_experiment_map = nil
  end
end

class DashboardSection
  def initialize(row)
    @row = row
  end

  def self.valid_login_types
    SharedConstants::SECTION_LOGIN_TYPE.to_h.values
  end

  def self.valid_login_type?(login_type)
    valid_login_types.include? login_type
  end

  def self.valid_grades
    @@valid_grades ||= ['K'] + (1..12).collect(&:to_s) + ['Other']
  end

  def self.valid_grade?(grade)
    valid_grades.include? grade
  end

  # Method used by tests to clear our caches, so that we're not sharing caches
  # across tests
  def self.clear_caches
    @@script_cache = {}
    @@course_cache = {}
    @@alternate_course_scripts = nil
    DashboardCourseExperiments.clear_caches
  end

  # @typedef AssignableInfo Hash
  # @option [Number] :id
  # @option [String] :name,
  # TODO: This is really course_or_script_name (or perhaps something like resource_name),
  # but is currently used in a bunch of places in the client, so I don't want
  # to change it just yet
  # @option [String] :script_name
  # @option [String] :category
  # @option [Number] :position
  # @option [Number] :category_priority

  # Get the info for our script/course, and translate strings if needed.
  # @param course_or_script [Course|Script] A row object from either our courses
  #   or scripts dashboard db tables.
  # @param hidden [Boolean] True if the passed in item is hidden
  # @return AssignableInfo
  def self.assignable_info(course_or_script, hidden=false)
    info = ScriptConstants.assignable_info(course_or_script)
    info[:name] = I18n.t("#{info[:name]}_name", default: info[:name])
    info[:name] += " *" if hidden

    info[:category] = I18n.t("#{info[:category]}_category_name", default: info[:category])

    info
  end

  @@script_cache = {}
  # Find the set of scripts that are valid for the current user, ignoring those
  # scripts that are hidden based on the user's permission. Caches results based
  # on language and whether hidden scripts are included.
  # @param user_id [Integer]
  # @return AssignableInfo[]
  def self.valid_scripts(user_id = nil, force_show_hidden = false)
    has_any_experiment = DashboardCourseExperiments.has_any_experiment?(user_id)
    # Users with course experiments enabled effectively lose their hidden
    # script access permissions to avoid unnecessary complexity.
    with_hidden =
      (!has_any_experiment && user_id && Dashboard.hidden_script_access?(user_id)) ||
      force_show_hidden
    scripts = valid_default_scripts(user_id, with_hidden)
    return scripts unless has_any_experiment
    scripts.map {|script| alternate_script_info(user_id, script)}
  end

  def self.valid_default_scripts(user_id, with_hidden)
    # some users can see all scripts, even those marked hidden
    script_cache_key = I18n.locale.to_s + (with_hidden ? "-all" : "-valid")

    # only do this query once because in prod we only change scripts
    # when deploying (technically this isn't true since we are in
    # pegasus and scripts are owned by dashboard...)
    if @@script_cache.key?(script_cache_key) && !rack_env?(:levelbuilder)
      return @@script_cache[script_cache_key]
    end

    # don't crash when loading environment before database has been created
    return {} unless (Dashboard.db[:scripts].count rescue nil)

    where_clause = with_hidden ? "" : "hidden = 0"

    # cache result if we have to actually run the query
    scripts =
      Dashboard.db[:scripts].
        where(where_clause).
        select(:id, :name, :hidden).
        all.
        map {|script| assignable_info(script, script[:hidden])}
    @@script_cache[script_cache_key] = scripts unless rack_env?(:levelbuilder)
    scripts
  end

  def self.alternate_script_info(user_id, script)
    alternate_course_script = alternate_course_scripts.find do |cs|
      cs[:default_script_id] == script[:id] &&
        DashboardCourseExperiments.has_experiment?(user_id, cs[:experiment_name])
    end
    if alternate_course_script
      alternate_script = Dashboard.db[:scripts].first(id: alternate_course_script[:script_id])
      # create a defensive copy so that we don't change what's in the cache
      return script.merge(
        id: alternate_script[:id],
        name: I18n.t("#{alternate_script[:name]}_name", default: alternate_script[:name]),
        script_name: alternate_script[:name]
      )
    end
    script
  end

  # Caches and returns the course script rows which have experiments enabled.
  # Array[row]] Array of rows from the course_scripts table.
  @@alternate_course_scripts = nil
  def self.alternate_course_scripts
    @@alternate_course_scripts ||= Dashboard.db[:course_scripts].
      exclude(experiment_name: nil).
      all
  end

  @@course_cache = {}
  # Mimic the behavior of valid_scripts, but return courses instead. Also simpler
  # in that we don't have to worry about hidden courses.
  # This is now only used to check to see if we have a valid_course_id when assigning
  # a course to a section. This code could be simplified, as all we really want
  # now is a list of course_ids. However, because we'd ultimately like this to
  # all live in dashboard, I'm leaving this in its unsimplified form for now.
  # @return AssignableInfo[]
  def self.valid_courses
    course_cache_key = I18n.locale.to_s

    if @@course_cache.key?(course_cache_key) && !rack_env?(:levelbuilder)
      return @@course_cache[course_cache_key]
    end

    return {} unless (Dashboard.db[:courses].count rescue nil)

    courses = Dashboard.db[:courses].
      select(:id, :name).
      all.
      # Only return courses we've whitelisted in ScriptConstants
      select {|course| ScriptConstants.script_in_category?(:full_course, course[:name])}.
      map {|course| assignable_info(course)}
    @@course_cache[course_cache_key] = courses unless rack_env?(:levelbuilder)
    courses
  end

  # Gets a list of valid scripts in which progress tracking has been disabled via
  # the gatekeeper key postMilestone.
  def self.progress_disabled_scripts(user_id = nil)
    disabled_scripts = valid_scripts(user_id).select do |script|
      !Gatekeeper.allows('postMilestone', where: {script_name: script[:script_name]}, default: true)
    end
    disabled_scripts.map {|script| script[:id]}
  end

  # @param script_id [String] id of the script we're checking the validity of
  # @param user_id [Integer] id of the user we are checking for, in case they
  #   are in any course experiments, which would give them different valid scripts
  # @return [Boolean] Whether or not script_id is a valid script ID.
  def self.valid_script_id?(script_id, user_id = nil)
    valid_scripts(user_id).any? {|script| script[:id] == script_id.to_i}
  end

  # @param script_id [String] id of the course we're checking the validity of
  # @return [Boolean] Wheter or not the course_id is a valid course ID.
  def self.valid_course_id?(course_id)
    valid_courses.any? {|course| course[:id] == course_id.to_i}
  end

  def self.create(params)
    return nil unless params[:user] && params[:user][:user_type] == 'teacher'

    name = !params[:name].to_s.empty? ? params[:name].to_s : 'New Section'
    login_type =
      params[:login_type].to_s == 'none' ? 'email' : params[:login_type].to_s
    login_type = 'word' unless valid_login_type?(login_type)
    grade = valid_grade?(params[:grade].to_s) ? params[:grade].to_s : nil
    script_id = params[:script] && valid_script_id?(params[:script][:id], params[:user][:id]) ?
      params[:script][:id].to_i : params[:script_id]
    course_id = params[:course_id] && valid_course_id?(params[:course_id]) ?
      params[:course_id].to_i : nil
    stage_extras = params[:stage_extras] ? params[:stage_extras] : false
    pairing_allowed = params[:pairing_allowed].nil? ? true : params[:pairing_allowed]
    created_at = DateTime.now

    row = nil
    tries = 0
    begin
      row = Dashboard.db[:sections].insert(
        {
          user_id: params[:user][:id],
          name: name,
          login_type: login_type,
          grade: grade,
          script_id: script_id,
          course_id: course_id,
          code: CodeGeneration.random_unique_code(length: 6),
          stage_extras: stage_extras,
          pairing_allowed: pairing_allowed,
          hidden: false,
          created_at: created_at,
          updated_at: created_at,
        }
      )
    rescue Sequel::UniqueConstraintViolation
      tries += 1
      retry if tries < 3
      raise
    end

    if params[:script] && valid_script_id?(params[:script][:id], params[:user][:id])
      DashboardUserScript.assign_script_to_user(params[:script][:id].to_i, params[:user][:id])
    end

    row
  end

  # Soft deletes both the section with ID `id` and all associated followers
  # relationships.
  def self.delete_if_owner(id, user_id)
    row = Dashboard.db[:sections].
      where(id: id, user_id: user_id, deleted_at: nil).
      first
    return nil unless row

    time_now = Time.now

    Dashboard.db.transaction do
      Dashboard.db[:followers].where(section_id: id, deleted_at: nil).
        update(deleted_at: time_now)
      Dashboard.db[:sections].where(id: id).update(deleted_at: time_now)
    end

    row
  end

  def self.fetch_if_allowed(id, user_id)
    # TODO: Allow caller to specify fields that they want because the
    # joins are getting a bit out of control (eg. you don't want to
    # get all the students passwords when we get the list of sections).

    return nil unless row = Dashboard.db[:sections].
      join(:users, id: :user_id).
      where(sections__id: id, sections__deleted_at: nil).
      select(*fields).
      first

    section = new(row)
    return section if section.member?(user_id) || Dashboard.admin?(user_id)
    nil
  end

  def self.fetch_if_teacher(id, user_id)
    return nil unless row = Dashboard.db[:sections].
      select(*fields).
      where(sections__id: id, sections__user_id: user_id, sections__deleted_at: nil).
      first
    section = new(row)
    return section
  end

  def self.fetch_user_sections(user_id)
    return if user_id.nil?

    Dashboard.db[:sections].
      join(:users, id: :user_id).
      select(*fields).
      where(sections__user_id: user_id, sections__deleted_at: nil).
      map {|row| new(row).to_owner_hash}
  end

  def self.fetch_student_sections(student_id)
    return if student_id.nil?

    Dashboard.db[:sections].
      select(*fields).
      join(:followers, section_id: :id).
      join(:users, id: :student_user_id).
      where(student_user_id: student_id).
      where(sections__deleted_at: nil, followers__deleted_at: nil).
      map {|row| new(row).to_member_hash}
  end

  def add_student(student)
    student_id = student[:id] || DashboardStudent.create(student)
    return nil unless student_id
    return nil if student[:admin]

    time_now = DateTime.now

    existing_follower = Dashboard.db[:followers].where(section_id: @row[:id], student_user_id: student_id).first
    if existing_follower
      Dashboard.db[:followers].where(id: existing_follower[:id]).update(deleted_at: nil, updated_at: time_now)
      return student_id
    end

    Dashboard.db[:followers].insert(
      {
        section_id: @row[:id],
        student_user_id: student_id,
        created_at: time_now,
        updated_at: time_now
      }
    )
    student_id
  end

  def add_students(students)
    student_ids = students.map {|i| add_student(i)}.compact
    DashboardUserScript.assign_script_to_users(@row[:script_id], student_ids) if @row[:script_id] && !student_ids.blank?
    return student_ids
  end

  # @param student_id [Integer] The user ID of the student to unenroll.
  # @return [Boolean] Whether the student's enrollment was removed.
  def remove_student(student_id)
    # BUGBUG: Need to detect "sponsored" accounts and disallow delete.

    rows_deleted = Dashboard.db[:followers].
      where(section_id: @row[:id], student_user_id: student_id, deleted_at: nil).
      update(deleted_at: DateTime.now)
    rows_deleted > 0
  end

  def member?(user_id)
    return teacher?(user_id) || student?(user_id)
  end

  def student?(user_id)
    !!students.index {|i| i[:id] == user_id}
  end

  def students
    return @students if @students

    @students ||= Dashboard.db[:followers].
      join(:users, id: :student_user_id).
      left_outer_join(:secret_pictures, id: :secret_picture_id).
      select(
        Sequel.as(:student_user_id, :id),
        *DashboardStudent.fields,
        :secret_pictures__name___secret_picture_name,
        :secret_pictures__path___secret_picture_path
      ).
      group_by(:student_user_id).
      where(section_id: @row[:id]).
      where(users__deleted_at: nil).
      where(followers__deleted_at: nil).
      map do |row|
        row.merge(
          {
            location: "/v2/users/#{row[:id]}",
            age: DashboardStudent.birthday_to_age(row[:birthday]),
          }
        )
      end
    # Though it would be simpler to query the level counts for each student via
    # DashboardStudent#completed_levels and inject them to @students via the row.merge above,
    # querying all students together (as below) is significantly more performant.
    student_ids = @students.map {|s| s[:id]}
    level_counts = Dashboard.db[:user_levels].
      group_and_count(:user_id).
      where(user_id: student_ids).
      where("best_result >= #{ActivityConstants::MINIMUM_PASS_RESULT}").
      all
    @students.each do |datum|
      level_count = level_counts.find {|x| x[:user_id] == datum[:id]}
      datum[:completed_levels_count] = level_count ? level_count[:count] : 0
    end

    @students
  end

  def teacher?(user_id)
    !!teachers.index {|i| i[:id] == user_id}
  end

  def teachers
    @teachers ||= [{
      id: @row[:teacher_id],
      location: "/v2/users/#{@row[:teacher_id]}",
    }]
  end

  def script
    @script ||= Dashboard.db[:scripts].
      where(id: @row[:script_id]).
      select(:id, :name).
      first
  end

  def to_owner_hash
    course_name = @row[:course_id] ? Dashboard.db[:courses].where(id: @row[:course_id]).select(:name).first[:name] : ''
    to_member_hash.merge(
      script: script,
      course_id: @row[:course_id],
      course_name: course_name,
      teachers: teachers,
      students: students,
      studentCount: students.count,
    )
  end

  def to_member_hash
    {
      id: @row[:id],
      location: "/v2/sections/#{@row[:id]}",
      name: @row[:name],
      login_type: @row[:login_type],
      grade: @row[:grade],
      code: @row[:code],
      stage_extras: @row[:stage_extras],
      pairing_allowed: @row[:pairing_allowed],
      hidden: @row[:hidden],
    }
  end

  def self.update_if_owner(params)
    section_id = params[:id]
    return nil unless params[:user] && params[:user][:user_type] == 'teacher'
    user_id = params[:user][:id]

    fields = {updated_at: DateTime.now}
    fields[:name] = params[:name] unless params[:name].nil_or_empty?
    fields[:login_type] = params[:login_type] if valid_login_type?(params[:login_type])
    fields[:grade] = params[:grade] if valid_grade?(params[:grade])
    fields[:stage_extras] = params[:stage_extras]
    fields[:pairing_allowed] = params[:pairing_allowed]
    fields[:hidden] = params[:hidden] unless params[:hidden].nil?

    if params[:course_id] && valid_course_id?(params[:course_id])
      fields[:course_id] = params[:course_id].to_i
      # explicitly clear script_id (unless we're also passed in a valid script id
      # as a param
      fields[:script_id] = nil
    else
      # If no valid course_id provided, make sure we clear any existing course_id
      fields[:course_id] = nil
    end

    if params[:script] && valid_script_id?(params[:script][:id], user_id)
      fields[:script_id] = params[:script][:id].to_i
      DashboardUserScript.assign_script_to_section(fields[:script_id], section_id)
      DashboardUserScript.assign_script_to_user(fields[:script_id], user_id)
    elsif !params[:course_id] && !params[:script_id]
      # If a null course (no choice or decide later) is chosen, then update the course and script to be nil
      fields[:course_id] = nil
      fields[:script_id] = nil
    end

    rows_updated = Dashboard.db[:sections].
      where(id: section_id, user_id: user_id, deleted_at: nil).
      update(fields)
    return nil unless rows_updated > 0

    fetch_if_allowed(section_id, user_id)
  end

  def self.fields
    [
      :sections__id___id,
      :sections__name___name,
      :sections__code___code,
      :sections__stage_extras___stage_extras,
      :sections__pairing_allowed___pairing_allowed,
      :sections__login_type___login_type,
      :sections__sharing_disabled___sharing_disabled,
      :sections__hidden___hidden,
      :sections__grade___grade,
      :sections__script_id___script_id,
      :sections__course_id___course_id,
      :sections__user_id___teacher_id
    ]
  end
end

class DashboardUserScript
  # Assigns a script to all users enrolled in the section, creating a new user_scripts object if
  # necessary. The method noops for those user_scripts that already exist with assigned_at set.
  # WARNING: This method does not verify that the section and student_users exist (aren't deleted).
  def self.assign_script_to_section(script_id, section_id)
    student_user_ids = Dashboard.db[:followers].
      select(:student_user_id).
      where(section_id: section_id, deleted_at: nil).
      map {|f| f[:student_user_id]}
    DashboardUserScript.assign_script_to_users(script_id, student_user_ids)
  end

  # Assigns a script to the user via user_scripts, creating a new user_scripts object if necessary.
  # The method noops if a user_scripts already exists with assigned_at set.
  # @param script_id [Integer] The dashboard ID of the script.
  # @param user_id [Integer] The dashboard ID of the user.
  def self.assign_script_to_user(script_id, user_id)
    time_now = Time.now
    existing = Dashboard.db[:user_scripts].where(user_id: user_id, script_id: script_id).first
    if existing
      return if existing[:assigned_at]
      Dashboard.db[:user_scripts].where(user_id: user_id, script_id: script_id).update(
        updated_at: time_now,
        assigned_at: time_now
      )
    else
      Dashboard.db[:user_scripts].insert(
        user_id: user_id,
        script_id: script_id,
        created_at: time_now,
        updated_at: time_now,
        assigned_at: time_now
      )
    end
  end

  # Assigns a script to a set of users via user_scripts, creating new user_scripts objects if
  # necessary. The method noops for those user_scripts that already exist with assigned_at set.
  # WARNING: This method does not verify that the users exist (aren't deleted).
  def self.assign_script_to_users(script_id, user_ids)
    # NOTE: This method could be more simply written by iterating over user_ids, calling
    # DashboardUserScript#assign_script_to_user for each. This (more complex) approach is used for
    # its better DB performance.
    return if user_ids.empty?

    time_now = Time.now
    all_existing = Dashboard.db[:user_scripts].where(user_id: user_ids, script_id: script_id)
    all_existing_user_ids = all_existing.map {|user_script| user_script[:user_id]}

    missing_assigned_at = []
    all_existing.each do |existing|
      missing_assigned_at << existing[:id] unless existing[:assigned_at]
    end
    Dashboard.db[:user_scripts].where(id: missing_assigned_at).update(
      updated_at: time_now,
      assigned_at: time_now
    )
    missing_user_scripts = user_ids.select {|user_id| !all_existing_user_ids.include? user_id}
    return if missing_user_scripts.empty?
    Dashboard.db[:user_scripts].
      import(
        [:user_id, :script_id, :created_at, :updated_at, :assigned_at],
        missing_user_scripts.zip(
          [script_id] * missing_user_scripts.count,
          [time_now] * missing_user_scripts.count,
          [time_now] * missing_user_scripts.count,
          [time_now] * missing_user_scripts.count
        )
      )
  end
end
