class ScriptDSL < BaseDSL
  def initialize
    super
    @id = nil
    @lesson_groups = []
    @concepts = []
    @skin = nil
    @current_scriptlevel = nil
    @video_key_for_next_level = nil
    @hidden = true
    @login_required = false
    @hideable_lessons = false
    @student_detail_progress_view = false
    @teacher_resources = []
    @lesson_extras_available = false
    @project_widget_visible = false
    @has_verified_resources = false
    @has_lesson_plan = false
    @curriculum_path = nil
    @project_widget_types = []
    @wrapup_video = nil
    @script_announcements = nil
    @new_name = nil
    @family_name = nil
    @version_year = nil
    @is_stable = nil
    @supported_locales = []
    @pilot_experiment = nil
    @editor_experiment = nil
    @project_sharing = nil
    @curriculum_umbrella = nil
    @tts = false
    @is_course = false
  end

  integer :id
  string :professional_learning_course
  integer :peer_reviews_to_complete

  boolean :hidden
  boolean :login_required
  boolean :hideable_lessons
  boolean :student_detail_progress_view
  boolean :lesson_extras_available
  boolean :project_widget_visible
  boolean :has_verified_resources
  boolean :has_lesson_plan
  boolean :is_stable
  boolean :project_sharing
  boolean :tts
  boolean :is_course

  string :wrapup_video
  string :script_announcements
  string :new_name
  string :family_name
  string :version_year
  string :curriculum_path
  string :pilot_experiment
  string :editor_experiment
  string :curriculum_umbrella

  def teacher_resources(resources)
    @teacher_resources = resources
  end

  def project_widget_types(types)
    @project_widget_types = types
  end

  def supported_locales(locales)
    @supported_locales = locales
  end

  def pilot_experiment(experiment)
    @pilot_experiment = experiment
  end

  def lesson_group(key, properties = {})
    if key
      @lesson_groups << {
        key: key,
        display_name: properties[:display_name],
        description: "",
        big_questions: [],
        lessons: []
      }.compact
    end
  end

  def lesson_group_description(description)
    current_lesson_group = @lesson_groups.length - 1
    @lesson_groups[current_lesson_group][:description] = description
  end

  def lesson_group_question(question)
    current_lesson_group = @lesson_groups.length - 1
    @lesson_groups[current_lesson_group][:big_questions] << question
  end

  def lesson(name, properties = {})
    # For scripts that don't use lesson groups create a blank non-user facing lesson group
    if name
      if @lesson_groups.empty?
        @lesson_groups << {
          key: nil,
          display_name: nil,
          lessons: []
        }
      end

      @lesson_groups.last[:lessons] << {
        name: name,
        lockable: properties[:lockable],
        visible_after: determine_visible_after_time(properties[:visible_after]),
        script_levels: []
      }.compact
    end
  end

  # If visible_after value is blank default to next wednesday at 8am PDT
  # Otherwise use the supplied time
  def determine_visible_after_time(visible_after_value)
    if visible_after_value == ''
      current_time = Time.now
      raw_diff_to_wed = 3 - current_time.wday
      # Make sure it is the next wednesday not the one that just passed
      diff_to_next_wed = raw_diff_to_wed % 7
      next_wednesday = current_time + diff_to_next_wed.day
      visible_after_value = Time.new(next_wednesday.year, next_wednesday.month, next_wednesday.day, 8, 0, 0, '-07:00').to_s
    end

    visible_after_value
  end

  def parse_output
    lesson(nil)
    {
      id: @id,
      hidden: @hidden,
      wrapup_video: @wrapup_video,
      login_required: @login_required,
      hideable_lessons: @hideable_lessons,
      student_detail_progress_view: @student_detail_progress_view,
      professional_learning_course: @professional_learning_course,
      peer_reviews_to_complete: @peer_reviews_to_complete,
      teacher_resources: @teacher_resources,
      lesson_extras_available: @lesson_extras_available,
      has_verified_resources: @has_verified_resources,
      has_lesson_plan: @has_lesson_plan,
      curriculum_path: @curriculum_path,
      project_widget_visible: @project_widget_visible,
      project_widget_types: @project_widget_types,
      script_announcements: @script_announcements,
      new_name: @new_name,
      family_name: @family_name,
      version_year: @version_year,
      is_stable: @is_stable,
      supported_locales: @supported_locales,
      pilot_experiment: @pilot_experiment,
      editor_experiment: @editor_experiment,
      project_sharing: @project_sharing,
      curriculum_umbrella: @curriculum_umbrella,
      tts: @tts,
      lesson_groups: @lesson_groups,
      is_course: @is_course
    }
  end

  def concepts(*items)
    @concepts = items
  end

  def level_concept_difficulty(json)
    @level_concept_difficulty = json ? JSON.parse(json) : {}
  end

  string :skin
  string :video_key_for_next_level

  # If someone forgets we moved away from assessment as level type and puts
  # assessment as level type it will just nicely convert allow us to not fail but
  # it will convert it for the future to use the assessment: true syntax
  def assessment(name, properties = {})
    properties[:assessment] = true
    level(name, properties)
  end

  # If someone forgets we moved away from named_level and puts
  # named_level it will just nicely convert allow us to not fail but
  # it will convert it for the future to use the named: true syntax
  def named_level(name, properties = {})
    properties[:named_level] = true
    level(name, properties)
  end

  def bonus(name, properties = {})
    properties[:bonus] = true
    level(name, properties)
  end

  def level(name, properties = {})
    active = properties.delete(:active)
    progression = properties.delete(:progression)
    challenge = properties.delete(:challenge)
    experiments = properties.delete(:experiments)
    assessment = properties.delete(:assessment)

    named = properties.delete(:named)
    bonus = properties.delete(:bonus)

    level = {
      name: name,
      skin: @skin,
      concepts: @concepts.join(','),
      level_concept_difficulty: @level_concept_difficulty || {},
      video_key: @video_key_for_next_level
    }.merge(properties).select {|_, v| v.present?}
    @video_key_for_next_level = nil

    # Having @current_scriptlevel implies we're a level inside of a variants block
    if @current_scriptlevel
      @current_scriptlevel[:levels] << level

      levelprops = {}

      # Experiment levels are inactive unless explicitly marked active, which
      # is the opposite of normal levels. (Normally if you add a level variant
      # for an experiment group, you want everyone else to get the other level)
      active = false if !experiments.nil? && active.nil?

      levelprops[:active] = active if active == false
      levelprops[:experiments] = experiments if experiments.try(:any?)
      unless levelprops.empty?
        @current_scriptlevel[:properties][:variants] ||= {}
        @current_scriptlevel[:properties][:variants][name] = levelprops
      end

      @current_scriptlevel[:assessment] = assessment if assessment
      @current_scriptlevel[:bonus] = bonus if bonus
      @current_scriptlevel[:named_level] = named if named

      if progression
        # Variant levels must always have the same progression (or no progression)
        current_progression = @current_scriptlevel[:properties][:progression]
        if current_progression && current_progression != progression
          raise 'Variants levels must have the same progression'
        end
        @current_scriptlevel[:properties][:progression] = progression
      end

      @current_scriptlevel[:properties][:challenge] = challenge if challenge
    else
      script_level = {
        levels: [level]
      }

      script_level[:assessment] = assessment if assessment
      script_level[:bonus] = bonus if bonus
      script_level[:named_level] = named if named

      if progression || challenge
        script_level[:properties] = {}
        script_level[:properties][:progression] = progression if progression
        script_level[:properties][:challenge] = true if challenge
      end

      current_lesson_group = @lesson_groups.length - 1
      current_lesson = @lesson_groups[current_lesson_group][:lessons].length - 1
      @lesson_groups[current_lesson_group][:lessons][current_lesson][:script_levels] << script_level
    end
  end

  def variants
    @current_scriptlevel = {levels: [], properties: {}}
  end

  def endvariants
    @lesson_groups.last[:lessons].last[:script_levels] << @current_scriptlevel
    @current_scriptlevel = nil
  end

  # @override
  def i18n_hash
    i18n_lesson_strings = {}
    i18n_lesson_group_strings = {}
    @lesson_groups.each do |lesson_group|
      if lesson_group[:key]
        i18n_lesson_group_strings[lesson_group[:key]] = {'display_name' => lesson_group[:display_name]}
      end
      lesson_group[:lessons].each do |lesson|
        i18n_lesson_strings[lesson[:name]] = {'name' => lesson[:name]}
      end
    end

    {@name => {
      'lessons' => i18n_lesson_strings,
      'lesson_groups' => i18n_lesson_group_strings
    }}
  end

  def self.parse_file(filename, name = nil)
    super(filename, name || File.basename(filename, '.script'))
  end

  def self.serialize(script, filename)
    File.write(filename, serialize_to_string(script))
  end

  def self.serialize_to_string(script)
    s = []
    # Legacy script IDs
    legacy_script_ids = {
      '20-hour': 1,
      'Hour of Code': 2,
      'edit-code': 3,
      events: 4,
      flappy: 6,
      jigsaw: 7,
    }.with_indifferent_access
    s << "id '#{legacy_script_ids[script.name]}'" if legacy_script_ids[script.name]

    s << "professional_learning_course '#{script.professional_learning_course}'" if script.professional_learning_course
    s << "peer_reviews_to_complete #{script.peer_reviews_to_complete}" if script.peer_reviews_to_complete.try(:>, 0)

    s << 'hidden false' unless script.hidden
    s << 'login_required true' if script.login_required
    s << 'hideable_lessons true' if script.hideable_lessons
    s << 'student_detail_progress_view true' if script.student_detail_progress_view
    s << "wrapup_video '#{script.wrapup_video.key}'" if script.wrapup_video
    s << "teacher_resources #{script.teacher_resources}" if script.teacher_resources
    s << 'lesson_extras_available true' if script.lesson_extras_available
    s << 'has_verified_resources true' if script.has_verified_resources
    s << 'has_lesson_plan true' if script.has_lesson_plan
    s << "curriculum_path '#{script.curriculum_path}'" if script.curriculum_path
    s << 'project_widget_visible true' if script.project_widget_visible
    s << "project_widget_types #{script.project_widget_types}" if script.project_widget_types
    s << "script_announcements #{script.script_announcements}" if script.script_announcements
    s << "new_name '#{script.new_name}'" if script.new_name
    s << "family_name '#{script.family_name}'" if script.family_name
    s << "version_year '#{script.version_year}'" if script.version_year
    s << 'is_stable true' if script.is_stable
    s << "supported_locales #{script.supported_locales}" if script.supported_locales
    s << "pilot_experiment '#{script.pilot_experiment}'" if script.pilot_experiment
    s << "editor_experiment '#{script.editor_experiment}'" if script.editor_experiment
    s << 'project_sharing true' if script.project_sharing
    s << "curriculum_umbrella '#{script.curriculum_umbrella}'" if script.curriculum_umbrella
    s << 'tts true' if script.tts
    s << 'is_course true' if script.is_course

    s << '' unless s.empty?
    s << serialize_lesson_groups(script)
    s.join("\n")
  end

  def self.serialize_lesson_groups(script)
    s = []
    script.lesson_groups.each do |lesson_group|
      if lesson_group&.user_facing && !lesson_group.lessons.empty?
        t = "lesson_group '#{escape(lesson_group.key)}'"
        t += ", display_name: '#{escape(lesson_group.display_name)}'" if lesson_group.display_name
        s << t
        s << "lesson_group_description '#{escape(lesson_group.description)}'" if lesson_group.description
        lesson_group.big_questions&.each do |big_question|
          s << "lesson_group_question '#{escape(big_question)}'"
        end

      end
      lesson_group.lessons.each do |lesson|
        s << serialize_lesson(lesson)
      end
    end
    s << ''
    s.join("\n")
  end

  def self.serialize_lesson(lesson)
    s = []

    t = "lesson '#{escape(lesson.name)}'"
    t += ', lockable: true' if lesson.lockable
    t += ", visible_after: '#{escape(lesson.visible_after)}'" if lesson.visible_after
    s << t
    lesson.script_levels.each do |sl|
      type = 'level'
      type = 'bonus' if sl.bonus

      if sl.levels.count > 1
        s << 'variants'
        sl.levels.each do |level|
          s.concat(
            serialize_level(
              level,
              type,
              sl.active?(level),
              sl.progression,
              sl.named_level?,
              sl.challenge,
              sl.assessment,
              sl.experiments(level)
            ).map {|l| l.indent(2)}
          )
        end
        s << 'endvariants'
      else
        s.concat(serialize_level(sl.level, type, nil, sl.progression, sl.named_level?, sl.challenge, sl.assessment))
      end
    end
    s << ''
    s.join("\n")
  end

  def self.serialize_level(
    level,
    type,
    active = nil,
    progression = nil,
    named = nil,
    challenge = nil,
    assessment = nil,
    experiments = []
  )
    s = []
    if level.key.start_with? 'blockly:'
      s << "skin '#{level.skin}'" if level.try(:skin)
      s << "video_key_for_next_level '#{level.video_key}'" if level.video_key

      unless level.concepts.empty?
        s << "concepts #{level.summarize_concepts}"
      end

      s << "level_concept_difficulty '#{level.summarize_concept_difficulty}'" if level.level_concept_difficulty
    end
    l = "#{type} '#{escape(level.key)}'"
    l += ', active: false' if experiments.empty? && active == false
    l += ', active: true' if experiments.any? && (active == true || active.nil?)
    l += ", experiments: #{experiments.to_json}" if experiments.any?
    l += ", progression: '#{escape(progression)}'" if progression
    l += ', named: true' if named
    l += ', assessment: true' if assessment
    l += ', challenge: true' if challenge
    s << l
    s
  end

  def self.escape(str)
    str.gsub("'") {"\\'"}
  end
end
