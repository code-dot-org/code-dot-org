require 'test_helper'
include ActionDispatch::TestProcess

class LevelTest < ActiveSupport::TestCase
  setup do
    @turtle_data = {:game_id=>23, :name=>"__bob4", :level_num=>"custom", :skin=>"artist", :instructions=>"sdfdfs", :type=>'Artist'}
    @custom_turtle_data = {:solution_level_source_id=>4, :user_id=>1}
    @maze_data = {:game_id=>25, :name=>"__bob4", :level_num=>"custom", :skin=>"birds", :instructions=>"sdfdfs", :type=>'Maze'}
    @custom_maze_data = @maze_data.merge(:user_id=>1)
    @custom_level = Level.create(@custom_maze_data.dup)
    @level = Level.create(@maze_data.dup)
  end

  test 'create level' do
    Level.create(:game_id=>25, :name=>"__bob4", :level_num=>"custom", :skin=>"birds", :instructions=>"sdfdfs", :type=>'Maze')
  end

  test "throws argument error on bad data" do
    maze = CSV.new(fixture_file_upload("maze_level_invalid.csv", "r"))
    assert_raises ArgumentError do
      Maze.load_maze(maze, 8)
    end
  end

  test "reads and converts data" do
    csv = stub(:read => [['0', '1'], ['1', '2']])
    maze = Maze.load_maze(csv, 2)
    assert_equal [[0, 1], [1, 2]], maze
  end

  test "parses maze data" do
    csv = stub(:read => [['0', '1'], ['1', '2']])
    maze = Maze.parse_maze(Maze.load_maze(csv, 2).to_json)
    assert_equal({'maze' => [[0, 1], [1, 2]].to_json}, maze)
  end

  test "parses karel data" do
    def validate_karel_val(input, maze, initial_dirt, roundtrip=true)
      # create a 1x1 matrix and validate results
      json = [[input]].to_json
      parsed = Karel.parse_maze(json)
      assert_equal(maze, JSON.parse(parsed['maze'])[0][0])
      assert_equal(initial_dirt, JSON.parse(parsed['initial_dirt'])[0][0])
      assert_equal(0, JSON.parse(parsed['final_dirt'])[0][0])

      # some of our values won't roundtrip, because they get converted to ints
      # but not back to strings
      if roundtrip
        unparsed = Karel.unparse_maze(parsed)
        assert_equal(json, unparsed.to_json)
      end
    end

    validate_karel_val(     0,   0,   0)
    validate_karel_val(     1,   1,   0)
    validate_karel_val( '-10',   1, -10)
    validate_karel_val(     2,   2,   0)
    validate_karel_val(  '+5',   1,   5)
    validate_karel_val(  '-5',   1,  -5)
    validate_karel_val( '+4P', 'P',   4)
    validate_karel_val('-4FC','FC',  -4)
    validate_karel_val( '+3R', 'R',   3)
    validate_karel_val(   '0',   0,   0, false)
    validate_karel_val(  '00',   0,   0, false)
    validate_karel_val(  '01',   1,   0, false)
  end

  test "cannot create two custom levels with same name" do
    assert_no_difference('Level.count') do
      level2 = Level.create(@custom_maze_data)
      assert_not level2.valid?
      assert level2.errors.include?(:name)
    end
  end

  test "cannot create two custom levels with same name case insensitive" do
    assert_no_difference('Level.count') do
      name_upcase = @custom_maze_data[:name].upcase
      level2 = Level.create(@custom_maze_data.merge(name: name_upcase))
      assert_not level2.valid?
      assert level2.errors.include?(:name)
    end
  end

  test "can create two custom levels with different names" do
    assert_difference('Level.count', 1) do
      @custom_maze_data[:name] = "__swoop"
      level2 = Level.create(@custom_maze_data)
      assert level2.valid?
    end
  end

  test "get custom levels" do
    assert Level.custom_levels.include?(@custom_level)
    assert_not Level.custom_levels.include?(@level)
  end

  test "create turtle level of correct subclass" do
    level = Level.create(@turtle_data)
    assert_equal "Artist", level.type
  end

  test "create maze level of correct subclass" do
    level = Level.create(@maze_data)
    assert_equal "Maze", level.type
  end

  test "create turtle level from level builder" do
    program = '<xml>hey</xml>'
    level = Artist.create_from_level_builder(@turtle_data.merge!(program: program), {name: 'create_turtle_name'})

    assert_equal "Artist", level.type
    assert_equal program, level.properties['solution_blocks']
    assert_equal 'custom', level.level_num
  end

  test "basic toolbox check" do
    level = Level.create(@maze_data)
    toolbox = Nokogiri::XML(level.complete_toolbox(:start_blocks))

    assert_equal "xml", toolbox.root().name
    assert_equal "toolbox", toolbox.root().attributes["id"].value

    first_category = toolbox.root().children.first
    assert_equal "category", first_category.name

    first_block = toolbox.root().css('category > *').first
    assert_equal "block", first_block.name
    assert_equal 'procedures_defnoreturn', first_block.attributes['type'].value
  end

  test "include type in json" do
    maze = Level.create(@maze_data)
    maze_from_json = Level.create(JSON.parse(maze.to_json))
    assert maze_from_json.is_a? Maze
  end

  test 'serialize properties' do
    level = Blockly.new
    level.instructions = 'test!'
    assert_equal 'test!', level.properties['instructions']
    assert_equal level.instructions, level.properties['instructions']
  end

  test 'create with serialized properties' do
    level = Blockly.create(instructions: 'test')
    assert_equal 'test', level.instructions
    level.instructions = 'test2'
    assert_equal 'test2', level.instructions
  end

  test 'update serialized column with properties hash' do
    level = Blockly.create(instructions: 'test')
    level.update(instructions: 'test2', properties: {skin: 'skin'})
    assert_equal 'test2', level.instructions
    assert_equal 'skin', level.skin
  end

  test 'cannot have non-existent properties' do
    level = Blockly.create(instructions: 'test')
    level.update(properties: {property_that_does_not_exist: 'impossible value storage'})
    assert_raises(NoMethodError) do
      level.property_that_does_not_exist
    end
  end

  test 'can have video key' do
    level = Blockly.create(instructions: 'test')
    video = create(:video)
    level.update(properties: {video_key: video.key})
    assert_equal video.key, level.video_key
  end

  test 'returns specified video with related videos' do
    level = create(:level)
    video = create(:video)
    level.update(properties: {video_key: video.key})
    assert_includes(level.related_videos, video)
  end

  test 'returns concept videos with related videos' do
    level = create(:level)
    level.concepts = [create(:concept, :with_video), create(:concept, :with_video)]
    assert_includes(level.related_videos, level.concepts.first.video)
    assert_includes(level.related_videos, level.concepts.second.video)
  end

  test 'update custom level from file' do
    level = Level.load_custom_level('K-1 Bee 2')
    assert_equal 'bee', level.skin
    assert_equal '[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,1,0,-1,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]',
      level.properties['initial_dirt']
  end

  test 'prioritize property over column data in merged update' do
    level = Level.create(instructions: 'test', type: 'Maze')
    level.update(maze: '', properties: {maze: 'maze'})
    assert_equal 'maze', level.maze
  end

# requires rails 4.2 or suitable workaround
#  test 'level save without changes does not update timestamp' do
#    level = Level.create!(name: 'test_level_save', type: 'Maze')
#    time = level.updated_at.to_i
#    Timecop.travel(5) do
#      level.save!
#    end
#    assert_equal time, level.updated_at.to_i
#  end

end
