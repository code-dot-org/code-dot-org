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
#

class Level < ActiveRecord::Base
  belongs_to :game
  has_and_belongs_to_many :concepts
  has_many :script_levels, dependent: :destroy
  belongs_to :solution_level_source, :class_name => "LevelSource" # TODO do we even use this
  belongs_to :ideal_level_source, :class_name => "LevelSource" # "see the solution" link uses this
  belongs_to :user
  has_many :level_sources
  has_many :hint_view_requests

  before_validation :strip_name

  validates_length_of :name, within: 1..70
  validates_uniqueness_of :name, case_sensitive: false, conditions: -> { where.not(user_id: nil) }

  after_save :write_custom_level_file
  after_destroy :delete_custom_level_file

  include StiFactory
  include SerializedProperties

  serialized_attrs %w(
    video_key
    embed
    callout_json
    instructions
    markdown_instructions
    authored_hints
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

  # Overriden by different level types.
  def toolbox(type)
  end

  def unplugged?
    game && game.unplugged?
  end

  def finishable?
    !unplugged?
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
              qtip_config: callout_definition['qtip_config'].to_json,
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
    JSON.parse(xml_node.xpath('//../config').first.text)
  end

  def self.write_custom_levels
    level_paths = Dir.glob(Rails.root.join('config/scripts/**/*.level'))
    written_level_paths = Level.custom_levels.map(&:write_custom_level_file)
    (level_paths - written_level_paths).each { |path| File.delete path }
  end

  def write_custom_level_file
    if changed? && write_to_file? && self.published
      file_path = LevelLoader.level_file_path(name)
      File.write(file_path, self.to_xml)
      file_path
    end
  end

  def to_xml(options = {})
    builder = Nokogiri::XML::Builder.new do |xml|
      xml.send(self.type) do
        xml.config do
          config_attributes = filter_level_attributes(self.serializable_hash.deep_dup)
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
     'NetSim', 'Odometer', 'Vigenere', 'FrequencyAnalysis', 'TextCompression', 'Pixelation'] # widgets
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
    self.project_template_level || self.game == Game.applab || self.game == Game.gamelab || self.game == Game.pixelation
  end

  def key
    if level_num == 'custom'
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

  def self.cache_find(id)
    Script.cache_find_level(id)
  end

  private

  def write_to_file?
    custom? && !is_a?(DSLDefined) && Rails.application.config.levelbuilder_mode
  end
end
