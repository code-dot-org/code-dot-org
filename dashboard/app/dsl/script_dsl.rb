class ScriptDSL < BaseDSL
  def initialize
    super
    @id = nil
    @stage = nil
    @stage_flex_category = nil
    @stage_lockable = false
    @concepts = []
    @skin = nil
    @current_scriptlevel = nil
    @scriptlevels = []
    @stages = []
    @video_key_for_next_level = nil
    @hidden = true
    @login_required = false
    @hideable_stages = false
    @exclude_csf_column_in_legend = false
    @student_detail_progress_view = false
    @teacher_resources = []
    @stage_extras_available = false
    @project_widget_visible = false
    @has_verified_resources = false
    @has_lesson_plan = false
    @project_widget_types = []
    @wrapup_video = nil
    @script_announcements = nil
  end

  integer :id
  string :professional_learning_course
  integer :peer_reviews_to_complete

  boolean :hidden
  boolean :login_required
  boolean :hideable_stages
  boolean :exclude_csf_column_in_legend
  boolean :student_detail_progress_view
  boolean :stage_extras_available
  boolean :project_widget_visible
  boolean :has_verified_resources
  boolean :has_lesson_plan

  string :wrapup_video
  string :script_announcements

  def teacher_resources(resources)
    @teacher_resources = resources
  end

  def project_widget_types(types)
    @project_widget_types = types
  end

  def stage(name, properties = {})
    if @stage
      @stages << {
        stage: @stage,
        scriptlevels: @scriptlevels,
        stage_extras_disabled: @stage_extras_disabled,
      }.compact
    end
    @stage = name
    @stage_flex_category = properties[:flex_category]
    @stage_lockable = properties[:lockable]
    @scriptlevels = []
    @concepts = []
    @skin = nil
    @stage_extras_disabled = nil
  end

  def parse_output
    stage(nil)
    {
      id: @id,
      stages: @stages,
      hidden: @hidden,
      wrapup_video: @wrapup_video,
      login_required: @login_required,
      hideable_stages: @hideable_stages,
      exclude_csf_column_in_legend: @exclude_csf_column_in_legend,
      student_detail_progress_view: @student_detail_progress_view,
      professional_learning_course: @professional_learning_course,
      peer_reviews_to_complete: @peer_reviews_to_complete,
      teacher_resources: @teacher_resources,
      stage_extras_available: @stage_extras_available,
      has_verified_resources: @has_verified_resources,
      has_lesson_plan: @has_lesson_plan,
      project_widget_visible: @project_widget_visible,
      project_widget_types: @project_widget_types,
      script_announcements: @script_announcements,
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

  def assessment(name, properties = {})
    properties[:assessment] = true
    level(name, properties)
  end

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
    target = properties.delete(:target)
    challenge = properties.delete(:challenge)
    experiments = properties.delete(:experiments)

    level = {
      name: name,
      stage_flex_category: @stage_flex_category,
      stage_lockable: @stage_lockable,
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

      if progression
        # Variant levels must always have the same progression (or no progression)
        current_progression = @current_scriptlevel[:properties][:progression]
        if current_progression && current_progression != progression
          raise 'Variants levels must have the same progression'
        end
        @current_scriptlevel[:properties][:progression] = progression
      end
      if challenge
        @current_scriptlevel[:properties][:challenge] = challenge
      end
    else
      script_level = {
        stage: @stage,
        levels: [level]
      }

      if progression || target || challenge
        script_level[:properties] = {}
        script_level[:properties][:progression] = progression if progression
        script_level[:properties][:target] = true if target
        script_level[:properties][:challenge] = true if challenge
      end

      @scriptlevels << script_level
    end
  end

  def variants
    @current_scriptlevel = {levels: [], properties: {}, stage: @stage}
  end

  def endvariants
    @scriptlevels << @current_scriptlevel
    @current_scriptlevel = nil
  end

  def no_extras
    @stage_extras_disabled = true
  end

  def i18n_strings
    i18n_strings = {}
    @stages.each do |stage|
      i18n_strings[stage[:stage]] = {'name' => stage[:stage]}
    end

    {'name' => {@name => {'stages' => i18n_strings}}}
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
    s << 'hideable_stages true' if script.hideable_stages
    s << 'exclude_csf_column_in_legend true' if script.exclude_csf_column_in_legend
    s << 'student_detail_progress_view true' if script.student_detail_progress_view
    s << "wrapup_video '#{script.wrapup_video.key}'" if script.wrapup_video
    s << "teacher_resources #{script.teacher_resources}" if script.teacher_resources
    s << 'stage_extras_available true' if script.stage_extras_available
    s << 'has_verified_resources true' if script.has_verified_resources
    s << 'has_lesson_plan true' if script.has_lesson_plan
    s << 'project_widget_visible true' if script.project_widget_visible
    s << "project_widget_types #{script.project_widget_types}" if script.project_widget_types
    s << "script_announcements #{script.script_announcements}" if script.script_announcements

    s << '' unless s.empty?
    s << serialize_stages(script)
    s.join("\n")
  end

  def self.serialize_stages(script)
    s = []
    script.stages.each do |stage|
      t = "stage '#{stage.name}'"
      t += ', lockable: true' if stage.lockable
      t += ", flex_category: '#{stage.flex_category}'" if stage.flex_category
      s << t
      stage.script_levels.each do |sl|
        type = 'level'
        type = 'assessment' if sl.assessment
        type = 'named_level' if sl.named_level
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
                sl.target,
                sl.challenge,
                sl.experiments(level)
              ).map {|l| l.indent(2)}
            )
          end
          s << 'endvariants'
        else
          s.concat(serialize_level(sl.level, type, nil, sl.progression, sl.target, sl.challenge))
        end
      end
      s << 'no_extras' if stage.stage_extras_disabled
      s << ''
    end
    s.join("\n")
  end

  def self.serialize_level(
    level,
    type,
    active = nil,
    progression = nil,
    target = nil,
    challenge = nil,
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
    l = "#{type} '#{level.key.gsub("'") {"\\'"}}'"
    l += ', active: false' if experiments.empty? && active == false
    l += ', active: true' if experiments.any? && (active == true || active.nil?)
    l += ", experiments: #{experiments.to_json}" if experiments.any?
    l += ", progression: '#{progression}'" if progression
    l += ', target: true' if target
    l += ', challenge: true' if challenge
    s << l
    s
  end
end
