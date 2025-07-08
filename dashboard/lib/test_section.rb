include FactoryBot::Syntax::Methods

require 'json'

class TestSection
  @@rng = nil

  # Returns a seeded random number generator for consistent test data
  def self.rng
    @@rng ||= Random.new(0)
  end

  # Creates a test section with students and mocked student progress.
  # Run with nil to see usage ('TestSection.seed(nil)').
  def self.seed(options)
    seed_environment_check!

    if options.nil? || !options.is_a?(Hash)
      pp 'Creates a test section with students and mocked student progress.'
      pp 'Options:'
      pp '  - :preset_name - "csp4", "random", or nil (defaults to "csp4" if not specified)'
      pp '      If "csp4", uses preset specified data from TestSectionData::CSP_4_TEST_SECTION preset data.'
      pp '      If "random", creates a section with random progress. Only creates teacher_feedback and user_levels.'
      pp '  - :teacher_id - ID of the teacher to assign to the section, or nil to create a default teacher'
      pp '      Default teacher has email TestSectionData::DEFAULT_TEACHER_EMAIL, and password TestSectionData::DEFAULT_TEACHER_PASSWORD.'
      pp '  - :section_name - Name of the section to create, defaults to TestSectionData::DEFAULT_SECTION_NAME'
      pp '  - :num_students - Number of students to add to the section, defaults to TestSectionData::DEFAULT_NUM_STUDENTS'
      pp '  - :unit_name - Name of the unit to use, defaults to TestSectionData::DEFAULT_UNIT. Only used when preset_name is "random".'
      pp '  - :unit_group_name - Name of the unit group to use, defaults to TestSectionData::DEFAULT_UNIT_GROUP. Only used when preset_name is "random".'
      pp '  - :skip_ai_evaluation - Skip AI evaluation of student work, defaults to false. AI evaluations take a long time to generate, if you don\'t need evaluations, it is recommended to set this to true.'
      pp ''
      pp 'Only runs in non-production environments (development, adhoc, staging, test).'
      pp 'Only creates a new teacher if :teacher_id is not provided and only on adhoc or development.'
      pp ''
      pp 'Example usage:'
      pp '  TestSection.seed({})'
      pp '  TestSection.seed({preset_name: "random", teacher_id: 456, section_name: "Random Section", num_students: 15})'
      return
    end

    preset_name = options[:preset_name]
    preset_options = if preset_name == 'random'
                       {
                         unit_name: options[:unit_name] || TestSectionData::DEFAULT_UNIT,
                         unit_group_name: options[:unit_group_name] || TestSectionData::DEFAULT_UNIT_GROUP,
                         grade: [10],
                         age: 15,
                       }
                     elsif preset_name == 'csp4' || preset_name.nil?
                       TestSectionData::CSP_4_TEST_SECTION
                     else
                       nil
                     end
    skip_ai_evaluation = options[:skip_ai_evaluation] || false

    if preset_options.nil?
      raise "Invalid preset_name: #{options[:preset_name]}. Valid options are: 'csp4', 'random' or nil (defaults to csp4 if not specified)."
    end

    teacher_id = options[:teacher_id] || nil

    unit = Unit.get_from_cache(preset_options[:unit_name])

    teacher = nil
    if teacher_id.nil?
      teacher = create_default_teacher(unit)
    else
      teacher = User.find_by(id: teacher_id)
      raise "Teacher with id #{teacher_id} not found. Please provide a valid teacher_id." if teacher.nil?
    end

    section = create_section(
      teacher: teacher,
      name: options[:section_name] || TestSectionData::DEFAULT_SECTION_NAME,
      unit: unit,
      **preset_options.slice(:unit_group_name, :grade)
    )

    students = add_students_to_section(section,
      num_students: options[:num_students] || TestSectionData::DEFAULT_NUM_STUDENTS,
      age: preset_options[:age],
    )

    if preset_name == 'random'
      create_random_student_progress(students, unit: unit, teacher: teacher)
    else
      create_student_progress(students, unit: unit, teacher: teacher, skip_ai_evaluation: skip_ai_evaluation, **preset_options.slice(:data_per_student, :school_year))
    end

    puts ''
    puts "Created section with section_id: #{section.id}, num_students: #{students.count} and teacher: #{teacher.email}"

    nil
  end

  def self.seed_environment_check!
    raise "Cannot create test data on production" unless [:development,
                                                          :adhoc,
                                                          :staging,
                                                          :test].include?(CDO.rack_env)
  end

  # Raise if run outside of a development environment.  Add this check at the top of any
  # public methods that can mutate data.
  def self.create_teacher_environment_check!
    raise "Cannot create default teacher outside of adhoc or development" unless [:adhoc, :development].include?(CDO.rack_env)
  end

  # Create a new teacher with the default email, name, and password.
  # Hard-delete any existing teacher that was already generated and all of the teacher's sections and students
  # and recreate. Sections and followers would be soft-deleted by
  # dependency when we delete the teacher; but to not leave a trail of
  # old test data behind, we explictly hard-delete.
  def self.create_default_teacher(unit)
    # Only create a new teacher in safe environments, not on production.
    create_teacher_environment_check!

    user = User.find_by_email_or_hashed_email(TestSectionData::DEFAULT_TEACHER_EMAIL)

    unless user.nil?
      delete_existing_teacher(user, unit)
    end

    # Create the test teacher
    teacher = create :teacher, email: TestSectionData::DEFAULT_TEACHER_EMAIL, name: TestSectionData::DEFAULT_TEACHER_NAME,
      password: TestSectionData::DEFAULT_TEACHER_PASSWORD, terms_of_service_version: 1

    # Make the teacher an authorized teacher
    UserPermission.create(user: teacher, permission: UserPermission::AUTHORIZED_TEACHER)

    puts "Created test teacher with email: #{teacher.email}, name: '#{teacher.name}' and password: #{TestSectionData::DEFAULT_TEACHER_PASSWORD}"
    teacher
  end

  def self.delete_existing_teacher(user, unit)
    user.sections_instructed.each do |section|
      # Hard-delete all students in each section.
      section.students.each do |student_user|
        raise "Not a sample student - #{student_user.name}" unless TestSectionData::SAMPLE_STUDENT_NAME_REGEX.match?(student_user.name)
        UserGeo.where(user_id: student_user.id).destroy_all

        # Delete channel tokens and their content for each student.
        channel_tokens = ChannelToken.where(storage_id: student_user.user_storage_id).all
        buckets = SourceBucket.new
        channel_tokens.each do |token|
          buckets.hard_delete_channel_content(token.channel)
          token.really_destroy!
        end

        UserLevel.where(user_id: student_user.id, script_id: unit.id).destroy_all

        # Delete ai evaluations for each student.
        ai_evaluations = StudentWorkEvaluation.where(student_id: student_user.id).all
        ai_evaluations&.each do |ai_eval|
          StudentWorkEvaluationSummary.where(student_work_evaluation_id: ai_eval.id).destroy_all
          StudentWorkEvaluationSummary.where(student_work_evaluation_summary_id: ai_eval.id).destroy_all
          ai_eval.destroy
        end

        student_user.really_destroy!
      end
      # Hard-delete each section.
      section.really_destroy!
    end

    TeacherFeedback.where(teacher_id: user.id).destroy_all
    UserGeo.where(user_id: user.id).destroy_all
    # Delete the existing test teacher
    unless (user.name.eql? TestSectionData::DEFAULT_TEACHER_NAME) && (user.email.eql? TestSectionData::DEFAULT_TEACHER_EMAIL)
      raise "Not a sample teacher - #{user.name}"
    end
    user.really_destroy!
  end

  def self.create_section(options)
    unit_group = UnitGroup.get_from_cache(options[:unit_group_name])

    create :section, script: options[:unit], unit_group: unit_group, login_type: Section::LOGIN_TYPE_PICTURE,
      **options.slice(:teacher, :name, :grade)
  end

  def self.add_students_to_section(section, options)
    # Initialize student count and array to hold students
    current_student = 0
    students = []

    # Create students in section
    (1..options[:num_students]).each do
      # Choose random properties and create student
      current_student += 1

      name = format(TestSectionData::SAMPLE_STUDENT_NAME_FORMAT, current_student)
      student_user = create :student, name: name, age: options[:age], gender: nil

      # Add student to section
      create :follower, section: section, student_user: student_user
      students << student_user
    end

    students
  end

  def self.create_random_student_progress(students, options)
    level_count = options[:unit].script_levels.count

    students.each do |student_user|
      max_level = max_level_for_student(level_count)
      create_random_user_levels(student_user, max_level, options[:unit])
      create_teacher_feedback(student_user, options[:teacher], max_level, options[:unit])
    end
  end

  def self.create_student_progress(students, options)
    preset_data_student_count = options[:data_per_student].count
    unit_id = options[:unit].id

    buckets = SourceBucket.new

    students.each_with_index do |student_user, index|
      break if index >= preset_data_student_count

      data = options[:data_per_student][index]

      # Create user levels based on the provided data
      data.each do |level_name, level_data|
        level = Level.find_by(name: level_name)

        if level.nil?
          raise "Level with name '#{level_name}' not found. Please check the level names in the data."
        end

        level_source = level_data[:level_source]
        level_source_id = nil
        unless level_source.nil?
          level_source_id = create(:level_source, level_id: level.id, data: level_source[:data]).id

          unless level_source[:data].nil?
            generate_ai_code_response(student_user, level, level_source[:data], options.slice(:teacher, :unit, :school_year))
          end
        end

        user_level = level_data[:user_level]
        unless user_level.nil?
          create :user_level, user: student_user, script_id: unit_id,
            level_id: level.id, attempts: user_level[:attempts],
            best_result: user_level[:best_result], level_source_id: level_source_id,
            time_spent: user_level[:time_spent] || 0, submitted: user_level[:submitted] || false

          # Create a backing channel for this level if it's a type that needs it
          channel_token =
            level.channel_backed? ?
             ChannelToken.find_or_create_channel_token(
               level,
               '127.0.0.1',
               find_or_create_storage_id_for_user_id(student_user.id),
               unit_id,
               {
                 hidden: true,
                 level: "/projects/applab",
                 migratedToS3: true
               }
             )
           : nil

        end

        unless level_data[:source_code].nil? || channel_token.nil?
          # Note: Generated student code only includes the source code and no other metadata.
          # This can cause some issues with rendering in the UI.
          # Most errors can be ignored or fixed by manually editing and running the generated code.
          s3_response = buckets.create_or_replace(channel_token.channel, "main.json", JSON.generate(level_data[:source_code]))

          unless options[:skip_ai_evaluation]
            generate_ai_code_response(student_user, level, level_data[:source_code][:source], {code_version: s3_response.version_id, **options.slice(:teacher, :unit, :school_year)})
          end
        end

        teacher_feedback = level_data[:teacher_feedback]
        unless teacher_feedback.nil?
          create :teacher_feedback,
            student: student_user,
            teacher: options[:teacher],
            level: level,
            script: options[:unit],
            comment: teacher_feedback[:comment]
        end
      end
    end
  end

  def self.generate_ai_code_response(student_user, level, student_work, options)
    ai_evaluation = OpenaiEvaluateHelper.evaluate(level, options[:unit],
      {
        student_work: student_work,
        evaluation_type: SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT]
      }
    )

    OpenaiEvaluateHelper.create_ai_evaluations_from_ai_response(ai_evaluation)
  end

  def self.max_level_for_student(level_count)
    if rng.rand(100) < 90
      (level_count.to_f * rng.rand(0.2..0.8)).to_i
    else
      # To simulate real-world data, some students have no progress
      0
    end
  end

  def self.create_random_user_levels(student_user, max_level, unit)
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
