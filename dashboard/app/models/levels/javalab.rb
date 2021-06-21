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
#  properties            :text(16777215)
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
    project_template_level_name
    start_sources
    validation
    hide_share_and_remix
    is_project_level
    submittable
    encrypted_examples
    csa_view_mode
    serialized_maze
    start_direction
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

    self.serialized_maze = maze
  end

  def fix_examples
    # remove nil and empty strings from examples
    return if examples.nil?
    all_examples = examples.select(&:present?)
    # raise an error if the example is incorrectly formatted
    all_examples.each do |example|
      unless example.start_with?("https://studio.code.org/s/")
        raise ArgumentError.new("Exemplar #{example} should start with https://studio.code.org/s/")
      end
    end
    self.examples = all_examples
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

      level_prop['levelId'] = level_num

      # We don't want this to be cached (as we only want it to be seen by authorized teachers), so
      # set it to nil here and let other code put it in app_options
      level_prop['teacherMarkdown'] = nil

      # Set the javabuilder url
      level_prop['javabuilderUrl'] = CDO.javabuilder_url

      # Don't set nil values
      level_prop.reject! {|_, value| value.nil?}
    end
    options.freeze
  end
end
