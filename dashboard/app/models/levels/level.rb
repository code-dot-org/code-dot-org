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
#  ideal_level_source_id :integer          unsigned
#  user_id               :integer
#  properties            :text(65535)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id  (game_id)
#  index_levels_on_name     (name)
#

class Level < ActiveRecord::Base
  belongs_to :game
  has_and_belongs_to_many :concepts
  has_and_belongs_to_many :script_levels
  belongs_to :ideal_level_source, class_name: "LevelSource" # "see the solution" link uses this
  belongs_to :user
  has_one :level_concept_difficulty, dependent: :destroy
  has_many :level_sources
  has_many :hint_view_requests

  before_validation :strip_name
  before_destroy :remove_empty_script_levels

  validates_length_of :name, within: 1..70
  validates_uniqueness_of :name, case_sensitive: false, conditions: -> {where.not(user_id: nil)}

  after_save :write_custom_level_file
  after_save :update_key_list
  after_destroy :delete_custom_level_file

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
    parent_level_id
    hint_prompt_attempts_threshold
    short_instructions
    long_instructions
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
    starter_assets
  )

  # Fix STI routing http://stackoverflow.com/a/9463495
  def self.model_name
    self < Level ? Level.model_name : super
  end

  # https://github.com/rails/rails/issues/3508#issuecomment-29858772
  # Include type in serialization.
  def serializable_hash(options=nil)
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

  def self.key_list
    @@all_level_keys ||= Level.all.map {|l| [l.id, l.key]}.to_h
    @@all_level_keys
  end

  def update_key_list
    @@all_level_keys ||= nil
    @@all_level_keys[id] = key if @@all_level_keys
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

  def host_level
    project_template_level || self
  end

  # Overriden by different level types.
  def toolbox(type)
  end

  def spelling_bee?
    try(:skin) == 'letters'
  end

  def unplugged?
    game && game.unplugged?
  end

  def finishable?
    !unplugged?
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

  def self.custom_levels
    Naturally.sort_by(Level.where.not(user_id: nil), :name)
  end

  # Custom levels are built in levelbuilder. Legacy levels are defined in .js.
  # All custom levels will have a user_id, except for DSLDefined levels.
  def custom?
    user_id.present? || is_a?(DSLDefined)
  end

  def should_localize?
    custom? && !I18n.en?
  end

  def available_callouts(script_level)
    if custom?
      unless callout_json.blank?
        return JSON.parse(callout_json).map do |callout_definition|
          i18n_key = "data.callouts.#{name}.#{callout_definition['localization_key']}"
          callout_text = should_localize? &&
            I18n.t(i18n_key, default: nil) ||
            callout_definition['callout_text']

          Callout.new(
            element_id: callout_definition['element_id'],
            localization_key: callout_definition['localization_key'],
            callout_text: callout_text,
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
      raise unless rack_env?(:development) || rack_env?(:adhoc)
      puts "WARNING: level '#{name}' not seeded properly due to missing CDO.properties_encryption_key"
    end
    hash
  end

  def self.write_custom_levels
    level_paths = Dir.glob(Rails.root.join('config/scripts/**/*.level'))
    written_level_paths = Level.custom_levels.map(&:write_custom_level_file)
    (level_paths - written_level_paths).each {|path| File.delete path}
  end

  def should_write_custom_level_file?
    changed = changed? || (level_concept_difficulty && level_concept_difficulty.changed?)
    changed && write_to_file? && published
  end

  def write_custom_level_file
    if should_write_custom_level_file?
      file_path = Level.level_file_path(name)
      File.write(file_path, to_xml)
      file_path
    end
  end

  def self.level_file_path(level_name)
    level_paths = Dir.glob(Rails.root.join("config/scripts/**/#{level_name}.level"))
    raise("Multiple .level files for '#{name}' found: #{level_paths}") if level_paths.many?
    level_paths.first || Rails.root.join("config/scripts/levels/#{level_name}.level")
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
    level_hash.reject! {|_, v| v.nil?}
    level_hash
  end

  def report_bug_url(request)
    message = "Bug in Level #{name}\n#{request.url}\n#{request.user_agent}\n"
    "https://support.code.org/hc/en-us/requests/new?&description=#{CGI.escape(message)}"
  end

  def delete_custom_level_file
    if write_to_file?
      file_path = Dir.glob(Rails.root.join("config/scripts/**/#{name}.level")).first
      File.delete(file_path) if file_path && File.exist?(file_path)
    end
  end

  # Overriden in subclasses, provides a summary for rendering thumbnails on the
  # stage extras page
  def summarize_as_bonus
    {}
  end

  TYPES_WITHOUT_IDEAL_LEVEL_SOURCE = [
    'Applab', # freeplay
    'Bounce', # no ideal solution
    'ContractMatch', # dsl defined, covered in dsl
    'CurriculumReference', # no user submitted content
    'Dancelab', # no ideal solution
    'DSLDefined', # dsl defined, covered in dsl
    'EvaluationMulti', # unknown
    'External', # dsl defined, covered in dsl
    'ExternalLink', # no user submitted content
    'FreeResponse', # no ideal solution
    'FrequencyAnalysis', # widget
    'Flappy', # no ideal solution
    'Gamelab', # freeplay
    'GoBeyond', # unknown
    'Level', # base class
    'LevelGroup', # dsl defined, covered in dsl
    'Map', # no user submitted content
    'Match', # dsl defined, covered in dsl
    'Multi', # dsl defined, covered in dsl
    'BubbleChoice', # dsl defined, covered in dsl
    'NetSim', # widget
    'Odometer', # widget
    'Pixelation', # widget
    'PublicKeyCryptography', # widget
    'Scratch', # no ideal solution
    'ScriptCompletion', # unknown
    'StandaloneVideo', # no user submitted content
    'TextCompression', # widget
    'TextMatch', # dsl defined, covered in dsl
    'Unplugged', # no solutions
    'Vigenere', # widget
    'Weblab', # no ideal solution
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
    where('type not in (?)', TYPES_WITHOUT_IDEAL_LEVEL_SOURCE).
    where('ideal_level_source_id is null').
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

  # Project template levels are used to persist use progress
  # across multiple levels, using a single level name as the
  # storage key for that user.
  def project_template_level
    return nil if try(:project_template_level_name).nil?
    Level.find_by_key(project_template_level_name)
  end

  def strip_name
    self.name = name.to_s.strip unless name.nil?
  end

  def log_changes(user=nil)
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
    Script.cache_find_level(id)
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

  # Returns an array of all the contained levels
  # (based on the contained_level_names property)
  def contained_levels
    names = try('contained_level_names')
    return [] unless names.present?
    names.map do |contained_level_name|
      Script.cache_find_level(contained_level_name)
    end
  end

  def summarize
    {
      level_id: id,
      type: self.class.to_s,
      name: name,
      display_name: display_name
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

  # Create a copy of this level named new_name, and store the id of the original
  # level in parent_level_id.
  # @param [String] new_name
  # @param [String] editor_experiment
  # @raise [ActiveRecord::RecordInvalid] if the new name already is taken.
  def clone_with_name(new_name, editor_experiment: nil)
    level = dup
    # specify :published to make should_write_custom_level_file? return true
    level.update!(name: new_name, parent_level_id: id, published: true)
    level
  end

  # Create a copy of this level by appending new_suffix to the name, removing
  # any previous suffix from the name first. Store the id of the original
  # level in parent_level_id, and store the suffix in name_suffix. If a level
  # with the same name already exists, us that instead of creating a new one.
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
  def clone_with_suffix(new_suffix, editor_experiment: nil)
    # Make sure we don't go over the 70 character limit.
    new_name = "#{base_name[0..64]}#{new_suffix}"

    return Level.find_by_name(new_name) if Level.find_by_name(new_name)

    level = clone_with_name(new_name, editor_experiment: editor_experiment)

    update_params = {name_suffix: new_suffix}
    update_params[:editor_experiment] = editor_experiment if editor_experiment

    if project_template_level
      new_template_level = project_template_level.clone_with_suffix(new_suffix, editor_experiment: editor_experiment)
      update_params[:project_template_level_name] = new_template_level.name
    end

    unless contained_levels.empty?
      update_params[:contained_level_names] = contained_levels.map do |contained_level|
        contained_level.clone_with_suffix(new_suffix, editor_experiment: editor_experiment).name
      end
    end

    level.update!(update_params)
    level
  end

  def age_13_required?
    false
  end

  # Add a starter asset to the level and save it in properties.
  # Starter assets are stored as an object, where the key is the
  # friendly filename and the value is the UUID filename stored in S3:
  # {
  #   # friendly_name => uuid_name
  #   "welcome.png" => "123-abc-456.png"
  # }
  def add_starter_asset!(friendly_name, uuid_name)
    self.starter_assets ||= {}
    self.starter_assets[friendly_name] = uuid_name
    save!
  end

  private

  # Returns the level name, removing the name_suffix first (if present).
  def base_name
    return name unless name_suffix
    strip_suffix_regex = /^(.*)#{Regexp.escape(name_suffix)}$/
    name[strip_suffix_regex, 1] || name
  end

  def write_to_file?
    custom? && !is_a?(DSLDefined) && Rails.application.config.levelbuilder_mode
  end
end
