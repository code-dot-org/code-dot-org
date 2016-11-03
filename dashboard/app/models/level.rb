# == Schema Information
#
# Table name: levels
#
#  id                       :integer          not null, primary key
#  game_id                  :integer
#  name                     :string(255)      not null
#  created_at               :datetime
#  updated_at               :datetime
#  level_num                :string(255)
#  ideal_level_source_id    :integer
#  solution_level_source_id :integer
#  user_id                  :integer
#  properties               :text(65535)
#  type                     :string(255)
#  md5                      :string(255)
#  published                :boolean          default(FALSE), not null
#  notes                    :text(65535)
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
  belongs_to :solution_level_source, :class_name => "LevelSource" # TODO: Do we even use this?
  belongs_to :ideal_level_source, :class_name => "LevelSource" # "see the solution" link uses this
  belongs_to :user
  has_one :level_concept_difficulty, dependent: :destroy
  has_many :level_sources
  has_many :hint_view_requests

  before_validation :strip_name
  before_destroy :remove_empty_script_levels

  validates_length_of :name, within: 1..70
  validates_uniqueness_of :name, case_sensitive: false, conditions: -> { where.not(user_id: nil) }

  after_save :write_custom_level_file
  after_save :update_level_in_cache
  after_destroy :delete_custom_level_file
  after_destroy :delete_level_from_cache

  accepts_nested_attributes_for :level_concept_difficulty, update_only: true

  include StiFactory
  include SerializedProperties
  include TextToSpeech

  serialized_attrs %w(
    video_key
    embed
    callout_json
    instructions
    markdown_instructions
    authored_hints
    instructions_important
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
    assign_nested_attributes_for_one_to_one_association(:level_concept_difficulty,
      concept_difficulty_attributes) if concept_difficulty_attributes
    super(attributes)
  end

  def related_videos
    ([game.intro_video, specified_autoplay_video] + concepts.map(&:video)).reject(&:nil?).uniq
  end

  def specified_autoplay_video
    @@specified_autoplay_video ||= {}
    @@specified_autoplay_video[video_key] ||= Video.find_by_key(video_key) unless video_key.nil?
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

  def available_callouts(script_level)
    if custom?
      unless self.callout_json.blank?
        return JSON.parse(self.callout_json).map do |callout_definition|
          Callout.new(
            element_id: callout_definition['element_id'],
            localization_key: callout_definition['localization_key'],
            callout_text: callout_definition['callout_text'],
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

  # Returns a cached map from level id and level name to level, or nil if in
  # level_builder mode which disables caching.
  def self.level_cache
    return nil unless Script.should_cache?
    @@level_cache ||= {}.tap do |cache|
      ScriptLevel.script_level_cache.values.each do |script_level|
        level = script_level.level
        next unless level
        cache[level.id] = level unless cache.key? level.id
        cache[level.name] = level unless cache.key? level.name
      end
    end
  end

  def update_level_in_cache
    return unless Script.should_cache? && Level.level_cache.key?(id)
    Level.level_cache[id] = self
    Level.level_cache[name] = self
    script_levels.each do |sl|
      next unless ScriptLevel.script_level_cache.key?(sl.id)
      ScriptLevel.script_level_cache[sl.id].levels = ScriptLevel.includes(
        {levels: [:game, :concepts, :level_concept_difficulty]}).find(sl.id).levels
    end
  end

  def delete_level_from_cache
    return unless Script.should_cache?
    @@level_cache.except!(id, name)
  end

  # Find the level with the given id or name from the cache, unless the level
  # build mode is enabled in which case it is always fetched from the database.
  # If we need to fetch the level and we're not in level mode (for example
  # because the level was created after the cache), then an entry for the level
  # is added to the cache.
  # @param level_identifier [Integer | String] the level ID or level name to
  #   fetch
  # @return [Level] the (possibly cached) level
  # @raises [ActiveRecord::RecordNotFound] if the level cannot be found
  def self.cache_find_level(level_identifier)
    level = level_cache[level_identifier] if Script.should_cache?
    return level unless level.nil?

    # If the cache missed or we're in levelbuilder mode, fetch the level from
    # the db. Note the field trickery is to allow passing an ID as a string,
    # which some tests rely on (unsure about non-tests).
    field = level_identifier.to_i.to_s == level_identifier.to_s ? :id : :name
    level = Level.find_by!(field => level_identifier)
    # Cache the level by ID and by name, unless it wasn't found.
    level.update_level_in_cache if level
    level
  end

  # Input: xml level file definition
  # Output: Hash of level properties
  def load_level_xml(xml_node)
    JSON.parse(xml_node.xpath('//../config').first.text)
  end

  def self.write_custom_levels
    level_paths = Dir.glob(Rails.root.join('config/scripts/**/*.level'))
    written_level_paths = Level.custom_levels.map(&:write_custom_level_file)
    (level_paths - written_level_paths).each { |path| File.delete path }
  end

  def should_write_custom_level_file?
    changed = changed? || (level_concept_difficulty && level_concept_difficulty.changed?)
    changed && write_to_file? && self.published
  end

  def write_custom_level_file
    if should_write_custom_level_file?
      file_path = LevelLoader.level_file_path(name)
      File.write(file_path, self.to_xml)
      file_path
    end
  end

  def to_xml(options = {})
    builder = Nokogiri::XML::Builder.new do |xml|
      xml.send(self.type) do
        xml.config do
          hash = self.serializable_hash(:include => :level_concept_difficulty).deep_dup
          config_attributes = filter_level_attributes(hash)
          xml.cdata(JSON.pretty_generate(config_attributes.as_json))
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
    %w(name id updated_at type ideal_level_source_id md5).each {|field| level_hash.delete field}
    level_hash.reject!{|_, v| v.nil?}
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

  TYPES_WITHOUT_IDEAL_LEVEL_SOURCE =
    ['Unplugged', # no solutions
     'TextMatch', 'Multi', 'External', 'Match', 'ContractMatch', 'LevelGroup', # dsl defined, covered in dsl
     'Applab', 'Gamelab', # all applab and gamelab are freeplay
     'EvaluationQuestion', # plc evaluation
     'NetSim', 'Odometer', 'Vigenere', 'FrequencyAnalysis', 'TextCompression', 'Pixelation',
     'PublicKeyCryptography'
    ] # widgets
  # level types with ILS: ["Craft", "Studio", "Karel", "Eval", "Maze", "Calc", "Blockly", "StudioEC", "Artist"]

  def self.where_we_want_to_calculate_ideal_level_source
    self.
      where('type not in (?)', TYPES_WITHOUT_IDEAL_LEVEL_SOURCE).
      where('ideal_level_source_id is null').
      to_a.reject {|level| level.try(:free_play)}
  end

  def calculate_ideal_level_source_id
    ideal_level_source =
      level_sources.
      includes(:activities).
      max_by {|level_source| level_source.activities.where("test_result >= #{Activity::FREE_PLAY_RESULT}").count}

    self.update_attribute(:ideal_level_source_id, ideal_level_source.id) if ideal_level_source
  end

  def self.find_by_key(key)
    # this is the key used in the script files, as a way to uniquely
    # identify a level that can be defined by the .level file or in a
    # blockly levels.js. for example, from hourofcode.script:
    # level 'blockly:Maze:2_14'
    # level 'scrat 16'
    self.find_by(key_to_params(key))
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
    return false if self.try(:is_project_level)
    free_response_upload = is_a?(FreeResponse) && allow_user_uploads
    self.project_template_level || self.game == Game.applab || self.game == Game.gamelab || self.game == Game.weblab || self.game == Game.pixelation || free_response_upload
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
    return nil if self.try(:project_template_level_name).nil?
    Level.find_by_key(project_template_level_name)
  end

  def strip_name
    self.name = name.to_s.strip unless name.nil?
  end

  def remove_empty_script_levels
    script_levels.each do |script_level|
      if script_level.levels.length == 1 && script_level.levels[0] == self
        script_level.destroy
      end
    end
  end

  def self.cache_find(id)
    Level.cache_find_level(id)
  end

  def icon
  end

  # Returns an array of all the contained levels
  # (based on the contained_level_names property)
  def contained_levels
    names = properties["contained_level_names"]
    return [] unless names.present?
    Level.where(name: properties["contained_level_names"])
  end

  private

  def write_to_file?
    custom? && !is_a?(DSLDefined) && Rails.application.config.levelbuilder_mode
  end
end
