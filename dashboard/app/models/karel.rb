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

class Karel < Maze
  serialized_attrs :nectar_goal, :honey_goal, :flower_type, :fast_get_nectar_animation, :serialized_maze

  # List of possible skins, the first is used as a default.
  def self.skins
    ['farmer', 'farmer_night', 'bee', 'bee_night']
  end

  # List of possible flower types
  def self.flower_types
    ['redWithNectar', 'purpleNectarHidden']
  end

  def self.load_maze(maze_file, size)
    raw_maze = maze_file.read[0...size]
    raw_maze.map {|row| row.map {|cell| JSON.parse(cell)}}
  end

  # If type is "Karel" return a 3 entry hash with keys 'maze', 'initial_dirt',
  # and 'raw', the keys map to 2d arrays blockly can render.
  def self.parse_maze(maze_json)
    maze_json = maze_json.to_json if maze_json.is_a? Array
    maze = JSON.parse(maze_json)
    maze.each_with_index do |row, x|
      row.each_with_index do |cell, y|
        unless cell.is_a?(Hash) && cell.has_key?('tileType')
          raise ArgumentError.new("Cell (#{x},#{y}) has no defined tileType")
        end
      end
    end

    { 'serialized_maze' => maze_json }
  end

  def toolbox(type)
    '<category name="Category">
      <block type="procedures_defnoreturn"><title name="NAME">CATEGORY=Category</title></block>
    </category>
    <category name="Functions" custom="PROCEDURE"></category>
    <category name="Common">' +
      common_blocks(type) +
    '</category>
    <category name="Farmer">
      <block type="maze_dig"></block>
      <block type="maze_fill"></block>
      <block type="karel_if"></block>
      <block type="maze_untilBlocked"></block>
      <block type="maze_untilBlockedOrNotClear"></block>
      <block type="maze_forever"></block>
    </category>
    <category name="Bee">
      <block type="maze_nectar"></block>
      <block type="maze_honey"></block>
      <block type="bee_ifNectarAmount"></block>
      <block type="bee_ifelseNectarAmount"></block>
      <block type="bee_ifTotalNectar"></block>
      <block type="bee_ifelseTotalNectar"></block>
      <block type="bee_ifOnlyFlower"></block>
      <block type="bee_ifFlower"></block>
      <block type="bee_ifElseFlower"></block>
      <block type="bee_whileNectarAmount"></block>
      <block type="math_number">
        <title name="NUM">1</title>
      </block>
    </category>
    <category name="Variables" custom="VARIABLE">
    </category>
    <category name="Picker">
      <block type="pick_one"></block>
    </category>'
  end
end
