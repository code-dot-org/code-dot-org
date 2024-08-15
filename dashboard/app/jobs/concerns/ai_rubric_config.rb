class AiRubricConfig
  S3_AI_BUCKET = 'cdo-ai'.freeze

  # The path to the release directory in S3 which contains the AI rubric evaluation config.
  # When launching AI config changes, this path should be updated to point to the new release.
  #
  # Basic validation of the new AI config is done by UI tests, or can be done locally
  # by running `AiRubricConfig.validate_ai_config` from the rails console.
  S3_AI_RELEASE_PATH = 'teaching_assistant/releases/2024-08-12-claude-3-release/'.freeze

  # 2D Map from unit name and level name, to the name of the lesson files within
  # the release dir in S3 which will be used for AI evaluation.
  UNIT_AND_LEVEL_TO_LESSON_S3_NAME = {
    'csd3-2023' => {
      'CSD U3 Sprites scene challenge_2023' => 'csd3-2023-L11',
      'CSD web project animated review_2023' => 'csd3-2023-L14',
      'CSD U3 Interactive Card Final_2023' => 'csd3-2023-L18',
      'CSD games sidescroll review_2023' => 'csd3-2023-L21',
      'CSD U3 collisions flyman bounceOff_2023' => 'csd3-2023-L24',
      'CSD games project review_2023' => 'csd3-2023-L28',
    },
    'csd3-2024' => {
      'CSD U3 Sprites scene challenge_2024' => 'csd3-2023-L11',
      'CSD web project animated review_2024' => 'csd3-2023-L14',
      'CSD U3 Interactive Card Final_2024' => 'csd3-2023-L18',
      'CSD games sidescroll review_2024' => 'csd3-2023-L21',
      'CSD U3 collisions flyman bounceOff_2024' => 'csd3-2023-L24',
      'CSD games project review_2024' => 'csd3-2023-L28',
    },
    'allthethings' => {
      'CSD U3 Sprites scene challenge_allthethings' => 'allthethings-L48',
    },
  }
  UNIT_AND_LEVEL_TO_LESSON_S3_NAME['interactive-games-animations-2023'] = UNIT_AND_LEVEL_TO_LESSON_S3_NAME['csd3-2023']
  UNIT_AND_LEVEL_TO_LESSON_S3_NAME['focus-on-creativity3-2023'] = UNIT_AND_LEVEL_TO_LESSON_S3_NAME['csd3-2023']
  UNIT_AND_LEVEL_TO_LESSON_S3_NAME['focus-on-coding3-2023'] = UNIT_AND_LEVEL_TO_LESSON_S3_NAME['csd3-2023']
  UNIT_AND_LEVEL_TO_LESSON_S3_NAME['interactive-games-animations-2024'] = UNIT_AND_LEVEL_TO_LESSON_S3_NAME['csd3-2024']
  UNIT_AND_LEVEL_TO_LESSON_S3_NAME['focus-on-creativity3-2024'] = UNIT_AND_LEVEL_TO_LESSON_S3_NAME['csd3-2024']
  UNIT_AND_LEVEL_TO_LESSON_S3_NAME['focus-on-coding3-2024'] = UNIT_AND_LEVEL_TO_LESSON_S3_NAME['csd3-2024']
  UNIT_AND_LEVEL_TO_LESSON_S3_NAME.freeze

  # For testing purposes, we can raise this error to simulate a missing key
  class StubNoSuchKey < StandardError
  end

  def self.ai_enabled?(script_level)
    !!get_lesson_s3_name(script_level)
  end

  # returns the path suffix of the location in S3 which contains the config
  # needed to evaluate the rubric for the given script level.
  def self.get_lesson_s3_name(script_level)
    UNIT_AND_LEVEL_TO_LESSON_S3_NAME[script_level&.script&.name].try(:[], script_level&.level&.name)
  end

  def self.s3_client
    @@s3_client ||= AWS::S3.create_client
  end

  def self.read_file_from_s3(lesson_s3_name, key_suffix, allow_missing: false)
    key = "#{S3_AI_RELEASE_PATH}#{lesson_s3_name}/#{key_suffix}"
    if [:development, :test].include?(rack_env) && File.exist?(File.join("local-aws", S3_AI_BUCKET, key))
      puts "Note: Reading AI prompt from local file: #{key}"
      File.read(File.join("local-aws", S3_AI_BUCKET, key))
    else
      s3_client.get_object(bucket: S3_AI_BUCKET, key: key)[:body].read
    end
  rescue Aws::S3::Errors::NoSuchKey, StubNoSuchKey => exception
    raise exception unless allow_missing
    nil
  end

  def self.read_examples(lesson_s3_name, response_type)
    raise "invalid response type #{response_type.inspect}" unless ['tsv', 'json'].include?(response_type)
    prefix = "#{S3_AI_RELEASE_PATH}#{lesson_s3_name}/examples/"
    response = s3_client.list_objects_v2(bucket: S3_AI_BUCKET, prefix: prefix)
    file_names = response.contents.map(&:key)
    file_names = file_names.map {|name| name.gsub(prefix, '')}
    js_files = file_names.select {|name| name.end_with?('.js')}
    js_files.map do |file_name|
      base_name = file_name.gsub('.js', '')
      code = s3_client.get_object(bucket: S3_AI_BUCKET, key: "#{prefix}#{file_name}")[:body].read
      response = s3_client.get_object(bucket: S3_AI_BUCKET, key: "#{prefix}#{base_name}.#{response_type}")[:body].read
      [code, response]
    end
  end

  def self.get_openai_params(lesson_s3_name, code)
    params = JSON.parse(read_file_from_s3(lesson_s3_name, 'params.json'))
    prompt = read_file_from_s3(lesson_s3_name, 'system_prompt.txt')
    rubric = read_file_from_s3(lesson_s3_name, 'standard_rubric.csv')
    response_type = params['response-type'] || 'tsv'
    examples = read_examples(lesson_s3_name, response_type)
    params.merge(
      'code' => code,
      'prompt' => prompt,
      'rubric' => rubric,
      'examples' => examples.to_json,
      'api-key' => CDO.openai_evaluate_rubric_api_key,
      )
  end

  def self.validate_ai_config
    lesson_s3_names = UNIT_AND_LEVEL_TO_LESSON_S3_NAME.values.map(&:values).flatten.uniq
    code = 'hello world'
    lesson_s3_names.each do |lesson_s3_name|
      validate_ai_config_for_lesson(lesson_s3_name, code)
    end
    validate_learning_goals
    S3_AI_RELEASE_PATH
  end

  def self.get_s3_learning_goals(lesson_s3_name)
    rubric_csv = read_file_from_s3(lesson_s3_name, 'standard_rubric.csv')
    rubric_rows = CSV.parse(rubric_csv, headers: true).map(&:to_h)
    rubric_rows.map {|row| row['Key Concept']}
  end

  private_class_method def self.validate_ai_config_for_lesson(lesson_s3_name, code)
    # this step should raise an error if any essential config files are missing
    # from the S3 release directory
    get_openai_params(lesson_s3_name, code)
  rescue Aws::S3::Errors::NoSuchKey => exception
    raise "Error validating AI config for lesson #{lesson_s3_name}: #{exception.message}\n request params: #{exception.context.params.to_h}"
  end

  # For each lesson in UNIT_AND_LEVEL_TO_LESSON_S3_NAME, validate that every
  # ai-enabled learning goal in its rubric in the database has a corresponding
  # learning goal in the rubric in S3.
  private_class_method def self.validate_learning_goals
    UNIT_AND_LEVEL_TO_LESSON_S3_NAME.each do |unit_name, level_to_lesson|
      levels = level_to_lesson.keys
      unless Unit.find_by_name(unit_name)
        raise "Unit not found: #{unit_name.inspect}. Make sure you ran `rake seed:scripts` locally, and added it to UI_TEST_SCRIPTS for drone/ci."
      end
      levels.each do |level_name|
        level = Level.find_by_name!(level_name)
        script_level = level.script_levels.select {|sl| sl.script.name == unit_name}.first
        lesson = script_level.lesson
        rubric = Rubric.find_by!(lesson: lesson, level: level)
        validate_learning_goals_for_rubric(rubric)
      rescue StandardError => exception
        raise "Error validating learning goals for unit #{unit_name} lesson #{lesson&.relative_position.inspect} level #{level_name.inspect}: #{exception.message}"
      end
    end
  end

  private_class_method def self.validate_learning_goals_for_rubric(rubric)
    lesson_s3_name = get_lesson_s3_name(rubric.get_script_level)
    db_learning_goals = rubric.learning_goals.select(&:ai_enabled).map(&:learning_goal)
    s3_learning_goals = get_s3_learning_goals(lesson_s3_name)
    missing_learning_goals = db_learning_goals - s3_learning_goals
    if missing_learning_goals.any?
      raise "Missing AI config in S3 for lesson #{lesson_s3_name} learning goals: #{missing_learning_goals.inspect}"
    end
  end
end
