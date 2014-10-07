require "csv"

class Maze < Blockly
  before_save :update_maze

  serialized_attrs :maze, :start_direction, :maze_data

  # List of possible skins, the first is used as a default.
  def self.skins
    ['birds', 'pvz']
  end

  # An array of [name, value] pairs where the value is a start direction.
  def self.start_directions
    [['Up', 0], ['Right', 1], ['Down', 2], ['Left', 3]]
  end

  # An array of [name, value] pairs where the value is the step mode
  def self.step_modes
    [['Run Button Only', 0], ['Run and Step', 1], ['Step Button Only', 2]]
  end

  def self.create_from_level_builder(params, level_params)
    level = new(level_params.merge(user: params[:user], game: Game.custom_maze, level_num: 'custom'))
    level.create_maze(level_params, params)
    level
  end

  def create_maze(level_params, params)
    size = params[:size].to_i
    if params[:maze_source]
      file_contents = CSV.new(params[:maze_source].read)
      contents = self.class.load_maze(file_contents, size)
    elsif level_params[:maze_data]
      contents = JSON.parse(level_params[:maze_data])
    else
      raise ArgumentError.new("Maze level data not found")
    end
    self.maze_data = contents.to_json
    save!
  end

  def update_maze
    if read_attribute(:maze).present?
      properties.update(self.class.parse_maze(read_attribute(:maze)))
      write_attribute(:maze, nil)
    elsif self.maze_data.present?
      self.properties.update(self.class.parse_maze(maze_data))
      self.maze_data = nil
    end
  end

  # contents - should respond to read by returning a 2d square array
  #   with the given size, representing a blockly level.
  # Throws ArgumentError if there is a non integer value in the array.
  def self.load_maze(maze_file, size)
    raw_maze = maze_file.read[0...size]
    raw_maze.map {|row| row.map {|cell| Integer(cell)}}
  end

  # Parses the 2d array contents.
  # If type is "Maze" return a single entry hash with 'maze' mapping to a 2d
  #   array that Blockly can render.
  # Throws ArgumentError if there is a non integer value in the array.
  def self.parse_maze(maze_json)
    maze_json = maze_json.to_json if maze_json.is_a? Array
    { 'maze' => JSON.parse(maze_json).map { |row| row.map { |cell| Integer(cell) } }.to_json}
  end

  # Returns an 'unparsed' array object from the parsed properties
  def self.unparse_maze(contents)
    maze = contents['maze']
    maze.is_a?(Array) ? maze.to_json : maze
  end

  def filter_level_attributes(level_hash)
    %w(maze initial_dirt final_dirt).map do |maze_type|
      prop = level_hash['properties']
      prop[maze_type] = prop[maze_type].to_json if prop[maze_type].is_a?(Array)
    end
    super(level_hash)
  end

  def common_blocks(type)
    <<-XML.chomp
#{k1_blocks}
<block type='maze_moveForward'></block>
<block type='maze_move'></block>
<block type='maze_turn'>
  <title name='DIR'>turnLeft</title>
</block>
<block type='maze_turn'>
  <title name='DIR'>turnRight</title>
</block>
<block type='controls_repeat'>
  <title name='TIMES'>5</title>
</block>
<block type="controls_repeat_dropdown">
  <title name="TIMES" config="3-10">3</title>
</block>
<block type='controls_repeat_ext'>
</block>
    XML
  end

  def k1_blocks
    <<-XML.chomp
<block type="controls_repeat_simplified">
  <title name="TIMES">5</title>
</block>
<block type="controls_repeat_simplified_dropdown">
  <title name="TIMES" config="3-10">3</title>
</block>
<block type="maze_moveNorth"></block>
<block type="maze_moveSouth"></block>
<block type="maze_moveEast"></block>
<block type="maze_moveWest"></block>
    XML
  end

  def toolbox(type)
    <<-XML.chomp
<block type="procedures_defnoreturn"><title name="NAME">CATEGORY=Category</title></block>
#{common_blocks(type)}
<block type="maze_forever"></block>
<block type="maze_if"></block>
<block type="maze_ifElse"></block>
    XML
  end
end
