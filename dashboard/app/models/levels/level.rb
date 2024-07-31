# == Schema Information
#
# Table name: levels
#
#  id                    :integer          not null, primary key
#  game_id               :integer
#  name                  :string(255)      not null
#  created_at            :datetime
#  updated_at            :datetime
#  level_num             :string(255)
#  ideal_level_source_id :bigint           unsigned
#  user_id               :integer
#  properties            :text(4294967295)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id    (game_id)
#  index_levels_on_level_num  (level_num)
#  index_levels_on_name       (name)
#

require 'cdo/shared_constants'

class Level < ApplicationRecord
  include SharedConstants
  include Levels::LevelsWithinLevels

  belongs_to :game, optional: true
  has_and_belongs_to_many :concepts
  has_and_belongs_to_many :script_levels
  belongs_to :ideal_level_source, class_name: "LevelSource", optional: true # "see the solution" link uses this
  belongs_to :user, optional: true
  has_one :level_concept_difficulty, dependent: :destroy
  has_many :level_sources
  has_many :hint_view_requests
  has_many :rubrics, dependent: :destroy

  before_validation :strip_name
  before_destroy :remove_empty_script_levels

  validates_length_of :name, within: 1..70
  validate :reject_illegal_chars

  # Together, these validations prevent collisions between level keys, including
  # level keys which differ only by case, between all 3 categories of levels:
  # custom levels, DSLDefined levels, and deprecated blockly levels. For more
  # context on these categories and level keys, see:
  # https://docs.google.com/document/d/1rS1ekCEVU1Q49ckh2S9lfq0tQo-m-G5KJLiEalAzPts/edit
  validates_uniqueness_of :name, case_sensitive: false, conditions: -> {where(level_num: ['custom', nil])}
  validates_uniqueness_of :level_num, case_sensitive: true, scope: :game, conditions: -> {where.not(level_num: ['custom', nil])}

  validate :validate_game, on: [:create, :update]

  after_save {Services::LevelFiles.write_custom_level_file(self)}
  after_destroy {Services::LevelFiles.delete_custom_level_file(self)}

  accepts_nested_attributes_for :level_concept_difficulty, update_only: true

  include StiFactory
  include SerializedProperties
  include TextToSpeech

  serialized_attrs %w(
    video_key
    embed
    callout_json
    authored_hints
    instructions_important
    display_name
    map_reference
    reference_links
    name_suffix
    contained_level_names
    project_template_level_name
    hint_prompt_attempts_threshold
    short_instructions
    long_instructions
    dynamic_instructions
    rubric_key_concept
    rubric_performance_level_1
    rubric_performance_level_2
    rubric_performance_level_3
    rubric_performance_level_4
    mini_rubric
    encrypted
    editor_experiment
    teacher_markdown
    bubble_choice_description
    thumbnail_url
    start_libraries
    ai_tutor_available
    show_big_playspace
  )

  # Fix STI routing http://stackoverflow.com/a/9463495
  def self.model_name
    self < Level ? Level.model_name : super
  end

  # https://github.com/rails/rails/issues/3508#issuecomment-29858772
  # Include type in serialization.
  def serializable_hash(options = nil)
    super.merge 'type' => type
  end

  # Rails won't natively assign one-to-one association attributes for
  # us, even though we've specified accepts_nested_attributes_for above.
  # So, we must do it manually.
  def assign_attributes(new_attributes)
    attributes = new_attributes.stringify_keys

    concept_difficulty_attributes = attributes.delete('level_concept_difficulty')
    if concept_difficulty_attributes
      assign_nested_attributes_for_one_to_one_association(
        :level_concept_difficulty,
        concept_difficulty_attributes
      )
    end
    super(attributes)
  end

  def related_videos
    ([game.intro_video, specified_autoplay_video] + concepts.map(&:related_video)).compact.uniq
  end

  def specified_autoplay_video
    @@specified_autoplay_video ||= {}
    @@specified_autoplay_video[video_key + ":" + I18n.locale.to_s] ||= Video.current_locale.find_by_key(video_key) unless video_key.nil?
  end

  def summarize_concepts
    concepts.pluck(:name).map {|c| "'#{c}'"}.join(', ')
  end

  def summarize_concept_difficulty
    (level_concept_difficulty.try(:serializable_hash) || {}).to_json
  end

  def complete_toolbox(type)
    "<xml id='toolbox' style='display: none;'>#{toolbox(type)}</xml>"
  end

  # Overriden by different level types.
  def toolbox(type)
  end

  def spelling_bee?
    try(:skin) == 'letters'
  end

  def unplugged?
    game&.unplugged?
  end

  def finishable?
    !unplugged?
  end

  # This does not include DSL levels which also use teacher markdown
  # but access it in a different way
  def include_teacher_only_markdown_editor?
    uses_droplet? || is_a?(Blockly) || is_a?(ExternalLink) || is_a?(Weblab) || is_a?(CurriculumReference) || is_a?(StandaloneVideo)
  end

  def enable_scrolling?
    is_a?(Blockly)
  end

  def enable_examples?
    is_a?(Blockly)
  end

  # Overriden by different level types.
  def self.start_directions
  end

  # Overriden by different level types.
  def self.step_modes
  end

  # Overriden by different level types.
  def self.flower_types
  end

  # Overriden by different level types.
  def self.palette_categories
  end

  # Custom levels are built in levelbuilder. Legacy levels are defined in .js.
  # All custom levels will have a 'custom' level_num, except for DSLDefined levels.
  def custom?
    level_num == 'custom' || is_a?(DSLDefined)
  end

  def should_localize?
    custom? && !I18n.en?
  end

  def available_callouts(script_level)
    if custom?
      if callout_json.present?
        callouts_i18n = should_localize? ? I18n.t(name, scope: %i[data callouts], default: {}).with_indifferent_access : {}

        return JSON.parse(callout_json).map do |callout_definition|
          Callout.new(
            element_id: callout_definition['element_id'],
            localization_key: callout_definition['localization_key'],
            callout_text: callouts_i18n[callout_definition['localization_key']] || callout_definition['callout_text'],
            qtip_config: callout_definition['qtip_config'].try(:to_json),
            on: callout_definition['on']
          )
        end
      end
    elsif script_level
      # Legacy levels have callouts associated with the ScriptLevel, not Level.
      return script_level.callouts
    end
    []
  end

  # Input: xml level file definition
  # Output: Hash of level properties
  def load_level_xml(xml_node)
    hash = JSON.parse(xml_node.xpath('//../config').first.text)
    begin
      encrypted_properties = hash.delete('encrypted_properties')
      encrypted_notes = hash.delete('encrypted_notes')
      if encrypted_properties
        hash['properties'] =  Encryption.decrypt_object(encrypted_properties)
      end
      if encrypted_notes
        hash['notes'] = Encryption.decrypt_object(encrypted_notes)
      end
    rescue Encryption::KeyMissingError
      # developers and adhoc environments must be able to seed levels without properties_encryption_key
      non_ci_test = rack_env == :test && !CDO.ci && !CDO.chef_managed
      raise unless rack_env?(:development) || rack_env?(:adhoc) || non_ci_test
      puts "WARNING: level '#{name}' not seeded properly due to missing CDO.properties_encryption_key"
    end
    hash
  end

  def should_allow_pairing?(current_script_id)
    if type == "LevelGroup"
      return false
    end

    # A level could have multiple parents. Find the one associated with the current script.
    current_parent = parent_levels.find do |parent|
      parent.script_levels.find do |script|
        script&.script_id == current_script_id
      end
    end

    !(current_parent&.type == "LevelGroup")
  end

  def to_xml(options = {})
    builder = Nokogiri::XML::Builder.new do |xml|
      xml.send(type) do
        xml.config do
          hash = serializable_hash(include: :level_concept_difficulty).deep_dup
          hash = filter_level_attributes(hash)
          if encrypted?
            hash['encrypted_properties'] = Encryption.encrypt_object(hash.delete('properties'))
            hash['encrypted_notes'] = Encryption.encrypt_object(hash.delete('notes'))
          end
          xml.cdata(JSON.pretty_generate(hash.as_json))
        end
      end
    end
    builder.to_xml(PRETTY_PRINT)
  end

  PRETTY_PRINT = {save_with: Nokogiri::XML::Node::SaveOptions::NO_DECLARATION | Nokogiri::XML::Node::SaveOptions::FORMAT}

  def self.pretty_print_xml(xml_string)
    xml = Nokogiri::XML(xml_string, &:noblanks)
    xml.serialize(PRETTY_PRINT).strip
  end

  def filter_level_attributes(level_hash)
    %w(name id updated_at type solution_level_source_id ideal_level_source_id md5).each {|field| level_hash.delete field}
    level_hash.compact!
    level_hash
  end

  def report_bug_url(request)
    message = "Bug in Level #{name}\n#{request.url}\n#{request.user_agent}\n"
    "https://support.code.org/hc/en-us/requests/new?&tf_description=#{CGI.escape(message)}"
  end

  # Overriden in subclasses, provides a summary for rendering thumbnails on the
  # lesson extras page
  def summarize_as_bonus
    {}
  end

  TYPES_WITHOUT_IDEAL_LEVEL_SOURCE = [
    'Aichat', # no ideal solution
    'Ailab', # no ideal solution
    'Applab', # freeplay
    'Bounce', # no ideal solution
    'ContractMatch', # dsl defined, covered in dsl
    'CurriculumReference', # no user submitted content
    'Dancelab', # no ideal solution
    'DSLDefined', # dsl defined, covered in dsl
    'EvaluationMulti', # unknown
    'External', # dsl defined, covered in dsl
    'ExternalLink', # no user submitted content
    'Fish', # no ideal solution
    'FreeResponse', # no ideal solution
    'FrequencyAnalysis', # widget
    'Flappy', # no ideal solution
    'Gamelab', # freeplay
    'GoBeyond', # unknown
    'Javalab', # no ideal solution
    'Level', # base class
    'LevelGroup', # dsl defined, covered in dsl
    'Map', # no user submitted content
    'Match', # dsl defined, covered in dsl
    'Multi', # dsl defined, covered in dsl
    'Music', # no ideal solution
    'BubbleChoice', # dsl defined, covered in dsl
    'NetSim', # widget
    'Odometer', # widget
    'Panels', # no ideal solution
    'Pixelation', # widget
    'Poetry', # no ideal solution
    'PublicKeyCryptography', # widget
    'Pythonlab', # no ideal solution
    'ScriptCompletion', # unknown
    'StandaloneVideo', # no user submitted content
    'TextCompression', # widget
    'TextMatch', # dsl defined, covered in dsl
    'Unplugged', # no solutions
    'Vigenere', # widget
    'Weblab', # no ideal solution
    'Weblab2', # no ideal solution
    'Widget', # widget
  ].freeze
  TYPES_WITH_IDEAL_LEVEL_SOURCE = %w(
    Artist
    Blockly
    Calc
    Craft
    Eval
    Grid
    GamelabJr
    Karel
    Maze
    Studio
    StudioEC
    StarWarsGrid
  ).freeze

  def self.where_we_want_to_calculate_ideal_level_source
    where.not(type: TYPES_WITHOUT_IDEAL_LEVEL_SOURCE).
      where(ideal_level_source_id: nil).
      to_a.reject {|level| level.try(:free_play)}
  end

  def calculate_ideal_level_source_id
    ideal_level_source =
      level_sources.
        includes(:activities).
        max_by {|level_source| level_source.activities.where("test_result >= #{Activity::FREE_PLAY_RESULT}").count}

    update_attribute(:ideal_level_source_id, ideal_level_source.id) if ideal_level_source
  end

  def self.find_by_key(key)
    # this is the key used in the script files, as a way to uniquely
    # identify a level that can be defined by the .level file or in a
    # blockly levels.js. for example, from hourofcode.script:
    # level 'blockly:Maze:2_14'
    # level 'scrat 16'
    find_by(key_to_params(key))
  end

  def self.key_to_params(key)
    if key.start_with?('blockly:')
      _, game_name, level_num = key.split(':')
      {game_id: Game.by_name(game_name), level_num: level_num}
    else
      {name: key}
    end
  end

  # Returns whether this level is backed by a channel, whose id may
  # be passed to the client, typically to save and load user progress
  # on that level.
  def channel_backed?
    return false if try(:is_project_level)
    free_response_upload = is_a?(FreeResponse) && allow_user_uploads
    dance_party_free_play = is_a?(Dancelab) && try(:free_play?)
    project_template_level || free_response_upload || game.channel_backed? || dance_party_free_play
  end

  def key
    if level_num == 'custom' || level_num.nil?
      name
    else
      ["blockly", game.name, level_num].join(':')
    end
  end

  def strip_name
    self.name = name.to_s.strip unless name.nil?
  end

  def reject_illegal_chars
    if name&.match /[^A-Za-z0-9 !"&'()+,\-.:=?_|]/
      msg = "\"#{name}\" may only contain letters, numbers, spaces, " \
      "and the following characters: !\"&'()+,-.:=?_|"
      errors.add(:name, msg)
    end
  end

  # Uses specific knowledge of how the key method is implemented in hopes of
  # preventing any levels for which we can't compute a key.
  def validate_game
    unless ['custom', nil].include?(level_num) || game
      errors.add(:game, 'required for non-custom levels in order to compute level key')
    end
  end

  def log_changes(user = nil)
    return unless changed?

    log = JSON.parse(audit_log || "[]")

    # gather all field changes; if the properties JSON blob is one of the things
    # that changed, rather than including just 'properties' in the list, include
    # all of those attributes within properties that changed.
    latest_changes = changed.dup
    if latest_changes.include?('properties') && changed_attributes['properties']
      latest_changes.delete('properties')
      changed_attributes['properties'].each do |key, value|
        latest_changes.push(key) unless properties[key] == value
      end
    end

    entry = {
      changed_at: Time.now,
      changed: latest_changes
    }
    unless user.nil?
      entry[:changed_by_id] = user.id
      entry[:changed_by_email] = user.email
    end
    log.push(entry)

    # Because this ever-growing log is stored in a limited column and because we
    # will tend to care a lot less about older entries than newer ones, we will
    # here drop older entries until this log gets down to a reasonable size
    log.shift while JSON.dump(log).length >= 65535

    self.audit_log = JSON.dump(log)
  end

  def remove_empty_script_levels
    script_levels.each do |script_level|
      if script_level.levels.length == 1 && script_level.levels[0] == self
        script_level.destroy
      end
    end
  end

  def self.cache_find(id)
    Unit.cache_find_level(id)
  end

  def icon
  end

  # Level are either activity levels (default) or concept levels
  # An activity level is a one where a student has to complete an activity / puzzle.
  # - This includes programming levels, widget levels, unplugged activities, assessment levels, etc.
  # - These get circular progress bubbles
  # A concept level is one that introduces or discusses a concept.
  # - This includes video levels, external HTML levels, and map levels.
  # - These get diamond progress bubbles
  def concept_level?
    false
  end

  # Currently only Web Lab, Game Lab and App Lab levels can have teacher feedback
  def can_have_feedback?
    ["Applab", "Gamelab", "Weblab"].include?(type)
  end

  # Currently only Javalab can have code review
  def can_have_code_review?
    ["Javalab"].include?(type)
  end

  # We hide this feature for contained levels because contained levels are currently not
  # editable by students so setting the feedback review_state to keepWorking doesn't make sense.
  def can_have_feedback_review_state?
    contained_levels.empty?
  end

  def display_as_unplugged?
    # Levelbuilders can select if External/
    # Markdown levels should display as Unplugged.
    unplugged? || properties["display_as_unplugged"] == "true"
  end

  def ai_tutor_available?
    properties["ai_tutor_available"] == "true"
  end

  def summarize
    {
      level_id: id.to_s,
      type: self.class.to_s,
      name: name,
      display_name: display_name,
      is_validated: validated?,
      can_have_feedback: can_have_feedback?
    }
  end

  def summarize_for_edit
    {
      id: id.to_s,
      type: self.class.to_s,
      name: key,
      updated_at: updated_at.localtime.strftime("%D at %r"),
      owner: user&.name,
      url: "/levels/#{id}/edit",
      icon: icon,
      key: key,
      kind: unplugged? ? LEVEL_KIND.unplugged : LEVEL_KIND.puzzle,
      title: try(:title),
      isUnplugged: display_as_unplugged?,
      isConceptLevel: concept_level?,
      sublevels: try(:sublevels),
      skin: try(:skin),
      videoKey: video_key,
      concepts: summarize_concepts,
      conceptDifficulty: summarize_concept_difficulty
    }
  end

  def summary_for_lesson_plans
    summary = summarize

    %w(title questions answers short_instructions long_instructions markdown teacher_markdown pages reference
       rubric_key_concept rubric_performance_level_1 rubric_performance_level_2 rubric_performance_level_3 rubric_performance_level_4 mini_rubric).each do |key|
      value = properties[key] || try(key)
      summary[key] = value if value
    end
    if video_key
      summary[:video_youtube] = specified_autoplay_video.youtube_url
      summary[:video_download] = specified_autoplay_video.download
    end

    unless contained_levels.empty?
      summary[:contained_levels] = contained_levels.map(&:summary_for_lesson_plans)
    end

    summary
  end

  # Overriden by some child classes
  def get_question_text
    long_instructions
  end

  # Used for individual levels in assessments
  def question_summary
    summary = summarize

    %w(title answers).each do |key|
      value = properties[key] || try(key)
      summary[key] = value if value
    end

    summary[:question_text] = get_question_text

    summary
  end

  def uses_droplet?
    false
  end

  def uses_google_blockly?
    false
  end

  def uses_lab2?
    false
  end

  def deprecated?
    false
  end

  # Create a copy of this level named new_name
  # @param [String] new_name
  # @param [String] editor_experiment
  # @raise [ActiveRecord::RecordInvalid] if the new name already is taken.
  def clone_with_name(new_name, editor_experiment: nil)
    level = dup
    # specify :published to make should_write_custom_level_file? return true
    level_params = {name: new_name, published: true}
    level_params[:editor_experiment] = editor_experiment if editor_experiment
    level_params[:audit_log] = [{changed_at: Time.now, changed: ["cloned from #{name.dump}"], cloned_from: name}].to_json
    level.update!(level_params)
    level
  end

  # Create a copy of this level by appending new_suffix to the name, removing
  # any previous suffix from the name first and storing the suffix in
  # name_suffix. If a level with the same name already exists, us that instead
  # of creating a new one.
  #
  # Also, copy over any project template level. If two levels with the same
  # project template level are copied using the same new_suffix, then the new
  # levels should both point to the same new project template level.
  #
  # @param [String] new_suffix The suffix to append to the name of the original
  #   level when choosing a name for the new level, replacing any existing
  #   name_suffix if one exists.
  # @param [String] editor_experiment Optional value to set the
  #   editor_experiment property to on the newly-created level.
  # @param [Boolean] allow_existing Whether to return an existing level if one
  #   with a matching name is found. If false, the suffix will be modified to
  #   make the new name unique.
  def clone_with_suffix(new_suffix, editor_experiment: nil, allow_existing: true)
    # explicitly don't clone blockly levels (will cause a validation failure on non-unique level_num)
    return self if key.start_with?('blockly:')

    # Make sure we don't go over the 70 character limit.
    suffix = new_suffix[0] == '_' ? new_suffix : "_#{new_suffix}"
    max_index = 70 - suffix.length - 1
    prefix = base_name[0..max_index]
    new_name = "#{prefix}#{suffix}"

    level = Level.find_by_name(new_name)
    if level
      return level if allow_existing
      new_name = next_unused_name_for_copy(suffix)
    end

    begin
      level = clone_with_name(new_name, editor_experiment: editor_experiment)

      update_params = {name_suffix: suffix}
      update_params[:editor_experiment] = editor_experiment if editor_experiment

      # Cloning of level group sublevels is handled by
      # LevelGroup.clone_sublevels_with_suffix. In order to be able to customize
      # that cloning logic, we must skip initially cloning child levels here.
      unless is_a? LevelGroup
        child_params_to_update = Level.clone_child_levels(level, new_suffix, editor_experiment: editor_experiment)
        update_params.merge!(child_params_to_update)
      end

      level.update!(update_params)

      # Copy the level_concept_difficulty of the parent level to the new level
      new_lcd = level_concept_difficulty.dup
      level.level_concept_difficulty = new_lcd
      # trigger a save to rewrite the custom level file
      level.save!

      level
    rescue Exception => exception
      raise exception, "Failed to clone Level #{name.inspect} as #{new_name.inspect}. Message:\n#{exception.message}", exception.backtrace
    end
  end

  COPY_SUFFIX_LENGTH = 8 # '_copy999'.length

  # Returns the first level name of the form "<base_name>_copy<num>_<suffix>" which
  # is not already used by another level.
  # @param [String] suffix
  def next_unused_name_for_copy(suffix)
    # Make sure we don't go over the 70 character limit.
    max_index = 70 - COPY_SUFFIX_LENGTH - suffix.length - 1
    prefix = base_name[0..max_index]

    i = 1
    loop do
      new_name = "#{prefix}_copy#{i}#{suffix}"
      level = Level.find_by_name(new_name)
      return new_name unless level
      i += 1
    end
  end

  def age_13_required?
    false
  end

  def show_help_and_tips_in_level_editor?
    (uses_droplet? || is_a?(Blockly) || is_a?(Weblab) || is_a?(Ailab) || is_a?(Javalab)) &&
      !(is_a?(NetSim) || is_a?(GamelabJr) || is_a?(Dancelab) || is_a?(BubbleChoice))
  end

  def localized_teacher_markdown
    if should_localize?
      I18n.t(
        name,
        scope: [:data, "teacher_markdown"],
        default: properties['teacher_markdown'],
        smart: true
      )
    else
      properties['teacher_markdown']
    end
  end

  def localized_rubric_property(property)
    if should_localize?
      I18n.t(
        property,
        scope: [:data, :mini_rubric, name],
        default: properties[property],
        smart: true
      )
    else
      properties[property]
    end
  end

  def localized_validations
    if should_localize?
      validations_clone = validations.map(&:clone)
      validations_clone.each do |validation|
        validation['message'] = I18n.t(
          validation["key"],
          scope: [:data, :validations, name],
          default: validation["message"],
          smart: true
        )
      end
      validations_clone
    else
      validations
    end
  end

  def localized_panels
    if should_localize?
      panels_clone = panels.map(&:clone)
      panels_clone.each do |panel|
        panel['text'] = I18n.t(
          panel["key"],
          scope: [:data, :panels, name],
          default: panel["text"],
          smart: true
        )
      end
      panels_clone
    else
      panels
    end
  end

  # FND-985 Create shared API to get localized level properties.
  def get_localized_property(property_name)
    if should_localize? && try(property_name)
      I18n.t(
        name,
        scope: [:data, property_name],
        default: nil,
        smart: true
      )
    end
  end

  # There's a bit of trickery here. We consider a level to be
  # hint_prompt_enabled for the sake of the level editing experience if any of
  # the scripts associated with the level are hint_prompt_enabled.
  def hint_prompt_enabled?
    script_levels.map(&:script).any?(&:hint_prompt_enabled?)
  end

  # Define search filter fields
  def self.search_options
    {
      levelOptions: [
        ['All types', ''],
        *LevelsController::LEVEL_CLASSES.map {|x| [x.name, x.name]}.push(['Blockly', 'Blockly']).sort_by {|a| a[0]}
      ],
      scriptOptions: [
        ['All scripts', ''],
        *Unit.all_scripts.pluck(:name, :id).sort_by {|a| a[0]}
      ],
      ownerOptions: [
        ['Any owner', ''],
        *Level.joins(:user).distinct.pluck('users.name, users.id').select {|a| a[0].present? && a[1].present?}.sort_by {|a| a[0]}
      ]
    }
  end

  def get_level_for_progress(student = nil, script = nil)
    # https://github.com/code-dot-org/code-dot-org/blob/staging/dashboard/app/views/levels/_contained_levels.html.haml#L1
    # We only display our first contained level, display progress for that level.
    contained_levels.first || self
  end

  def summarize_for_lesson_show(can_view_teacher_markdown)
    teacher_markdown_for_display = localized_teacher_markdown if can_view_teacher_markdown
    {
      name: name,
      id: id.to_s,
      icon: icon,
      type: type,
      isConceptLevel: concept_level?,
      longInstructions: long_instructions,
      shortInstructions: short_instructions,
      videos: related_videos.map(&:summarize),
      mapReference: map_reference,
      referenceLinks: reference_links,
      teacherMarkdown: teacher_markdown_for_display,
      videoOptions: specified_autoplay_video&.summarize(false),
      containedLevels: contained_levels.map {|l| l.summarize_for_lesson_show(can_view_teacher_markdown)},
      status: SharedConstants::LEVEL_STATUS.not_tried,
      thumbnailUrl: thumbnail_url
    }
  end

  # Summarize the properties for a lab2 level.
  # Called by ScriptLevelsController.level_properties.
  # These properties are usually just the serialized properties for
  # the level, which usually include levelData.  If this level is a
  # StandaloneVideo then we put its properties into levelData.
  def summarize_for_lab2_properties(script, script_level = nil, current_user = nil)
    video = specified_autoplay_video&.summarize(false)&.camelize_keys
    properties_camelized = properties.camelize_keys
    properties_camelized[:id] = id
    properties_camelized[:levelData] = video if video
    properties_camelized[:type] = type
    properties_camelized[:appName] = game&.app
    properties_camelized[:useRestrictedSongs] = game.use_restricted_songs?
    properties_camelized[:usesProjects] = try(:is_project_level) || channel_backed?

    if try(:project_template_level).try(:start_sources)
      properties_camelized['templateSources'] = try(:project_template_level).try(:start_sources)
    end
    # Localized properties
    properties_camelized["validations"] = localized_validations if properties_camelized["validations"]
    properties_camelized["panels"] = localized_panels if properties_camelized["panels"]
    properties_camelized["longInstructions"] = (get_localized_property("long_instructions") || long_instructions) if properties_camelized["longInstructions"]
    if script_level
      properties_camelized[:exampleSolutions] = script_level.get_example_solutions(self, current_user, nil)
    end
    if current_user&.verified_instructor? || current_user&.permission?(UserPermission::LEVELBUILDER)
      # Verified instructors can view exemplars and levelbuilders can edit them, so we include them in the properties
      # for these users.
      properties_camelized[:exemplarSources] = try(:exemplar_sources)
    else
      # Users who are not verified teachers or levelbuilders should not be able to see predict level solutions
      properties_camelized["predictSettings"]&.delete("solution")
      properties_camelized["predictSettings"]&.delete("multipleChoiceAnswers")
    end
    properties_camelized
  end

  def project_type
    return game&.app
  end

  # Whether this level has validation for the completion of student work.
  def validated?
    if uses_lab2?
      return properties.dig('level_data', 'validations').present?
    end
    properties['validation_code'].present? || properties['success_condition'].present?
  end

  def predict_level?
    return properties.dig('predict_settings', 'isPredictLevel').present?
  end

  # Returns the level name, removing the name_suffix first (if present), and
  # also removing any additional suffixes of the format "_NNNN" which might
  # represent a version year.
  private def base_name
    base_name = name
    if name_suffix
      strip_suffix_regex = /^(.*)#{Regexp.escape(name_suffix)}$/
      base_name = name[strip_suffix_regex, 1] || name
    end
    base_name = strip_version_year_suffixes(base_name)
    base_name
  end

  # repeatedly strip any version year suffix of the form _NNNN or -NNNN ()e.g. _2017 or -2017)
  # from the input string.
  private def strip_version_year_suffixes(str)
    year_suffix_regex = /^(.*)[_-][0-9]{4}$/
    loop do
      matchdata = str.match(year_suffix_regex)
      break unless matchdata
      str = matchdata.captures.first
    end
    str
  end
end
