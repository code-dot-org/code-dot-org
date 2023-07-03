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

class Javalab < Level
  serialized_attrs %w(
    start_sources
    encrypted_exemplar_sources
    encrypted_validation
    hide_share_and_remix
    is_project_level
    submittable
    encrypted_examples
    csa_view_mode
    starter_assets
    serialized_maze
    start_direction
    contained_level_names
  )

  before_save :fix_examples, :parse_maze

  def self.start_directions
    [['None', nil], ['North', 0], ['East', 1], ['South', 2], ['West', 3]]
  end

  def self.csa_view_modes
    [['Console', 'console'], ['Neighborhood', 'neighborhood'], ['Theater', 'theater']]
  end

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.javalab,
        level_num: 'custom'
      )
    )
  end

  def parse_maze
    return if serialized_maze.blank? && project_template_level&.try(:serialized_maze).present?
    if serialized_maze.nil? && csa_view_mode == 'neighborhood'
      raise ArgumentError.new('neighborhood must have a serialized_maze')
    end
    return if serialized_maze.nil?
    # convert maze into json object and validate each cell has a tileType
    maze_json = serialized_maze.is_a?(Array) ? serialized_maze.to_json : serialized_maze
    maze = JSON.parse(maze_json)
    maze.each_with_index do |row, x|
      row.each_with_index do |cell, y|
        unless cell.is_a?(Hash) && cell.key?('tileType')
          raise ArgumentError.new("Cell (#{x},#{y}) has no defined tileType")
        end
      end
    end
    # paint bucket asset id is 303
    if serialized_maze.include?("303") && (maze.length >= 20)
      raise ArgumentError.new("Large mazes cannot have paint buckets")
    end
    self.serialized_maze = maze
  end

  def fix_examples
    # remove nil and empty strings from examples
    return if examples.nil?
    all_examples = examples.select(&:present?)
    # raise an error if the example is incorrectly formatted
    all_examples.each do |example|
      unless example.start_with?("https://studio.code.org/s/")
        raise ArgumentError.new("Exemplar #{example} on level '#{name}' should start with https://studio.code.org/s/")
      end
    end
    self.examples = all_examples
  end

  def get_serialized_maze
    serialized_maze || project_template_level&.try(:serialized_maze)
  end

  # Return an 'appOptions' hash derived from the level contents
  def non_blockly_puzzle_level_options
    options = Rails.cache.fetch("#{cache_key}/non_blockly_puzzle_level_options/v2") do
      level_prop = {}

      properties.keys.each do |dashboard|
        apps_prop_name = dashboard.camelize(:lower)
        # Select value from properties json
        # Don't override existing valid (non-nil/empty) values
        value = JSONValue.value(properties[dashboard].presence)
        level_prop[apps_prop_name] = value unless value.nil? # make sure we convert false
      end

      if csa_view_mode == 'neighborhood'
        level_prop['serializedMaze'] = get_serialized_maze
        level_prop['startDirection'] = start_direction || project_template_level.try(:start_direction)
      end

      level_prop['levelId'] = level_num

      # We don't want this to be cached (as we only want it to be seen by authorized teachers), so
      # set it to nil here and let other code put it in app_options
      level_prop['teacherMarkdown'] = nil

      # Pull in the level name
      level_prop['name'] = name

      # Pass through the captcha key so we can challenge users in demo mode
      level_prop['recaptchaSiteKey'] = CDO.recaptcha_site_key

      # Send validation file names without code to prevent naming collisions. If we are in start mode,
      # the actual validation code will be sent by levels_controller.
      if validation
        validation_names_only = validation
        validation_names_only.each do |key, _|
          validation_names_only[key] = ""
        end
        level_prop['validation'] = validation_names_only
      end

      # Don't set nil values
      level_prop.compact!
    end
    options.freeze
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

  # Remove a starter asset by its key (friendly_name) from the level's properties.
  def remove_starter_asset!(friendly_name)
    return true unless starter_assets
    starter_assets.delete(friendly_name)
    save!
  end

  def age_13_required?
    true
  end
end
