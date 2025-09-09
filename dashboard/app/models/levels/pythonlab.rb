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
#  index_levels_on_type       (type)
#
class Pythonlab < Level
  serialized_attrs %w(
    start_sources
    encrypted_exemplar_sources
    hide_share_and_remix
    is_project_level
    submittable
    disable_edit_run_for_submission
    starter_assets
    predict_settings
    validation_file
    enable_micro_bit
    mini_app
    serialized_maze
    widget_view
    widget_view_allow_show_code
  )

  validate :has_correct_multiple_choice_answer?
  before_save :clean_up_predict_settings, :clean_up_mini_app_settings, :parse_maze

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.pythonlab,
        level_num: 'custom',
      )
    )
  end

  def self.mini_apps
    [['None', nil], ['Neighborhood', 'neighborhood']]
  end

  def uses_lab2?
    true
  end

  # Return the validation condition for this level. If the level has a validation file, the condition
  # is that all tests passed. If there is no validation file, there are no conditions.
  def get_validations
    if validation_file
      [{
        conditions: [
          {
            name: 'PASSED_ALL_TESTS',
            value: "true"
          }
        ],
        message: '',
        next: true,
      }]
    else
      nil
    end
  end

  def get_starter_code
    properties["start_sources"]
  end

  def summarize_for_lab2_properties(script, script_level = nil, current_user = nil, unit_group_unit: nil)
    level_properties = super
    level_properties[:serializedMaze] = get_serialized_maze
    level_properties
  end

  def get_serialized_maze
    serialized_maze || project_template_level&.try(:serialized_maze)
  end

  def clean_up_mini_app_settings
    if mini_app != 'neighborhood'
      properties.delete('serialized_maze')
    end
  end

  # Copied from javalab.rb
  def parse_maze
    return if serialized_maze.blank? && project_template_level&.try(:serialized_maze).present?
    if serialized_maze.nil? && mini_app == 'neighborhood'
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
end
