require "csv"

class Grid < Blockly
  before_save :update_maze

  serialized_attrs :maze, :maze_data

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
end
