require 'cdo/user_helpers'
require 'cdo/script_constants'
require_relative '../helper_modules/dashboard'
require 'cdo/section_helpers'

# TODO: Change the APIs below to check logged in user instead of passing in a user id
# TODO(asher): Though the APIs below mostly respect soft-deletes, edge cases may
#   remain (e.g., if the user making the API call is soft-deleted). Fix these
#   and make the API more consistent in its edge case handling.
class DashboardStudent

  # Returns all users who are followers of the user with ID user_id.
  def self.fetch_user_students(user_id)
    Dashboard.db[:users].
      join(:followers, :student_user_id => :users__id).
      join(Sequel.as(:users, :users_students), :id => :followers__student_user_id).
      where(followers__user_id: user_id, followers__deleted_at: nil).
      where(users_students__deleted_at: nil).
      select(*fields).
      all
  end

  def self.create(params)
    name = !params[:name].to_s.empty? ? params[:name].to_s : 'New Student'
    gender = valid_gender?(params[:gender]) ? params[:gender] : nil
    birthday = age_to_birthday(params[:age]) ?
      age_to_birthday(params[:age]) : params[:birthday]

    created_at = DateTime.now

    row = Dashboard.db[:users].insert({
      name: name,
      user_type: 'student',
      provider: 'sponsored',
      gender: gender,
      birthday: birthday,
      created_at: created_at,
      updated_at: created_at,
      username: UserHelpers.generate_username(Dashboard.db[:users], name)
    }.merge(random_secrets))
    return nil unless row

    row
  end

  def self.fetch_if_allowed(id_or_ids, dashboard_user_id)
    if id_or_ids.is_a?(Array)
      # TODO: This should actually send a where id in (,,,) type query.
      return id_or_ids.map {|id| fetch_if_allowed(id, dashboard_user_id)}
    end

    id = id_or_ids

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

    if row.nil?
      return
    end

    row.merge(age: birthday_to_age(row[:birthday]))
  end

  def self.update_if_allowed(params, dashboard_user_id)
    user_to_update = Dashboard.db[:users].
      where(id: params[:id], deleted_at: nil)
    return if user_to_update.empty?
    return if Dashboard.db[:followers].
      where(student_user_id: params[:id], user_id: dashboard_user_id).
      where(deleted_at: nil).
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

class DashboardSection

  def initialize(row)
    @row = row
  end

  def self.valid_login_types
    %w(word picture email)
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

  @@course_cache = {}
  def self.valid_courses(user_id = nil)
    # some users can see all courses, even those marked hidden
    course_cache_key = (user_id && Dashboard.hidden_script_access?(user_id)) ? "all" : "valid"

    # only do this query once because in prod we only change courses
    # when deploying (technically this isn't true since we are in
    # pegasus and courses are owned by dashboard...)
    return @@course_cache[course_cache_key] if @@course_cache.key?(course_cache_key)

    # don't crash when loading environment before database has been created
    return {} unless (Dashboard.db[:scripts].count rescue nil)

    where_clause = Dashboard.hidden_script_access?(user_id) ? "" : "hidden = 0"

    # Cache the courses names in English for all users. After the
    # facilitator summit (2016-5-23) we should change the cache to be
    # per-language.
    course_locale = 'en-US'

    # cache result if we have to actually run the query
    @@course_cache[course_cache_key] =
      Dashboard.db[:scripts].
        where(where_clause).
        select(:id, :name, :hidden).
        all.
        map do |course|
          name = ScriptConstants.teacher_dashboard_name(course[:name])
          first_category = ScriptConstants.categories(course[:name])[0] || 'other'
          position = ScriptConstants.position_in_category(name, first_category)
          name = I18n.t("#{name}_name", default: name, locale: course_locale)
          name += " *" if course[:hidden]
          {
            id: course[:id],
            name: name,
            category: I18n.t("#{first_category}_category_name", default: first_category, locale: course_locale),
            position: position
          }
        end
  end

  def self.valid_course_id?(course_id)
    valid_courses.find{|course| course[:id] == course_id.to_i}
  end

  def self.create(params)
    return nil unless params[:user] && params[:user][:user_type] == 'teacher'

    name = !params[:name].to_s.empty? ? params[:name].to_s : 'New Section'
    login_type =
      params[:login_type].to_s == 'none' ? 'email' : params[:login_type].to_s
    login_type = 'word' unless valid_login_type?(login_type)
    grade = valid_grade?(params[:grade].to_s) ? params[:grade].to_s : nil
    script_id = params[:course] && valid_course_id?(params[:course][:id]) ?
      params[:course][:id].to_i : params[:script_id]
    created_at = DateTime.now

    row = nil
    tries = 0
    begin
      row = Dashboard.db[:sections].insert({
        user_id: params[:user][:id],
        name: name,
        login_type: login_type,
        grade: grade,
        script_id: script_id,
        code: SectionHelpers.random_code,
        created_at: created_at,
        updated_at: created_at,
      })
    rescue Sequel::UniqueConstraintViolation
      tries += 1
      retry if tries < 2
      raise
    end

    if params[:course] && valid_course_id?(params[:course][:id])
      DashboardUserScript.assign_script_to_user(params[:course][:id].to_i, params[:user][:id])
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
      join(:users, :id => :user_id).
      where(sections__id: id, sections__deleted_at: nil).
      select(*fields).
      first

    section = self.new(row)
    return section if section.member?(user_id) || Dashboard.admin?(user_id)
    nil
  end

  def self.fetch_if_teacher(id, user_id)
    return nil unless row = Dashboard.db[:sections].
      join(:users, :id => :user_id).
      select(*fields).
      where(sections__id: id, sections__deleted_at: nil).
      first

    section = self.new(row)
    return section if section.teacher?(user_id) || Dashboard.admin?(user_id)
    nil
  end

  def self.fetch_user_sections(user_id)
    return if user_id.nil?

    Dashboard.db[:sections].
      join(:users, :id => :user_id).
      select(*fields).
      where(sections__user_id: user_id, sections__deleted_at: nil).
      map{|row| self.new(row).to_owner_hash}
  end

  def self.fetch_student_sections(student_id)
    return if student_id.nil?

    Dashboard.db[:sections].
      select(*fields).
      join(:followers, :section_id => :id).
      join(:users, :id => :student_user_id).
      where(student_user_id: student_id).
      where(sections__deleted_at: nil, followers__deleted_at: nil).
      map{|row| self.new(row).to_member_hash}
  end

  def add_student(student)
    return nil unless student_id = student[:id] || DashboardStudent.create(student)

    created_at = DateTime.now
    Dashboard.db[:followers].insert({
      user_id: @row[:teacher_id],
      student_user_id: student_id,
      section_id: @row[:id],
      created_at: created_at,
      updated_at: created_at,
    })
    student_id
  end

  def add_students(students)
    student_ids = students.map{|i| add_student(i)}.compact
    DashboardUserScript.assign_script_to_users(@row[:script_id], student_ids) if @row[:script_id] && !student_ids.blank?
    return student_ids
  end

  def remove_student(student_id)
    # BUGBUG: Need to detect "sponsored" accounts and disallow delete.

    rows_deleted = Dashboard.db[:followers].where(section_id: @row[:id], student_user_id: student_id).delete
    rows_deleted > 0
  end

  def member?(user_id)
    return teacher?(user_id) || student?(user_id)
  end

  def student?(user_id)
    !!students.index{|i| i[:id] == user_id}
  end

  def students
    @students ||= Dashboard.db[:followers].
      join(:users, id: :student_user_id).
      left_outer_join(:secret_pictures, id: :secret_picture_id).
      select(Sequel.as(:student_user_id, :id),
        *DashboardStudent.fields,
        :secret_pictures__name___secret_picture_name,
        :secret_pictures__path___secret_picture_path).
      distinct(:student_user_id).
      where(section_id: @row[:id]).
      where(users__deleted_at: nil).
      map do |row|
        row.merge({
          location: "/v2/users/#{row[:id]}",
          age: DashboardStudent.birthday_to_age(row[:birthday]),
          completed_levels_count: DashboardStudent.completed_levels(row[:id]).count
        })
      end
  end

  def teacher?(user_id)
    !!teachers.index{|i| i[:id] == user_id}
  end

  def teachers
    @teachers ||= [{
      id: @row[:teacher_id],
      location: "/v2/users/#{@row[:teacher_id]}",
                   }]
  end

  def course
    @course ||= Dashboard.db[:scripts].
      where(id: @row[:script_id]).
      select(:id, :name).
      first
  end

  def to_owner_hash
    to_member_hash.merge(
      course: course,
      teachers: teachers,
      students: students
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

    if params[:course] && valid_course_id?(params[:course][:id])
      fields[:script_id] = params[:course][:id].to_i
      DashboardUserScript.assign_script_to_section(fields[:script_id], section_id)
      DashboardUserScript.assign_script_to_user(fields[:script_id], user_id)
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
      :sections__login_type___login_type,
      :sections__grade___grade,
      :sections__script_id___script_id,
      :sections__user_id___teacher_id
    ]
  end

end

class DashboardUserScript
  def self.assign_script_to_section(script_id, section_id)
    # create userscripts for users that don't have one yet
    Dashboard.db[:user_scripts].
      insert_ignore.
      import(
        [:user_id, :script_id],
        Dashboard.db[:followers].
          select(:student_user_id, script_id.to_s).
          where(section_id: section_id, deleted_at: nil)
      )
  end

  def self.assign_script_to_user(script_id, user_id)
    # creates a userscript for a user if they don't have it yet
    Dashboard.db[:user_scripts].
      insert_ignore.
      import(
        [:user_id, :script_id],
        Dashboard.db[:users].
          select(user_id, script_id.to_s).
          where(id: user_id, deleted_at: nil)
      )
  end

  def self.assign_script_to_users(script_id, user_ids)
    return if user_ids.empty?
    # create userscripts for users that don't have one yet
    Dashboard.db[:user_scripts].
      insert_ignore.
      import(
        [:user_id, :script_id],
        user_ids.zip([script_id] * user_ids.count)
      )
  end
end
