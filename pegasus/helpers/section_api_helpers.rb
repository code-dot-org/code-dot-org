class DashboardStudent
  def self.fetch_user_students(user_id)
    DASHBOARD_DB[:users].
      join(:followers, :student_user_id=>:users__id).
      select(*fields).
      where(followers__user_id:user_id).
      all
  end

  def self.create(params)
    name = params[:name].to_s
    name = 'New Student' if name.empty?

    params[:gender] = nil unless valid_gender?(params[:gender])
    params[:birthday] = age_to_birthday(params[:age]) if age_to_birthday(params[:age])

    created_at = DateTime.now

    row = DASHBOARD_DB[:users].insert({
      name:name,
      user_type:'student',
      provider:'sponsored',
      gender:params[:gender],
      birthday:params[:birthday],
      created_at:created_at,
      updated_at:created_at,
    }.merge(random_secrets))
    return nil unless row

    row
  end

  def self.fetch_if_allowed(id_or_ids, dashboard_user_id)
    if id_or_ids.kind_of?(Array)
      # TODO this should actually send a where id in (,,,) type query
      return id_or_ids.map {|id| fetch_if_allowed(id, dashboard_user_id)}
    end

    id = id_or_ids

    return unless DASHBOARD_DB[:followers].
      where(student_user_id: id,
            user_id: dashboard_user_id)

    row = DASHBOARD_DB[:users].
      left_outer_join(:secret_pictures, id: :secret_picture_id).
      left_outer_join(Sequel.as(:secret_words, :secret_words_1), id: :users__secret_word_1_id).
      left_outer_join(Sequel.as(:secret_words, :secret_words_2), id: :users__secret_word_2_id).
      select(*fields,
             :secret_pictures__name___secret_picture_name,
             :secret_pictures__path___secret_picture_path,
             :secret_words_1__word___secret_word_1,
             :secret_words_2__word___secret_word_2
            ).
      where(users__id:id).
      first

    row.merge(age: birthday_to_age(row[:birthday]))
  end

  def self.update_if_allowed(params, dashboard_user_id)
    return unless DASHBOARD_DB[:followers].
      where(student_user_id: params[:id],
            user_id: dashboard_user_id)

    fields = {updated_at:DateTime.now}
    fields[:name] = params[:name] unless params[:name].nil_or_empty?
    fields[:encrypted_password] = encrypt_password(params[:password]) unless params[:password].nil_or_empty?
    fields[:gender] = params[:gender] if valid_gender?(params[:gender])
    fields[:birthday] = age_to_birthday(params[:age]) if age_to_birthday(params[:age])
    # TODO only save birthday if age changed
    fields.merge!(random_secrets) if params[:secrets].to_s == 'reset'

    rows_updated = DASHBOARD_DB[:users].
      where(id:params[:id]).
      update(fields)
    return nil unless rows_updated > 0

    fetch_if_allowed(params[:id], dashboard_user_id)
  end

  def self.birthday_to_age(birthday)
    return if birthday.nil?
    ((Date.today - birthday) / 365).to_i # TODO should this be 365.25
  end

  def self.fields()
    [
      :users__id___id,
      :users__name___name,
      :users__username___username,
      :users__email___email,
      :users__hashed_email___hashed_email,
      :users__gender___gender,
      :users__birthday___birthday,
      :users__prize_earned___prize_earned
    ]
  end

  private

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
     secret_word_1_id: random_secret_word_id,
     secret_word_2_id: random_secret_word_id
    }
  end

  def self.random_secret_picture_id
    SecureRandom.random_number(DASHBOARD_DB[:secret_pictures].count) + 1
  end

  def self.random_secret_word_id
    SecureRandom.random_number(DASHBOARD_DB[:secret_words].count) + 1
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

  VALID_LOGIN_TYPES = %w(word picture none)

  def self.valid_login_type?(login_type)
    VALID_LOGIN_TYPES.include? login_type
  end

  VALID_GRADES = ['K'] + (1..12).collect(&:to_s) + ['Other']

  def self.valid_grade?(grade)
    VALID_GRADES.include? grade
  end

  def self.load_valid_courses
    Hash[
         DASHBOARD_DB[:scripts].
           where("hidden = 0 or name like 'course%'").
           select(:id, :name).
           all.
           map { |c| [c[:id], c[:name]]}
        ]
  end
  VALID_COURSES = load_valid_courses
  # only do this query once because in prod we only change courses
  # when deploying (technically this isn't true since we are in
  # pegasus and courses are owned by dashboard...)

  def self.valid_course_id?(course_id)
    VALID_COURSES[course_id.to_i]
  end

  def self.random_letter
    (SecureRandom.random_number(26) + 10).to_s(36).upcase
  end

  def self.random_code
    6.times.map{random_letter}.join('')
  end

  def self.create(params)
    return nil unless params[:user] && params[:user][:user_type] == 'teacher'

    name = params[:name].to_s
    name = 'New Section' if name.empty?

    params[:login_type] = 'none' unless valid_login_type?(params[:login_type].to_s)

    params[:grade] = nil unless valid_grade?(params[:grade].to_s)

    if params[:course] && valid_course_id?(params[:course][:id])
      params[:script_id] = params[:course][:id].to_i
    end

    created_at = DateTime.now

    row = nil
    tries = 0
    begin
      row = DASHBOARD_DB[:sections].insert({
        user_id:params[:user][:id],
        name:name,
        login_type:params[:login_type],
        grade:params[:grade],
        script_id:params[:script_id],
        code:random_code,
        created_at:created_at,
        updated_at:created_at,
      })
    rescue Sequel::UniqueConstraintViolation
      tries += 1
      retry if tries < 2
      raise
    end

    row
  end

  def self.delete_if_owner(id, user_id)
    row = DASHBOARD_DB[:sections].where(id:id).and(user_id:user_id).first
    return nil unless row

    # BUGBUG: Need to detect "sponsored" accounts and disallow delete.

    DASHBOARD_DB.transaction do
      DASHBOARD_DB[:followers].where(section_id:id).delete
      DASHBOARD_DB[:sections].where(id:id).delete
    end

    row
  end

  def self.fetch_if_allowed(id, user_id)
    # TODO allow caller to specify fields that they want because the
    # recursion is getting a bit out of control (eg. you don't want to
    # get all the students passwords when we get the list of sections)

    return nil unless row = DASHBOARD_DB[:sections].
      join(:users, :id=>:user_id).
      select(*fields).
      where(sections__id:id).
      first

    section = self.new(row)
    return section if section.member?(user_id)
    nil
  end

  def self.fetch_if_teacher(id, user_id)
    return nil unless row = DASHBOARD_DB[:sections].
      join(:users, :id=>:user_id).
      select(*fields).
      where(sections__id:id).
      first

    section = self.new(row)
    return section if section.teacher?(user_id)
    nil
  end

  def self.fetch_user_sections(user_id)
     DASHBOARD_DB[:sections].
       join(:users, :id=>:user_id).
       select(*fields).
       where(user_id:user_id).
       map{|i| self.new(i).to_hash}
  end

  def add_student(student)
    return nil unless student_id = student[:id] || DashboardStudent::create(student)

    created_at = DateTime.now
    DASHBOARD_DB[:followers].insert({
      user_id:@row[:teacher_id],
      student_user_id:student_id,
      section_id:@row[:id],
      created_at:created_at,
      updated_at:created_at,
    })
    student_id
  end

  def add_students(students)
    DASHBOARD_DB.transaction do
      student_ids = students.map{|i| add_student(i)}
      DashboardUserScript.assign_script_to_section(@row[:script_id], @row[:id]) if @row[:script_id]
      return student_ids
    end
  end

  def remove_student(student_id)
    # BUGBUG: Need to detect "sponsored" accounts and disallow delete.

    rows_deleted = DASHBOARD_DB[:followers].where(section_id:@row[:id], student_user_id:student_id).delete
    rows_deleted > 0
  end

  def set_students(students)
    DASHBOARD_DB.transaction do
      DASHBOARD_DB[:followers].where(section_id:@row[:id]).delete
      students.each{|i| add_student(i)}
    end
  end

  def member?(user_id)
    return teacher?(user_id) || student?(user_id)
  end

  def student?(user_id)
    !!students.index{|i| i[:id] == user_id}
  end

  def students()
    @students ||= DASHBOARD_DB[:followers].
      join(:users, id: :student_user_id).
      left_outer_join(:secret_pictures, id: :secret_picture_id).
      left_outer_join(Sequel.as(:secret_words, :secret_words_1), id: :users__secret_word_1_id).
      left_outer_join(Sequel.as(:secret_words, :secret_words_2), id: :users__secret_word_2_id).
      select(Sequel.as(:student_user_id, :id),
             *DashboardStudent.fields,
             :secret_pictures__name___secret_picture_name,
             :secret_pictures__path___secret_picture_path,
             :secret_words_1__word___secret_word_1,
             :secret_words_2__word___secret_word_2).
      distinct(:student_user_id).
      where(section_id:@row[:id]).
      map{|row| row.merge({
        location:"/v2/users/#{row[:id]}",
        age: DashboardStudent::birthday_to_age(row[:birthday])
      })}
  end

  def teacher?(user_id)
    !!teachers.index{|i| i[:id] == user_id}
  end

  def teachers()
    @teachers ||= [{
      id:@row[:teacher_id],
      location:"/v2/users/#{@row[:teacher_id]}",
                   }]
  end

  def course
    @course ||= DASHBOARD_DB[:scripts].
      where(id:@row[:script_id]).
      select(:id, :name).
      first
  end

  def to_hash()
    {
      id:@row[:id],
      location:"/v2/sections/#{@row[:id]}",
      name:@row[:name],
      login_type:@row[:login_type],
      grade:@row[:grade],
      code:@row[:code],
      course:course,
      teachers:teachers,
      students:students,
    }
  end

  def self.update_if_owner(params)
    section_id = params[:id]
    return nil unless params[:user] && params[:user][:user_type] == 'teacher'
    user_id = params[:user][:id]

    fields = {updated_at:DateTime.now}
    fields[:name] = params[:name] unless params[:name].nil_or_empty?
    fields[:login_type] = params[:login_type] if valid_login_type?(params[:login_type])
    fields[:grade] = params[:grade] if valid_grade?(params[:grade])

    if params[:course] && valid_course_id?(params[:course][:id])
      fields[:script_id] = params[:course][:id].to_i
      DashboardUserScript.assign_script_to_section(fields[:script_id], section_id)
    end

    rows_updated = DASHBOARD_DB[:sections].
      where(id:section_id).
      and(user_id:user_id).
      update(fields)
    return nil unless rows_updated > 0

    fetch_if_allowed(section_id, user_id)
  end

  private

  def self.fields()
    [
      :sections__id___id,
      :sections__name___name,
      :sections__code___code,
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
    DASHBOARD_DB[:user_scripts].
      insert_ignore.
      import([:user_id, :script_id],
             DASHBOARD_DB[:followers].
               select(:student_user_id, script_id.to_s).
               where(section_id: section_id))

    DASHBOARD_DB[:user_scripts].
      where(user_id: DASHBOARD_DB[:followers].
               select(:student_user_id).
               where(section_id: section_id)).
      and(script_id: script_id).
      update(assigned_at: DateTime.now)
  end
end
