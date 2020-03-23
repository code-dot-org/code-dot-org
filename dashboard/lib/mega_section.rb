include FactoryGirl::Syntax::Methods

class MegaSection
  SAMPLE_TEACHER_EMAIL = 'mega_section_teacher@code.org'.freeze
  SAMPLE_TEACHER_PASSWORD = 'mega_section_password'.freeze
  SAMPLE_TEACHER_NAME = 'MegaSection Teacher'.freeze
  SAMPLE_STUDENT_NAME_FORMAT = 'TestStudent%s MegaSection'.freeze
  SAMPLE_STUDENT_NAME_REGEX = /TestStudent\d* MegaSection/

  @@rng = nil

  # Returns a seeded random number generator for consistent test data
  def self.rng
    @@rng ||= Random.new(0)
  end

  def self.environment_check!
    raise "Should not be run in production" if rack_env?(:production)
  end

  def self.seed
    environment_check!

    # Create a test teacher
    teacher = create_teacher SAMPLE_TEACHER_EMAIL, SAMPLE_TEACHER_PASSWORD,
      SAMPLE_TEACHER_NAME

    # Create a large section for CSF, Course A 2019
    create_section(
      teacher: teacher, name: 'CSF - Mega Section',
      login_type: Section::LOGIN_TYPE_PICTURE, grade: 2, age_min: 7,
      age_max_inclusive: 9, script_name: 'coursea-2019', num_students: 250,
      use_imperfect_results: true
    )
  end

  # Hard-delete the teacher and all of the teacher's sections and students
  # and recreate. Sections and followers would be soft-deleted by
  # dependency when we delete the teacher; but to not leave a trail of
  # old test data behind, we explictly hard-delete.
  def self.create_teacher(email, password, name)
    environment_check!
    # Delete any existing test data
    user = User.find_by_email_or_hashed_email(email)
    unless user.nil?
      user.sections.each do |section|
        # Hard-delete all students in each section.
        section.students.each do |student_user|
          raise "Not a sample student - #{student_user.name}" unless student_user.name =~ SAMPLE_STUDENT_NAME_REGEX
          environment_check!
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
      environment_check!
      user.really_destroy!
    end
    # Create the test teacher
    create :teacher, email: email, name: name,
      password: password, terms_of_service_version: 1
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
      student_user = create :student, name: name, age: age

      # Add student to section
      create :follower, section: section, student_user: student_user

      script.script_levels.each do |script_level|
        # Create progress for this student on each level
        user_level = create :user_level,
          user: student_user,
          script_id: script.id,
          level_id: script_level.levels.first.id,
          attempts: 1,
          best_result: ActivityConstants::BEST_PASS_RESULT
        # Score each level for each student
        create :teacher_score,
          user_level_id: user_level.id,
          teacher_id: section.teacher.id,
          score: 100
        # Add teacher feedback for each level.
        create :teacher_feedback,
          student_id: student_user.id,
          teacher_id: section.teacher.id,
          script_level_id: script_level.id,
          level_id: script_level.levels.first.id,
          comment: tiny_lipsum
      end
    end
  end

  # Helper that generates a few sentences of plausible latin-esqe text, for use as obviously
  # fake text data.
  def self.tiny_lipsum
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut" \
    " labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco" \
    " laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in" \
    " voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat" \
    " non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.".
      split(/[.,]/).
      sample(rng.rand(3..6)).
      map(&:strip).
      compact.
      map(&:capitalize).
      join('. ') + '.'
  end
end
