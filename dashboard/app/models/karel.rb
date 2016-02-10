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
#
# Indexes
#
#  index_levels_on_game_id  (game_id)
#

# Used by Bee to indicate a flower/honeycomb of capacity 0
ZERO_DIRT_ITEM = 98

class Karel < Maze
  serialized_attrs :nectar_goal, :honey_goal, :flower_type, :fast_get_nectar_animation

  # List of possible skins, the first is used as a default.
  def self.skins
    ['farmer', 'farmer_night', 'bee', 'bee_night']
  end

  # List of possible flower types
  def self.flower_types
    ['redWithNectar', 'purpleNectarHidden']
  end

  # If type is "Karel" return a 3 entry hash with keys 'maze', 'initial_dirt',
  # and 'raw', the keys map to 2d arrays blockly can render.
  def self.parse_maze(maze_json)
    maze_json = maze_json.to_json if maze_json.is_a? Array
    maze = JSON.parse(maze_json)
    maze.each_with_index do |row, x|
      row.each_with_index do |cell, y|
        # optional +/-
        # followed by the number
        # optionally followed by R or P to override default flower color
        # optionally followed by:
        #   FC to indicate an old-style "fixed" cloud or
        #   C or Cany to indicate a new "dynamic" cloud
        match = /^(\+|-)?(\d+)(R|P)?(FC|Cany|C)?$/.match(cell.to_s)
        unless match
          raise ArgumentError.new("Cell (#{x},#{y}) with content \"#{cell}\" is invalid")
        end
      end
    end

    # "Karel" covers both Bee and Farmer levels. As of Jan 2016, Bee has
    # been converted to look only at RawDirt, but Farmer levels and
    # shared code still use a combination of "Map" and "InitialDirt".
    # Once all clientside logic has been converted to use just
    # "RawDirt", this can be vastly simplified.
    map, initial_dirt = (0...2).map { Array.new(maze.length) { Array.new(maze[0].length, 0) }}
    maze.each_with_index do |row, x|
      row.each_with_index do |cell, y|
        # optional +/-
        # followed by the number
        # followed by optional R/P/FC, used to override default flower color
        # followed by optional C/Cany, used to indicate new clouds
        match = /(\+|-)?(\d+)(R|P|FC)?(Cany|C)?/.match(cell.to_s)

        if match[4] # we're a 'new' level using the clouds
          map[x][y] = 1
          digits = (match[2] == '0' ? ZERO_DIRT_ITEM.to_s : match[2])
          initial_dirt[x][y] = (match[1] || '' + digits).to_i
        elsif match[1] # we have +/-
          map[x][y] = match[3] || 1 # R/P/FC can be used to override flowertype

          digits = (match[2] == '0' ? ZERO_DIRT_ITEM.to_s : match[2])

          initial_dirt[x][y] = (match[1] + digits).to_i
        else
          map[x][y] = cell.to_i
        end
      end
    end

    { 'maze' => map.to_json, 'initial_dirt' => initial_dirt.to_json, 'raw_dirt' => maze_json }
  end

  # Bee now uses "RawDirt" rather than a combination of "map" and
  # "initialDirt". However, older bee levels do not have "RawDirt" in
  # the level properties, and will need to be updated. Until then,
  # here's a temporary function to recombine "map" and "initial_dirt"
  # into "raw_dirt"
  def self.generate_raw_dirt(map, initial_dirt)
    map = JSON.parse(map) if map.is_a?(String)
    initial_dirt = JSON.parse(initial_dirt) if initial_dirt.is_a?(String)
    raw_dirt = Array.new(map.size) { Array.new(map[0].size, 0) }
    map.each_with_index do |row, x|
      row.each_with_index do |map, y|
        dirt = initial_dirt[x][y]
        if map.to_s =~ /[1|R|P|FC]/ and dirt != 0
          prefix = dirt > 0 ? '+' : '-'
          digits = dirt.abs == ZERO_DIRT_ITEM ? '0' : dirt.abs.to_s
          suffix = map == 1 ? '' : map.to_s

          raw_dirt[x][y] = prefix + digits + suffix
        else
          raw_dirt[x][y] = map
        end
      end
    end
    raw_dirt
  end

  def self.unparse_maze(contents)
    maze = contents['raw_dirt'] || self.generate_raw_dirt(contents['maze'], contents['initial_dirt'])
    maze.is_a?(String) ? JSON.parse(maze) : maze
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
