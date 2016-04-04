require 'test_helper'

class LevelTest < ActiveSupport::TestCase
  include ActionDispatch::TestProcess

  setup do
    @turtle_data = {:game_id=>23, :name=>"__bob4", :level_num=>"custom", :skin=>"artist", :instructions=>"sdfdfs", :type=>'Artist'}
    @custom_turtle_data = {:solution_level_source_id=>4, :user_id=>1}
    @maze_data = {:game_id=>25, :name=>"__bob4", :level_num=>"custom", :skin=>"birds", :instructions=>"sdfdfs", :type=>'Maze'}
    @custom_maze_data = @maze_data.merge(:user_id=>1)
    @custom_level = Level.create(@custom_maze_data.dup)
    @level = Level.create(@maze_data.dup)

    Rails.application.config.stubs(:levelbuilder_mode).returns false
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
    csv = stub(:read => [%w(0 1), %w(1 2)])
    maze = Maze.load_maze(csv, 2)
    assert_equal [[0, 1], [1, 2]], maze
  end

  test "parses maze data" do
    csv = stub(:read => [%w(0 1), %w(1 2)])
    maze = Maze.parse_maze(Maze.load_maze(csv, 2).to_json)
    assert_equal({'maze' => [[0, 1], [1, 2]].to_json}, maze)
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
    custom_levels = Level.custom_levels
    assert custom_levels.include?(@custom_level)
    assert_not custom_levels.include?(@level)
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
    level = Artist.create_from_level_builder(@turtle_data, {name: 'create_turtle_name'})

    assert_equal "Artist", level.type
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
    assert_equal 'category', first_block.attributes['type'].value
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
    level = LevelLoader.load_custom_level(LevelLoader.level_file_path('K-1 Bee 2'))
    assert_equal 'bee', level.skin
    assert_equal '[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,1,0,-1,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]',
      level.properties['initial_dirt']
  end

  test 'debugging info for exceptions in load_custom_level' do
    begin
      LevelLoader.load_custom_level('xxxxx')
    rescue Exception => e
      assert_includes e.message, "in level"
    end
  end

  test 'prioritize property over column data in merged update' do
    level = Level.create(instructions: 'test', type: 'Maze')
    level.update(maze: '', properties: {maze: 'maze'})
    assert_equal 'maze', level.maze
  end

  test 'level save without changes does not update timestamp' do
    level = Level.create!(name: 'test_level_save', type: 'Maze')
    time = level.updated_at.to_i
    Timecop.travel(5) do
      level.save!
    end
    assert_equal time, level.updated_at.to_i
  end

  test 'update_ideal_level_source does nothing for maze levels' do
    level = Maze.first
    level.update_ideal_level_source
    assert_equal nil, level.ideal_level_source
  end

  test 'artist levels are seeded with solutions' do
    level = Artist.where(level_num: 'custom').first # custom levels have solutions
    assert level.solution_blocks
    assert level.ideal_level_source

    assert_equal level.solution_blocks, level.ideal_level_source.data
  end

  def update_contract_match
    name = 'contract match test'
    dsl_text = <<EOS
name 'Eval Contracts 1 B'
title 'Eval Contracts 1 B'
content1 'Write a contract for the star function'
content2 'Eval Contracts 1 A.solution_blocks, 300'
answer 'star|image|color:string|radius:Number|style:string'
EOS
    cm = ContractMatch.create_from_level_builder({}, {name: name, type: 'ContractMatch', dsl_text: dsl_text})

    # update the same level with different dsl text
    dsl_text = dsl_text.gsub('star', 'bar')
    cm.update(name: name, type: 'ContractMatch', dsl_text: dsl_text, published: true)

    cm = ContractMatch.find(cm.id)
    # star -> bar
    assert_equal 'bar|image|color:string|radius:Number|style:string', cm.properties['answers'].first
    assert_equal 'Write a contract for the bar function', cm.properties['content1']
  end

  test 'updating ContractMatch level updates it in levelbuilder mode' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    File.expects(:write).times(4) # mock file so we don't actually write a file... twice each for the .contract_match file and the i18n strings file (once for create and once for save)

    update_contract_match
  end

  test 'updating ContractMatch level does not write file in non levelbuilder mode' do
    File.expects(:write).never

    update_contract_match
  end

  def update_maze
    maze = Maze.last
    maze.start_blocks = '<xml/>'
    maze.published = true
    maze.save!

    maze.reload
    assert_equal '<xml/>', maze.start_blocks
  end

  test 'updating maze level updates it in levelbuilder mode' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    File.expects(:write).once

    update_maze
  end

  test 'updating maze level does not write file in non levelbuilder mode' do
    File.expects(:write).never

    update_maze
  end

  def create_maze
    maze = create(:maze, :published => true)
    assert maze
  end

  test 'creating maze level creates it in levelbuilder mode' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    File.expects(:write).once

    create_maze
  end

  test 'creating maze level does not write file in non levelbuilder mode' do
    File.expects(:write).never

    create_maze
  end

  test 'delete removed level properties on import' do
    level = Level.create(name: 'test delete properties', instructions: 'test', type: 'Studio', embed: true)

    assert_equal true, level.embed

    # Delete property from level XML
    level_xml = level.to_xml
    n = Nokogiri::XML(level_xml, &:noblanks)
    level_config = n.xpath('//../config').first.child
    level_hash = JSON.parse(level_config.text)
    level_hash['properties'].delete 'embed'
    level_config.content = level_hash.to_json
    level_xml = n.to_xml

    # Import level XML
    LevelLoader.load_custom_level_xml level_xml, level

    assert_nil level.embed
  end

  test 'project template level' do
    template_level = Blockly.create(name: 'project_template')
    template_level.start_blocks = '<xml/>'
    template_level.save!

    assert_nil template_level.project_template_level
    assert_equal '<xml/>', template_level.start_blocks

    real_level1 = Blockly.create(name: 'level 1')
    real_level1.project_template_level_name = 'project_template'
    real_level1.save!

    assert_equal template_level, real_level1.project_template_level
  end

  test 'key_to_params' do
    assert_equal({name: "Course 4 Level 1"}, Level.key_to_params('Course 4 Level 1'))
    assert_equal({game_id: Game.find_by_name('studio').id, level_num: 'playlab_1'}, Level.key_to_params('blockly:Studio:playlab_1'))
    assert_equal({game_id: Game.find_by_name('maze').id, level_num: '2_11'}, Level.key_to_params('blockly:Maze:2_11'))
  end

  test 'find_by_key' do
    level = Level.find_by_key 'blockly:Unplug1:u_1_1'
    assert_equal 'u_1_1', level.level_num

    level = Level.find_by_key 'blockly:Maze:2_7'
    assert_equal '2_7', level.level_num

    level = Level.find_by_key 'PlantASeed'
    assert_equal 'PlantASeed', level.name
  end

  test 'applab examples' do
    CDO.stubs(:properties_encryption_key).returns('thisisafakekeyfortesting')

    level = Applab.create(name: 'applab_with_example')
    level.examples = %w(xxxxxx yyyyyy)

    # go through a save/load
    level.save!
    level = level.reload

    assert_equal %w(xxxxxx yyyyyy), level.examples

    # this property is encrypted, not plaintext
    assert_nil level.properties['examples']
    assert level.properties['encrypted_examples']

    # take out nils and empty strings
    level.examples = ['xxxxxx', nil, "", 'yyyyyy', ""]

    # go through a save/load
    level.save!
    level = level.reload

    assert_equal %w(xxxxxx yyyyyy), level.examples

    # does not crash if decryption is busted
    CDO.stubs(:properties_encryption_key).returns(nil)
    assert_equal nil, level.examples
  end

  test 'cached_find' do
    level1 = Script.twenty_hour_script.script_levels[0].level
    cache_level1 = Level.cache_find(level1.id)
    assert_equal(level1, cache_level1)

    level2 = Script.course1_script.script_levels.last.level
    cache_level2 = Level.cache_find(level2.id)
    assert_equal(level2, cache_level2)

    # Make sure that we can also locate a newly created level.
    level3 = create(:level)
    assert_equal(level3, Level.cache_find(level3.id))
  end

  test 'where we want to calculate ideal level source' do
    match_level = Match.create(name: 'a match level')
    level_with_ideal_level_source_already = Artist.create(name: 'an artist level with a solution', solution_blocks: '<xml></xml>')
    freeplay_artist = Artist.create(name: 'freeplay artist', free_play: true)
    regular_artist = Artist.create(name: 'regular artist')

    levels = Level.where_we_want_to_calculate_ideal_level_source

    assert !levels.include?(match_level)
    assert !levels.include?(level_with_ideal_level_source_already)
    assert !levels.include?(freeplay_artist)
    assert levels.include?(regular_artist)
  end

  test 'calculate_ideal_level_source_id does nothing if no level sources' do
    level = Maze.create(name: 'maze level with no level sources')
    assert_equal nil, level.ideal_level_source_id

    level.calculate_ideal_level_source_id
    assert_equal nil, level.ideal_level_source_id
  end

  test 'calculate_ideal_level_source_id sets ideal_level_source_id to best solution' do
    level = Maze.create(name: 'maze level with level sources')
    assert_equal nil, level.ideal_level_source_id

    right = create(:level_source, level: level, data: "<xml><right/></xml>")
    6.times do
      create(:activity, level: level, level_source: right, test_result: 100)
    end

    wrong = create(:level_source, level: level, data: "<xml><wrong/></xml>")
    10.times do
      create(:activity, level: level, level_source: wrong, test_result: 0)
    end

    right_but_unpopular = create(:level_source, level: level, data: "<xml><right_but_unpopular/></xml>")
    2.times do
      create(:activity, level: level, level_source: right_but_unpopular, test_result: 100)
    end

    level.calculate_ideal_level_source_id
    assert_equal right, level.ideal_level_source
  end

end
