include FactoryBot::Syntax::Methods

class TestSection
  DEFAULT_TEACHER_EMAIL = 'test_teacher@code.org'
  DEFAULT_TEACHER_PASSWORD = 'test_password'
  DEFAULT_TEACHER_NAME = 'Test Teacher'
  DEFAULT_SECTION_NAME = 'Generated Test Section'
  DEFAULT_NUM_STUDENTS = 10

  SAMPLE_STUDENT_NAME_FORMAT = 'Student%s Generated'.freeze
  SAMPLE_STUDENT_NAME_REGEX = /Student\d* Generated/

  DEFAULT_UNIT = 'csp3-2024'
  DEFAULT_COURSE = 'csp-2024'

  @@rng = nil

  # Returns a seeded random number generator for consistent test data
  def self.rng
    @@rng ||= Random.new(0)
  end

  def self.seed(options)
    teacher_id = options[:teacher_id] || nil

    teacher = find_or_create_teacher(teacher_id)

    create_section(
      teacher: teacher,
      name: options[:section_name] || DEFAULT_SECTION_NAME,
      login_type: Section::LOGIN_TYPE_PICTURE,
      grade: [2],
      unit_name: options[:unit_name] || DEFAULT_UNIT,
      unit_group_name: options[:unit_group_name] || DEFAULT_COURSE,
      course_name: options[:course_name] || DEFAULT_COURSE,
      num_students: options[:num_students] || DEFAULT_NUM_STUDENTS,
    )
  end

  # If teacher_id is provided, find the teacher by ID and do not delete any data.
  # If no teacher_id is provided, create a new teacher with the default email, name, and password.
  # Hard-delete the to-be-created teacher and all of the teacher's sections and students
  # and recreate. Sections and followers would be soft-deleted by
  # dependency when we delete the teacher; but to not leave a trail of
  # old test data behind, we explictly hard-delete.
  def self.find_or_create_teacher(teacher_id)
    return User.find_by(id: teacher_id) unless teacher_id.nil?

    # Delete any existing test data
    user = User.find_by_email_or_hashed_email(DEFAULT_TEACHER_EMAIL)
    unless user.nil?
      delete_existing_teacher(user)
    end

    # Create the test teacher
    teacher = create :teacher, email: DEFAULT_TEACHER_EMAIL, name: DEFAULT_TEACHER_NAME,
      password: DEFAULT_TEACHER_PASSWORD, terms_of_service_version: 1

    # Make the teacher an authorized teacher
    UserPermission.create(user: teacher, permission: UserPermission::AUTHORIZED_TEACHER)
    teacher
  end

  def self.delete_existing_teacher(user)
    user.sections_instructed.each do |section|
      # Hard-delete all students in each section.
      section.students.each do |student_user|
        raise "Not a sample student - #{student_user.name}" unless SAMPLE_STUDENT_NAME_REGEX.match?(student_user.name)
        UserGeo.where(user_id: student_user.id).destroy_all
        student_user.really_destroy!
      end
      # Hard-delete each section.
      section.really_destroy!
    end
    UserGeo.where(user_id: user.id).destroy_all
    # Delete the existing test teacher
    unless (user.name.eql? DEFAULT_TEACHER_NAME) && (user.email.eql? DEFAULT_TEACHER_EMAIL)
      raise "Not a sample teacher - #{user.name}"
    end
    user.really_destroy!
  end

  def self.create_section(options)
    unit = Unit.get_from_cache(options[:unit_name])
    unit_group = UnitGroup.get_from_cache(options[:unit_group_name])

    section = create :section, script: unit, unit_group: unit_group,
      **options.slice(:teacher, :name, :login_type, :grade)

    current_student = 0
    students = []
    level_count = unit.script_levels.count

    # Create students in section
    (1..options[:num_students]).each do
      # Choose random properties and create student
      current_student += 1

      name = format(SAMPLE_STUDENT_NAME_FORMAT, current_student)
      student_user = create :student, name: name, age: 10, gender: nil

      # Add student to section
      create :follower, section: section, student_user: student_user
      students << student_user
    end

    students.each do |student_user|
      max_level = max_level_for_student(level_count)
      create_user_levels(student_user, max_level, unit)
      create_teacher_feedback(student_user, options[:teacher], max_level, unit)
    end
    section
  end

  def self.max_level_for_student(level_count)
    if rng.rand(100) < 90
      (level_count.to_f * rng.rand(0.2..0.8)).to_i
    else
      # To simulate real-world data, some students have no progress
      0
    end
  end

  def self.create_user_levels(student_user, max_level, unit)
    script_levels = unit.script_levels.includes(:levels)
    current_level = 0

    pct_skipped = rng.rand(15)

    script_levels.each do |script_level|
      break if current_level == max_level

      # Roll the dice to decide if progress is completed, perfect, or
      # skipped for this level
      rand_val = rng.rand(100)
      best_result =
        if rand_val < pct_skipped
          nil
        elsif rand_val < 0
          ActivityConstants::MINIMUM_PASS_RESULT
        else
          ActivityConstants::BEST_PASS_RESULT
        end

      # Save progress for this level if not skipping
      if best_result
        create :user_level, user: student_user, script_id: unit.id,
          level_id: script_level.levels.first.id, attempts: 1,
          best_result: best_result

        # Create a backing channel for this level if it's a type that needs it
        if script_level.levels.first.channel_backed?
          ChannelToken.find_or_create_channel_token(
            script_level.levels.first,
            '127.0.0.1',
            find_or_create_storage_id_for_user_id(student_user.id),
            unit.id,
            {
              hidden: true
            }
          )
        end
      end

      current_level += 1
    end
  end

  def self.create_teacher_feedback(student_user, teacher, max_level, unit)
    script_levels = unit.script_levels.includes(:levels)
    current_level = 0

    script_levels.each do |script_level|
      break if current_level == max_level

      if rng.rand(100) < 20 # 20% chance of feedback
        create :teacher_feedback,
          student: student_user,
          teacher: teacher,
          level: script_level.levels.first,
          script: unit,
          comment: tiny_lipsum
      end

      current_level += 1
    end
  end

  # Look up or create a storage id for the sample data (used for testing purposes)
  def self.find_or_create_storage_id_for_user_id(user_id)
    storage_id = storage_id_for_user_id(user_id)
    return storage_id if storage_id
    create_storage_id_for_user(user_id)
  end

  # Helper that generates a few sentences of plausible latin-esqe text, for use as obviously
  # fake text data.
  def self.tiny_lipsum
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut " \
    "labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco " \
    "laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in " \
    "voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat " \
    "non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.".
      split(/[.,]/).
      sample(rng.rand(3..6)).
      filter_map(&:strip).
      map(&:capitalize).
      join('. ') + '.'
  end
end
