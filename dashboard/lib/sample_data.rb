include FactoryGirl::Syntax::Methods

class SampleData
  TEST_ACCOUNT_PASSWORD = "00secret".freeze
  @@prng = nil

  # Returns a seeded random number generator for consistent test data
  def self.prng
    @@prng ||= Random.new(0)
    @@prng
  end

  # Creates sample data
  def self.seed
    raise "Should not be run outside of development" unless CDO.rack_env?(:development)

    # Create a test teacher
    teacher = create_teacher "testteacher@code.org", "TestTeacher Codeberg"

    # Create normal-sized and large sections for each of CSF, CSD and CSP

    create_section({teacher: teacher, name: "CSF 1",
      login_type: Section::LOGIN_TYPE_PICTURE, grade: 2, age_min: 7,
      age_max_inclusive: 9, script_name: "coursea-2018", num_students: 30,
      use_imperfect_results: true}
      )

    create_section({teacher: teacher, name: "CSF 2 (Large)",
      login_type: Section::LOGIN_TYPE_PICTURE, grade: 2, age_min: 7,
      age_max_inclusive: 9, script_name: "coursea-2018", num_students: 150,
      use_imperfect_results: true}
      )

    create_section({teacher: teacher, name: "CSD 1",
      login_type: Section::LOGIN_TYPE_EMAIL, grade: 7, age_min: 13,
      age_max_inclusive: 14, script_name: "csd1-2018", num_students: 30,
      use_imperfect_results: false}
      )

    create_section ({teacher: teacher, name: "CSD 2 (Large)",
      login_type: Section::LOGIN_TYPE_EMAIL, grade: 7, age_min: 13,
      age_max_inclusive: 14, script_name: "csd1-2018", num_students: 150,
      use_imperfect_results: false}
      )

    create_section ({teacher: teacher, name: "CSP 1",
      login_type: Section::LOGIN_TYPE_EMAIL, grade: 10, age_min: 14,
      age_max_inclusive: 16, script_name: "csp1-2018", num_students: 30,
      use_imperfect_results: false}
      )

    create_section ({teacher: teacher, name: "CSP 2 (Large)",
      login_type: Section::LOGIN_TYPE_EMAIL, grade: 10, age_min: 14,
      age_max_inclusive: 16, script_name: "csp1-2018", num_students: 150,
      use_imperfect_results: false}
      )
  end

  # will delete the teacher and all of the teacher's sections and students
  # and recreate.
  def self.create_teacher(email, name)
    # Delete any existing test data
    user = User.find_by_email_or_hashed_email(email)
    unless user.nil?
      user.sections.each do |section|
        # Delete all students in each section
        section.followers.each do |follower|
          student_user = User.find_by_id(follower.student_user_id)
          raise "Not a test user" unless student_user.name.include? "Codeberg"
          UserGeo.where(user_id: student_user.id).destroy_all
          student_user.really_destroy!
        end
        # Delete each section
        section.really_destroy!
      end
      UserGeo.where(user_id: user.id).destroy_all
      # Delete the existing test teacher
      raise "Not a test user" unless user.name.include? "Codeberg"
      user.really_destroy!
    end
    # Create the test teacher
    create :teacher, {email: email, name: name,
      password: TEST_ACCOUNT_PASSWORD, terms_of_service_version: 1}
  end

  # Generate a random gender choice with reasonable distributions
  def self.random_gender
    val = prng.rand(100)
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
    section = create :section, {user: options[:teacher], name: options[:name],
      login_type: options[:login_type], grade: options[:grade],
      script: script}

    # Create students in section
    (0..options[:num_students] - 1).each do
      # Choose random properties and create student
      age_min = options[:age_min]
      age_max_inclusive = options[:age_max_inclusive]

      age = prng.rand(age_max_inclusive + 1 - age_min) + age_min
      gender = random_gender
      student_user = create :student, {age: age, gender: gender}

      # Add student to section
      create :follower, {section: section, student_user: student_user}

      # Create random student progress.
      pct_skipped = prng.rand(15)
      pct_imperfect = options[:use_imperfect_results] ? prng.rand(40) + 25 +
        pct_skipped : 0

      max_level =
        if prng.rand(100) < 90
          (level_count.to_f * (prng.rand(0.6) + 0.2)).to_i
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
        rand_val = prng.rand(100)
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
