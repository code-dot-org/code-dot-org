include FactoryGirl::Syntax::Methods

class MegaSection
  SAMPLE_TEACHER_EMAIL = 'mega_section_teacher@code.org'.freeze
  SAMPLE_TEACHER_PASSWORD = 'mega_section_password'.freeze
  SAMPLE_TEACHER_NAME = 'MegaSection_Teacher'.freeze
  SAMPLE_STUDENT_NAME_FORMAT = 'TestStudent%s MegaSection'.freeze
  SAMPLE_STUDENT_NAME_REGEX = /TestStudent\d* MegaSection/
  SAMPLE_STUDENT_PARENT_EMAIL = 'mega_section_parent@code.org'.freeze

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
    start_time = Time.now

    teacher = create_teacher SAMPLE_TEACHER_EMAIL, SAMPLE_TEACHER_PASSWORD,
      SAMPLE_TEACHER_NAME

    mid_time = Time.now

    # Create a large section for CSF
    # Assign and generate progress for Course A 2019 , which does have
    # standards associations, so we DO fetch teacher scores when we query for
    # progress.
    # Generate progress for Course A 2018, which does NOT have
    # standards associations, so we do NOT (currently) fetch teacher scores
    # when we query for progress.
    create_section(
      teacher: teacher,
      login_type: Section::LOGIN_TYPE_PICTURE,
      grade: 2,
      age_min: 7,
      age_max_inclusive: 9,
      num_students: 250,
      name: 'CSF - Mega Section',
      script_name_1: 'coursea-2019',
      script_name_2: 'coursea-2018',
    )

    puts "Created section and progress in #{Time.now - mid_time} seconds"
    puts "Seeded in #{Time.now - start_time} seconds"
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
      user.teacher_feedbacks.with_deleted.delete_all
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
  #  :script_name_1 - name of script to assign for section
  #  :script_name_2 - name of additional script to generate progress for
  #  :num_students - number of students to generate for section
  def self.create_section(options)
    script_1 = Script.get_from_cache(options[:script_name_1])
    script_2 = Script.get_from_cache(options[:script_name_2])
    script_levels_1 = script_1.script_levels.includes(:levels)
    script_levels_2 = script_2.script_levels.includes(:levels)

    # Create the section
    section = create :section, script: script_1,
      **options.slice(:teacher, :name, :login_type, :grade)

    # Create students
    students = []
    (1..options[:num_students]).each do |i|
      # Choose random properties and create student
      age_min = options[:age_min]
      age_max_inclusive = options[:age_max_inclusive]

      # We give all sample students the same parent email to make it easy to look them
      # up after we bulk-create them here.
      students << build(:student,
        name: format(SAMPLE_STUDENT_NAME_FORMAT, i),
        age: rng.rand(age_min..age_max_inclusive),
        email: "mega_student_#{i}@example.com",
        parent_email: SAMPLE_STUDENT_PARENT_EMAIL
      )
    end
    User.import! students

    students = User.where(parent_email: SAMPLE_STUDENT_PARENT_EMAIL)

    # Add students to section and simulate progress
    followers = []
    user_levels = []
    teacher_feedbacks = []
    students.each do |student_user|
      # Add student to section
      followers << build(:follower, section: section, student_user: student_user)

      # Create progress for this student on each level of assigned script.
      script_levels_1.each do |script_level|
        user_levels << build(:user_level,
          user: student_user,
          script_id: script_1.id,
          level_id: script_level.levels.first.id,
          attempts: 1,
          best_result: ActivityConstants::BEST_PASS_RESULT
        )

        # Add teacher feedback for each level.
        teacher_feedbacks << build(:teacher_feedback,
          student_id: student_user.id,
          teacher_id: section.teacher.id,
          script_level_id: script_level.id,
          level_id: script_level.levels.first.id,
          comment: tiny_lipsum
        )
      end

      # Create progress for this student on each level of additional script.
      script_levels_2.each do |script_level|
        user_levels << build(:user_level,
          user: student_user,
          script_id: script_2.id,
          level_id: script_level.levels.first.id,
          attempts: 1,
          best_result: ActivityConstants::BEST_PASS_RESULT
        )

        # Add teacher feedback for each level.
        teacher_feedbacks << build(:teacher_feedback,
          student_id: student_user.id,
          teacher_id: section.teacher.id,
          script_level_id: script_level.id,
          level_id: script_level.levels.first.id,
          comment: tiny_lipsum
        )
      end
    end
    Follower.import! followers
    UserLevel.import! user_levels
    TeacherFeedback.import! teacher_feedbacks

    # Retrieve newly-created user levels so we can add teacher scores
    teacher_scores = []
    UserLevel.where(user: students).each do |user_level|
      # Score each level for each student
      teacher_scores << build(:teacher_score,
        user_level_id: user_level.id,
        teacher_id: section.teacher.id,
        score: 100
      )
    end
    TeacherScore.import! teacher_scores
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
