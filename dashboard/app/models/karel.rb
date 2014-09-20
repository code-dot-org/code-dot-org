# Used by Bee to indicate a flower/honeycomb of capacity 0
ZERO_DIRT_ITEM = 98

class Karel < Maze
  serialized_attrs :nectar_goal, :honey_goal, :flower_type

  # List of possible skins, the first is used as a default.
  def self.skins
    ['farmer', 'farmer_night', 'bee', 'bee_night']
  end

  # List of possible flower types
  def self.flower_types
    ['redWithNectar', 'purpleNectarHidden']
  end

  # If type is "Karel" return a 3 entry hash with keys 'maze', 'initial_dirt',
  # and 'final_dirt', the keys map to 2d arrays blockly can render.
  # final_dirt is always zeroed out until it is removed from Blockly.
  def self.parse_maze(maze_json)
    maze_json = maze_json.to_json if maze_json.is_a? Array
    maze = JSON.parse(maze_json)
    map, initial_dirt, final_dirt = (0...3).map { Array.new(maze.length) { Array.new(maze[0].length, 0) }}
    maze.each_with_index do |row, x|
      row.each_with_index do |cell, y|
        # optional +/-
        # followed by the number
        # followed by optional R/P/FC, used to override default flower color
        match = /([+|-])?(\d+)(R|P|FC)?/.match(cell.to_s)

        if match[1] # we have +/-
          map[x][y] = match[3] || 1 # R/P/FC can be used to override flowertype

          digits = (match[2] == '0' ? ZERO_DIRT_ITEM.to_s : match[2])

          initial_dirt[x][y] = (match[1] + digits).to_i
        else
          map[x][y] = cell.to_i
        end
      end
    end

    { 'maze' => map.to_json, 'initial_dirt' => initial_dirt.to_json, 'final_dirt' => final_dirt.to_json }
  end

  def self.unparse_maze(contents)
    maze, initial_dirt, final_dirt = %w(maze initial_dirt final_dirt).map do |x|
      data = contents[x]
      data = JSON.parse(data) if data.is_a?(String)
      data
    end
    output = Array.new(maze.size) { Array.new(maze[0].size, 0) }
    maze.each_with_index do |row, x|
      row.each_with_index do |map, y|
        dirt = initial_dirt[x][y]
        if map.to_s =~ /[1|R|P|FC]/ and dirt != 0
          prefix = dirt > 0 ? '+' : '-'
          digits = dirt.abs == ZERO_DIRT_ITEM ? '0' : dirt.abs.to_s
          suffix = map == 1 ? '' : map.to_s

          output[x][y] = prefix + digits + suffix
        else
          output[x][y] = map
        end
      end
    end
    output
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
