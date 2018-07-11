include FactoryGirl::Syntax::Methods

class SampleData
  SAMPLE_TEACHER_EMAIL = 'testteacher@code.org'.freeze
  SAMPLE_TEACHER_PASSWORD = '00secret'.freeze
  SAMPLE_TEACHER_NAME = 'TestTeacher Codeberg'.freeze
  SAMPLE_STUDENT_NAME_FORMAT = 'TestStudent%s Codeberg'.freeze
  SAMPLE_STUDENT_NAME_REGEX = /TestStudent\d* Codeberg/

  @@rng = nil

  # Returns a seeded random number generator for consistent test data
  def self.rng
    @@rng ||= Random.new(0)
  end

  # Creates sample data
  def self.seed
    raise "Should not be run outside of development" unless CDO.rack_env?(:development)

    # Create a test teacher
    teacher = create_teacher SAMPLE_TEACHER_EMAIL, SAMPLE_TEACHER_PASSWORD,
      SAMPLE_TEACHER_NAME

    # Create normal-sized and large sections for each of CSF, CSD and CSP

    create_section(
      teacher: teacher, name: 'CSF 1',
      login_type: Section::LOGIN_TYPE_PICTURE, grade: 2, age_min: 7,
      age_max_inclusive: 9, script_name: 'coursea-2018', num_students: 30,
      use_imperfect_results: true
    )

    create_section(
      teacher: teacher, name: 'CSF 2 (Large)',
      login_type: Section::LOGIN_TYPE_PICTURE, grade: 2, age_min: 7,
      age_max_inclusive: 9, script_name: 'coursea-2018', num_students: 150,
      use_imperfect_results: true
    )

    create_section(
      teacher: teacher, name: 'CSD 1',
      login_type: Section::LOGIN_TYPE_EMAIL, grade: 7, age_min: 13,
      age_max_inclusive: 14, script_name: 'csd1-2018', num_students: 30,
      use_imperfect_results: false
    )

    create_section(
      teacher: teacher, name: 'CSD 2 (Large)',
      login_type: Section::LOGIN_TYPE_EMAIL, grade: 7, age_min: 13,
      age_max_inclusive: 14, script_name: 'csd1-2018', num_students: 150,
      use_imperfect_results: false
    )

    create_section(
      teacher: teacher, name: 'CSP 1',
      login_type: Section::LOGIN_TYPE_EMAIL, grade: 10, age_min: 14,
      age_max_inclusive: 16, script_name: 'csp1-2018', num_students: 30,
      use_imperfect_results: false
    )

    create_section(
      teacher: teacher, name: 'CSP 2 (Large)',
      login_type: Section::LOGIN_TYPE_EMAIL, grade: 10, age_min: 14,
      age_max_inclusive: 16, script_name: 'csp1-2018', num_students: 150,
      use_imperfect_results: false
    )
  end

  # Hard-delete the teacher and all of the teacher's sections and students
  # and recreate. Sections and followers would be soft-deleted by
  # dependency when we delete the teacher; but to not leave a trail of
  # old test data behind, we explictly hard-delete.
  def self.create_teacher(email, password, name)
    raise "Should not be run outside of development" unless CDO.rack_env?(:development)
    # Delete any existing test data
    user = User.find_by_email_or_hashed_email(email)
    unless user.nil?
      user.sections.each do |section|
        # Hard-delete all students in each section.
        section.students.each do |student_user|
          raise "Not a sample student - #{student_user.name}" unless student_user.name =~ SAMPLE_STUDENT_NAME_REGEX
          raise "Should not be run outside of development" unless CDO.rack_env?(:development)
          UserGeo.where(user_id: student_user.id).destroy_all
          student_user.really_destroy!
        end
        # Hard-delete each section.
        section.really_destroy!
      end
      UserGeo.where(user_id: user.id).destroy_all
      # Delete the existing test teacher
      unless (user.name.eql? SAMPLE_TEACHER_NAME) && (user.email.eql? SAMPLE_TEACHER_EMAIL)
        raise "Not a sample teacher - #{user.name}"
      end
      raise "Should not be run outside of development" unless CDO.rack_env?(:development)
      user.really_destroy!
    end
    # Create the test teacher
    create :teacher, email: email, name: name,
      password: password, terms_of_service_version: 1
  end

  # Generate a random gender choice with reasonable distributions
  def self.random_gender
    val = rng.rand(100)
    gender = nil
    case val
    when 0..29
      gender = "m"
    when 30..59
      gender = "f"
    when 60..89
      gender = nil
    when 90..94
      gender = "n"
    when 95..99
      gender = "o"
    end
    gender
  end

  # Create a test section
  # Options is a hash with expected values:
  #  :teacher - User object of teacher
  #  :name - section name
  #  :login_type - Section::LOGIN_TYPE_xxx value of login type for section
  #  :grade - grade for section
  #  :age_min - minimum age to generate for students
  #  :age_max_inclusive - max age (inclusive) to generate for students
  #  :script_name - name of script to assign for section
  #  :num_students - number of students to generate for section
  #  :use_imperfect_results - if true, generate some less than perfect
  #    results. (CSF allows imperfect results, CSD and CSP do not.)
  def self.create_section(options)
    script = Script.get_from_cache(options[:script_name])
    level_count = script.script_levels.count

    # Create the section
    section = create :section, script: script,
      **options.slice(:teacher, :name, :login_type, :grade)

    current_student = 0

    # Create students in section
    (1..options[:num_students]).each do
      # Choose random properties and create student
      age_min = options[:age_min]
      age_max_inclusive = options[:age_max_inclusive]
      current_student += 1

      name = format(SAMPLE_STUDENT_NAME_FORMAT, current_student)
      age = rng.rand(age_min..age_max_inclusive)
      gender = random_gender
      student_user = create :student, name: name, age: age, gender: gender

      # Add student to section
      create :follower, section: section, student_user: student_user

      # Create random student progress.
      pct_skipped = rng.rand(15)
      pct_imperfect = options[:use_imperfect_results] ? rng.rand(25..65) +
        pct_skipped : 0

      max_level =
        if rng.rand(100) < 90
          (level_count.to_f * rng.rand(0.2..0.8)).to_i
        else
          # To simulate real-world data, some students have no progress
          0
        end

      # Create progress for this student on each level, up to a random
      # max level
      current_level = 0
      script.script_levels.each do |script_level|
        break if current_level == max_level

        # Roll the dice to decide if progress is completed, perfect, or
        # skipped for this level
        rand_val = rng.rand(100)
        best_result =
          if rand_val < pct_skipped
            nil
          elsif rand_val < pct_imperfect
            ActivityConstants::MINIMUM_PASS_RESULT
          else
            ActivityConstants::BEST_PASS_RESULT
          end

        # Save progress for this level if not skipping
        if best_result
          create :user_level, user: student_user, script_id: script.id,
            level_id: script_level.level_id, attempts: 1,
            best_result: best_result
        end

        current_level += 1
      end
    end
  end
end
