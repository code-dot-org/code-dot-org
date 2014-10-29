class Level < ActiveRecord::Base
  belongs_to :game
  has_and_belongs_to_many :concepts
  has_many :script_levels, dependent: :destroy
  belongs_to :solution_level_source, :class_name => "LevelSource" # TODO do we even use this
  belongs_to :ideal_level_source, :class_name => "LevelSource" # "see the solution" link uses this
  belongs_to :user
  has_many :level_sources

  validates_length_of :name, within: 1..70
  validates_uniqueness_of :name, case_sensitive: false, conditions: -> { where.not(user_id: nil) }

  after_save :write_custom_level_file
  after_destroy :delete_custom_level_file

  include StiFactory
  include SerializedProperties

  serialized_attrs %w(video_key)

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
    Video.find_by_key(video_key)
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

  def custom?
    user_id.present?
  end

  def self.load_custom_levels
    Dir.glob(Rails.root.join('config/scripts/**/*.level')).sort.map do |path|
      load_custom_level(File.basename(path, File.extname(path)))
    end
  end

  def self.level_file_path(name)
    level_paths = Dir.glob(Rails.root.join("config/scripts/**/#{name}.level"))
    raise("Multiple .level files for '#{name}' found: #{level_paths}") if level_paths.many?
    level_paths.first
  end

  def self.load_custom_level(name)
    level_path = level_file_path(name) || raise("Level #{name} not found")
    load_custom_level_xml(File.read(level_path), name)
  end

  def self.load_custom_level_xml(xml, name)
    level_xml = Nokogiri::XML(xml)
    type = level_xml.root.name
    transaction do
      level = Level.find_or_create_by(name: name).with_type(type)
      level.load_level_xml(xml)
    end
  end

  def load_level_xml(xml)
    json = Nokogiri::XML(xml, &:noblanks).xpath('//../config').first.text
    level_hash = JSON.parse(json)
    update!(level_hash)
    self
  end

  def self.write_custom_levels
    level_paths = Dir.glob(Rails.root.join('config/scripts/**/*.level'))
    written_level_paths = Level.custom_levels.map(&:write_custom_level_file)
    (level_paths - written_level_paths).each { |path| File.delete path }
  end

  def write_custom_level_file
    if write_to_file?
      file_path = self.class.level_file_path(name) || Rails.root.join("config/scripts/levels/#{name}.level")
      File.write(file_path, self.to_xml)
      file_path
    end
  end

  def to_xml(options={})
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

  def self.pretty_print(xml_string)
    xml = Nokogiri::XML(xml_string, &:noblanks)
    xml.serialize(PRETTY_PRINT).strip
  end

  def filter_level_attributes(level_hash)
    %w(name id updated_at type).each {|field| level_hash.delete field }
    level_hash.reject! { |k, v| v.nil? }
    level_hash
  end

  def delete_custom_level_file
    if write_to_file?
      file_path = Dir.glob(Rails.root.join("config/scripts/**/#{name}.level")).first
      File.delete(file_path) if file_path && File.exists?(file_path)
    end
  end

  def self.update_unplugged
    # Unplugged level data is specified in 'unplugged.en.yml' file
    unplugged = I18n.t('data.unplugged')
    unplugged_game = Game.find_by(name: 'Unplugged')
    unplugged.map do |name,_|
      Level.where(name: name).first_or_create.update(
        type: 'Unplugged',
        game: unplugged_game
      )
    end
  end

  def calculate_ideal_level_source_id
    ideal_level_source =
      level_sources.
      includes(:activities).
      max_by {|level_source| level_source.activities.where("test_result >= #{Activity::FREE_PLAY_RESULT}").count}

    self.update_attribute(:ideal_level_source_id, ideal_level_source.id) if ideal_level_source
  end

  private

  def write_to_file?
    custom? && Rails.env.levelbuilder? && !ENV['FORCE_CUSTOM_LEVELS']
  end
end
