require 'test_helper'

class LevelTest < ActiveSupport::TestCase
  include ActionDispatch::TestProcess

  STUB_ENCRYPTION_KEY = SecureRandom.base64(Encryption::KEY_LENGTH / 8)

  setup do
    @turtle_data = {game_id: 23, name: "__bob4", level_num: "custom", skin: "artist", short_instructions: "sdfdfs", type: 'Artist'}
    @custom_turtle_data = {user_id: 1}
    @maze_data = {game_id: 25, name: "__bob4", level_num: "custom", skin: "birds", short_instructions: "sdfdfs", type: 'Maze'}
    @custom_maze_data = @maze_data.merge(user_id: 1)
    @gamelab_data = {game_id: 48, name: 'some gamelab level', level_num: 'custom', type: 'Gamelab'}
    @custom_level = Level.create(@custom_maze_data.dup)
    @level = Level.create(@maze_data.dup)

    Rails.application.config.stubs(:levelbuilder_mode).returns false
  end

  # Raises an exception if level_class or any of its descendants do not exist in either
  # TYPES_WITH_IDEAL_LEVEL_SOURCE.include or TYPES_WITHOUT_IDEAL_LEVEL_SOURCE.include.
  def raise_unless_specifies_ideal_level_source(level_class)
    unless (Level::TYPES_WITH_IDEAL_LEVEL_SOURCE.include? level_class.to_s) ||
      (Level::TYPES_WITHOUT_IDEAL_LEVEL_SOURCE.include? level_class.to_s)
      raise "#{level_class} does not specify if it has ideal level sources"
    end
    level_class.descendants.each do |descendant|
      raise_unless_specifies_ideal_level_source(descendant)
    end
  end

  test 'types marked as having ideal level sources' do
    raise_unless_specifies_ideal_level_source(Level)
  end

  test 'create level' do
    Level.create(game_id: 25, name: "__bob4", level_num: "custom", skin: "birds", short_instructions: "sdfdfs", type: 'Maze')
  end

  test "throws argument error on bad data" do
    maze = CSV.new(fixture_file_upload("maze_level_invalid.csv", "r"))
    assert_raises ArgumentError do
      Maze.load_maze(maze, 8)
    end
  end

  test "reads and converts data" do
    csv = stub(read: [['0', '1'], ['1', '2']])
    maze = Maze.load_maze(csv, 2)
    assert_equal [[0, 1], [1, 2]], maze
  end

  test "parses maze data" do
    csv = stub(read: [['0', '1'], ['1', '2']])
    maze = Maze.parse_maze(Maze.load_maze(csv, 2).to_json)
    assert_equal({'maze' => [[0, 1], [1, 2]].to_json}, maze)
  end

  test "karel checks total value" do
    json = [[
      {tileType: 1, value: 1},
      {tileType: 1, value: 2},
      {tileType: 1, value: 3},
    ]].to_json

    assert_nothing_raised do
      Karel.parse_maze(json, 6)
    end

    assert_raises ArgumentError do
      Karel.parse_maze(json, 7)
    end
  end

  test "cannot create two custom levels with same name" do
    assert_does_not_create(Level) do
      level2 = Level.create(@custom_maze_data)
      assert_not level2.valid?
      assert level2.errors.include?(:name)
    end
  end

  test "cannot create two custom levels with same name case insensitive" do
    assert_does_not_create(Level) do
      name_upcase = @custom_maze_data[:name].upcase
      level2 = Level.create(@custom_maze_data.merge(name: name_upcase))
      assert_not level2.valid?
      assert level2.errors.include?(:name)
    end
  end

  test "can create two custom levels with different names" do
    assert_creates(Level) do
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

  test "summarize returns object with expected fields" do
    summary = @level.summarize
    assert_equal(summary[:level_id], @level.id)
    assert_equal(summary[:type], 'Maze')
    assert_equal(summary[:name], '__bob4')
    assert_nil(summary[:display_name])
  end

  test "get_question_text returns question text for free response level" do
    free_response_level = create :level, name: 'A question', long_instructions: 'Answer this question.',
      type: 'FreeResponse'
    assert_equal free_response_level.get_question_text, 'Answer this question.'
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

    assert_equal "xml", toolbox.root.name
    assert_equal "toolbox", toolbox.root.attributes["id"].value

    first_category = toolbox.root.children.first
    assert_equal "category", first_category.name

    first_block = toolbox.root.css('category > *').first
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
    level.short_instructions = 'test!'
    assert_equal 'test!', level.properties['short_instructions']
    assert_equal level.short_instructions, level.properties['short_instructions']
  end

  test 'create with serialized properties' do
    level = Blockly.create(short_instructions: 'test')
    assert_equal 'test', level.short_instructions
    level.short_instructions = 'test2'
    assert_equal 'test2', level.short_instructions
  end

  test 'update serialized column with properties hash' do
    level = Blockly.create(short_instructions: 'test')
    level.update(short_instructions: 'test2', properties: {skin: 'skin'})
    assert_equal 'test2', level.short_instructions
    assert_equal 'skin', level.skin
  end

  test 'cannot have non-existent properties' do
    level = Blockly.create(short_instructions: 'test')
    level.update(properties: {property_that_does_not_exist: 'impossible value storage'})
    assert_raises(NoMethodError) do
      level.property_that_does_not_exist
    end
  end

  test 'can have video key' do
    level = Blockly.create(short_instructions: 'test')
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

  test 'returns locale-specific video with related videos' do
    level = create(:level)
    en_video = create(:video)
    es_video = create(:video)
    es_video.locale = 'es-MX'
    es_video.key = en_video.key
    es_video.save!
    level.update(properties: {video_key: en_video.key})

    with_locale('es-MX') do
      assert_includes(level.related_videos, es_video)
      refute_includes(level.related_videos, en_video)
    end
    with_locale('en-US') do
      assert_includes(level.related_videos, en_video)
      refute_includes(level.related_videos, es_video)
    end
  end

  test 'returns concept videos with related videos' do
    level = create(:level)
    level.concepts = [create(:concept, :with_video), create(:concept, :with_video)]
    assert_includes(level.related_videos, level.concepts.first.related_video)
    assert_includes(level.related_videos, level.concepts.second.related_video)
  end

  test 'update custom level from file' do
    LevelLoader.import_levels 'config/scripts/levels/K-1 Bee 2.level'
    level = Level.find_by_name('K-1 Bee 2')
    assert_equal 'bee', level.skin
    assert_equal '[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,1,0,-1,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]',
      level.properties['initial_dirt']
  end

  test 'creating custom level from file sets level_concept_difficulty' do
    Level.find_by_name('K-1 Bee 2')&.destroy
    assert_nil Level.find_by_name('K-1 Bee 2')
    LevelLoader.import_levels 'config/scripts/levels/K-1 Bee 2.level'
    level = Level.find_by_name('K-1 Bee 2')
    refute_nil level

    assert_equal 3, level.level_concept_difficulty.sequencing
  end

  test 'prioritize property over column data in merged update' do
    level = Level.create(short_instructions: 'test', type: 'Maze')
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
    assert_nil level.ideal_level_source
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
    # mock file so we don't actually write a file
    File.expects(:write).twice # once for create and once for save

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
    maze = create(:maze, published: true)
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
    level = Level.create(name: 'test delete properties', short_instructions: 'test', type: 'Studio', embed: true)

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

  test 'encrypted level properties are preserved after export and import' do
    CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)

    level = Level.create(name: 'test encrypted properties', short_instructions: 'test', type: 'Artist', encrypted: true, disable_sharing: true, notes: 'original notes')
    assert level.disable_sharing
    assert level.encrypted

    level_xml = level.to_xml
    n = Nokogiri::XML(level_xml, &:noblanks)
    level_config = n.xpath('//../config').first.child
    encrypted_hash = JSON.parse(level_config.text)
    assert encrypted_hash['encrypted_properties']&.is_a? String
    refute encrypted_hash['properties']
    assert encrypted_hash['encrypted_notes']&.is_a? String
    refute encrypted_hash['notes']

    level.disable_sharing = false
    level.notes = nil
    decrypted_hash = level.load_level_xml(n)
    refute decrypted_hash['encrypted_properties']
    assert decrypted_hash['properties']
    assert decrypted_hash['properties']['disable_sharing']
    assert decrypted_hash['properties']['encrypted']
    refute decrypted_hash['encrypted_notes']
    assert_equal decrypted_hash['notes'], 'original notes'
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
    CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)

    level = Applab.create(name: 'applab_with_example')
    level.examples = ['xxxxxx', 'yyyyyy']

    # go through a save/load
    level.save!
    level = level.reload

    assert_equal ['xxxxxx', 'yyyyyy'], level.examples

    # this property is encrypted, not plaintext
    assert_nil level.properties['examples']
    assert level.properties['encrypted_examples']

    # take out nils and empty strings
    level.examples = ['xxxxxx', nil, "", 'yyyyyy', ""]

    # go through a save/load
    level.save!
    level = level.reload

    assert_equal ['xxxxxx', 'yyyyyy'], level.examples

    # does not crash if decryption is busted
    CDO.stubs(:properties_encryption_key).returns(nil)
    assert_nil level.examples
  end

  test 'gamelab examples' do
    CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)

    level = Gamelab.create(name: 'gamelab_with_example')
    level.examples = ['xxxxxx', 'yyyyyy']

    # go through a save/load
    level.save!
    level = level.reload

    assert_equal ['xxxxxx', 'yyyyyy'], level.examples

    # this property is encrypted, not plaintext
    assert_nil level.properties['examples']
    assert level.properties['encrypted_examples']

    # take out nils and empty strings
    level.examples = ['xxxxxx', nil, "", 'yyyyyy', ""]

    # go through a save/load
    level.save!
    level = level.reload

    assert_equal ['xxxxxx', 'yyyyyy'], level.examples

    # does not crash if decryption is busted
    CDO.stubs(:properties_encryption_key).returns(nil)
    assert_nil level.examples
  end

  test 'weblab examples' do
    CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)

    level = Weblab.create(name: 'weblab_with_example')
    level.examples = ['xxxxxx', 'yyyyyy']

    # go through a save/load
    level.save!
    level = level.reload

    assert_equal ['xxxxxx', 'yyyyyy'], level.examples

    # this property is encrypted, not plaintext
    assert_nil level.properties['examples']
    assert level.properties['encrypted_examples']

    # take out nils and empty strings
    level.examples = ['xxxxxx', nil, "", 'yyyyyy', ""]

    # go through a save/load
    level.save!
    level = level.reload

    assert_equal ['xxxxxx', 'yyyyyy'], level.examples

    # does not crash if decryption is busted
    CDO.stubs(:properties_encryption_key).returns(nil)
    assert_nil level.examples
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

    refute levels.include?(match_level)
    refute levels.include?(level_with_ideal_level_source_already)
    refute levels.include?(freeplay_artist)
    assert levels.include?(regular_artist)
  end

  test 'calculate_ideal_level_source_id does nothing if no level sources' do
    level = Maze.create(name: 'maze level with no level sources')
    assert_nil level.ideal_level_source_id

    level.calculate_ideal_level_source_id
    assert_nil level.ideal_level_source_id
  end

  test 'calculate_ideal_level_source_id sets ideal_level_source_id to best solution' do
    level = Maze.create(name: 'maze level with level sources')
    assert_nil level.ideal_level_source_id

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

  test 'localizes callouts' do
    test_locale = :"te-ST"
    level_name = 'test_localize_callouts'

    I18n.locale = test_locale
    custom_i18n = {
      'data' => {
        'callouts' => {
          level_name => {
            "first": "first test markdown",
            "second": "second test markdown",
          }
        }
      }
    }

    I18n.backend.store_translations test_locale, custom_i18n

    level = Level.create(
      name: level_name,
      user: create(:user),
      callout_json: JSON.generate(
        [
          {"callout_text": "first english markdown", "localization_key": "first"},
          {"callout_text": "second english markdown", "localization_key": "second"},
        ]
      )
    )

    callouts = level.available_callouts nil

    assert_equal callouts[0].callout_text, "first test markdown"
    assert_equal callouts[1].callout_text, "second test markdown"
  end

  test 'handles bad callout localization data' do
    test_locale = :"te-ST"
    level_name = 'test_localize_callouts'
    I18n.locale = test_locale

    level = Level.create(
      name: level_name,
      user: create(:user),
      callout_json: JSON.generate(
        [
          {"callout_text": "first english markdown", "localization_key": "first"},
          {"callout_text": "second english markdown", "localization_key": "second"},
        ]
      )
    )

    custom_i18n = {
      'data' => {
        'callouts' => {
          "#{level_name}_callout" => {
            first: nil,
            second: nil
          }
        }
      }
    }

    I18n.backend.store_translations test_locale, custom_i18n

    callouts = level.available_callouts nil

    assert_equal callouts[0].callout_text, "first english markdown"
    assert_equal callouts[1].callout_text, "second english markdown"

    custom_i18n = {
      'data' => {
        'callouts' => {
        }
      }
    }

    I18n.backend.store_translations test_locale, custom_i18n

    callouts = level.available_callouts nil

    assert_equal callouts[0].callout_text, "first english markdown"
    assert_equal callouts[1].callout_text, "second english markdown"
  end

  test 'create unplugged level from level builder' do
    Unplugged.any_instance.stubs(:update_i18n).with do |name, new_strings|
      I18n.backend.store_translations I18n.locale, {'data' => {'unplugged' => {name => new_strings}}}
    end

    data = {name: 'New Unplugged Name', title: 'Test Unplugged Level', description: 'This is a test.'}
    level = Unplugged.create_from_level_builder({}, data)

    assert_equal data[:name], level.name
    assert_equal data[:title], level.title
    assert_equal data[:description], level.description
    assert_equal data[:description], I18n.t("data.unplugged.#{data[:name]}.desc")
  end

  test "audit log is initially null" do
    data = @custom_maze_data.dup
    data[:name] = "test audit log nul"
    level = Level.create(data)
    assert level.valid?
    assert_nil level.audit_log
  end

  test "audit log will explode properties" do
    data = @custom_maze_data.dup
    data[:name] = "test audit log properties"
    level = Level.create(data)

    level.skin = "bee"
    level.log_changes

    assert_equal 1, JSON.parse(level.audit_log).length
    assert_equal ["skin"], JSON.parse(level.audit_log).first["changed"]
  end

  test "audit log will self-truncate" do
    data = @custom_maze_data.dup
    data[:name] = "test audit log truncation"
    level = Level.create(data)

    # Create an audit log that is almost the max length
    huge_array = ["test"] * 9360
    level.audit_log = JSON.dump(huge_array)

    assert_equal 65521, level.audit_log.length
    assert_equal 9360, JSON.parse(level.audit_log).length

    # add a new entry that will put us over the limit
    level.short_instructions = "new actual instructions"
    level.log_changes

    # audit log should have dropped off several entries in order get back under
    # the limit, since the test entries are individually much smaller than the
    # new actual entry
    assert_equal 65532, level.audit_log.length
    assert_equal 9350, JSON.parse(level.audit_log).length
  end

  test "can validate XML field with valid XML" do
    level = Level.new(@turtle_data.merge({name: 'xml validation level'}))

    level.start_blocks = '<xml>blah blah</xml>'

    assert level.valid?
  end

  test "can save non-XML in a non-XML field" do
    Level.find_by_name(@gamelab_data[:name]).try(:destroy)
    level = Level.new(@gamelab_data)

    level.start_blocks = 'var i = 1;'

    assert level.valid?
  end

  test "cannot save non-XML in an XML field" do
    level = Level.new(@turtle_data.merge({name: 'xml validation level'}))

    level.start_blocks = 'var i = 1'

    assert_raises(Nokogiri::XML::SyntaxError) do
      level.valid?
    end
  end

  test 'does not use droplet for weblab levels' do
    level = Weblab.new(
      name: 'test studioEC level',
      type: 'Blockly',
      game_id: Game.by_name('weblab'),
    )

    refute level.uses_droplet?
  end

  test 'can clone' do
    old_level = create :level, name: 'old level', start_blocks: '<xml>foo</xml>'
    new_level = old_level.clone_with_name('new level')
    assert_equal 'new level', new_level.name
    assert_equal '<xml>foo</xml>', new_level.start_blocks
  end

  test 'can clone multi level and preserve encrypted flag' do
    dsl_text = <<EOS
name 'old multi level'
title 'Multiple Choice'
question 'What is your favorite color?'
wrong 'Red'
wrong 'Green'
right 'Blue'
EOS

    old_level = create :multi, name: 'old multi level'
    old_level.stubs(:dsl_text).returns(dsl_text)

    new_level = old_level.clone_with_name('new multi level')
    assert_equal 'new multi level', new_level.name
    assert_equal 1, new_level.properties['questions'].length
    assert_equal 3, new_level.properties['answers'].length
    assert_equal 'Blue', new_level.properties['answers'].last['text']
    refute new_level.encrypted

    old_level.encrypted = true
    new_level = old_level.clone_with_name('encrypted level')
    assert_equal 'encrypted level', new_level.name
    assert_equal 1, new_level.properties['questions'].length
    assert_equal 3, new_level.properties['answers'].length
    assert_equal 'Blue', new_level.properties['answers'].last['text']
    assert new_level.encrypted, 'clone_with_name preserves encrypted flag'

    new_level = old_level.clone_with_suffix(' copy')
    assert_equal 'old multi level copy', new_level.name
    assert_equal 3, new_level.properties['answers'].length
    assert new_level.encrypted, 'clone_with_suffix preserves encrypted flag'
  end

  test 'can clone with suffix' do
    old_level = create :level, name: 'level', start_blocks: '<xml>foo</xml>'
    new_level = old_level.clone_with_suffix(' copy')
    assert_equal 'level copy', new_level.name
    assert_equal '<xml>foo</xml>', new_level.start_blocks
    assert_equal old_level.id, new_level.parent_level_id
    assert_equal ' copy', new_level.name_suffix
  end

  test 'clone with suffix replaces old suffix' do
    level_1 = create :level, name: 'my_level_1'

    # level_1 has no name suffix, so the new suffix is appended.
    level_2 = level_1.clone_with_suffix('_2')
    assert_equal 'my_level_1_2', level_2.name
    assert_equal level_1.id, level_2.parent_level_id
    assert_equal '_2', level_2.name_suffix

    # level_2 has a name suffix, which the new suffix replaces.
    level_3 = level_2.clone_with_suffix('_3')
    assert_equal 'my_level_1_3', level_3.name
    assert_equal level_2.id, level_3.parent_level_id
    assert_equal '_3', level_3.name_suffix
  end

  test 'clone with suffix properly escapes suffixes' do
    level_1 = create :level, name: 'your_level_1'

    tricky_suffix = '[(.\\'

    level_2 = level_1.clone_with_suffix(tricky_suffix)
    assert_equal "your_level_1#{tricky_suffix}", level_2.name

    level_3 = level_2.clone_with_suffix('_3')
    assert_equal 'your_level_1_3', level_3.name
  end

  test 'clone with same suffix copies and shares project template level' do
    template_level = create :level, name: 'template level', start_blocks: '<xml>template</xml>'
    level_1 = create :level, name: 'level 1'
    level_1.project_template_level_name = template_level.name
    level_2 = create :level, name: 'level 2'
    level_2.project_template_level_name = template_level.name

    level_1_copy = level_1.clone_with_suffix(' copy')
    level_2_copy = level_2.clone_with_suffix(' copy')

    template_level_copy = Level.find_by_name('template level copy')
    assert_equal template_level.id, template_level_copy.parent_level_id
    assert_equal ' copy', template_level_copy.name_suffix
    assert_equal '<xml>template</xml>', template_level_copy.start_blocks

    assert_equal template_level_copy, level_1_copy.project_template_level
    assert_equal 'level 1 copy', level_1_copy.name
    assert_equal level_1.id, level_1_copy.parent_level_id
    assert_equal ' copy', level_1_copy.name_suffix

    assert_equal template_level_copy, level_2_copy.project_template_level
    assert_equal 'level 2 copy', level_2_copy.name
    assert_equal level_2.id, level_2_copy.parent_level_id
    assert_equal ' copy', level_2_copy.name_suffix
  end

  test 'clone with suffix copies contained levels' do
    contained_level_1 = create :level, name: 'contained level 1', type: 'FreeResponse'
    contained_level_2 = create :level, name: 'contained level 2'

    # level 1 has 1 contained level

    level_1 = create :level, name: 'level 1'
    level_1.contained_level_names = [contained_level_1.name]
    level_1_copy = level_1.clone_with_suffix(' copy')

    refute_nil level_1_copy.contained_levels
    assert_equal 1, level_1_copy.contained_levels.size
    contained_level_1_copy = Level.find_by_name('contained level 1 copy')
    assert_equal 'FreeResponse', contained_level_1_copy.type
    assert_equal contained_level_1_copy, level_1_copy.contained_levels.first

    # level 2 has 2 contained levels, one of which has already been copied

    level_2 = create :level, name: 'level 2'
    level_2.contained_level_names = [
      contained_level_1.name,
      contained_level_2.name
    ]
    level_2_copy = level_2.clone_with_suffix(' copy')
    contained_level_2_copy = Level.find_by_name('contained level 2 copy')
    refute_nil level_2_copy.contained_levels
    assert_equal 2, level_2_copy.contained_levels.size
    assert_equal contained_level_1_copy, level_2_copy.contained_levels.first
    assert_equal contained_level_2_copy, level_2_copy.contained_levels.last
  end

  test 'clone with suffix sets editor experiment' do
    old_level = create :level, name: 'old level'
    new_level = old_level.clone_with_suffix(' copy', editor_experiment: 'level-editors')
    assert_equal 'old level copy', new_level.name
    assert_equal 'level-editors', new_level.editor_experiment, 'clone_with_suffix adds editor experiment'
  end

  test 'cloning multi level sets editor experiment' do
    old_dsl_text = <<EOS
name 'old multi level'
title 'Multiple Choice'
question 'What is your favorite color?'
wrong 'Red'
wrong 'Green'
right 'Blue'
EOS

    expected_new_dsl_text = <<EOS
name 'old multi level copy'
editor_experiment 'level-editors'
title 'Multiple Choice'
question 'What is your favorite color?'
wrong 'Red'
wrong 'Green'
right 'Blue'
EOS

    Rails.application.config.stubs(:levelbuilder_mode).returns true
    File.expects(:write).once.with do |_pathname, new_dsl_text|
      new_dsl_text == expected_new_dsl_text
    end

    old_level = create :multi, name: 'old multi level'
    old_level.stubs(:dsl_text).returns(old_dsl_text)

    new_level = old_level.clone_with_suffix(' copy', editor_experiment: 'level-editors')
    assert_equal 'old multi level copy', new_level.name
    assert_equal 'level-editors', new_level.editor_experiment
  end

  test 'contained_level_names filters blank names before validation' do
    level = build :level
    level.contained_level_names = ['', 'real_name']
    assert_equal level.contained_level_names, ['', 'real_name']
    level.valid?
    assert_equal level.contained_level_names, ['real_name']
  end

  test 'add_starter_asset! saves key-value pair in level properties' do
    level = create :level
    assert_nil level.starter_assets

    level.add_starter_asset!("my-file.png", "12345.png")
    level.reload
    expected_assets = {"my-file.png" => "12345.png"}
    assert_equal expected_assets, level.starter_assets

    level.add_starter_asset!("file with spaces.png", "54321.png")
    level.reload
    expected_assets["file with spaces.png"] = "54321.png"
    assert_equal expected_assets, level.starter_assets

    # Overwrite "my-file.png" starter asset
    level.add_starter_asset!("my-file.png", "6789.png")
    level.reload
    expected_assets["my-file.png"] = "6789.png"
    assert_equal expected_assets, level.starter_assets
  end
  test 'add_starter_asset! raises if level fails to save' do
    level = create :level
    level.expects(:valid?).returns(false)

    assert_raises ActiveRecord::RecordInvalid do
      level.add_starter_asset!("my-file.png", "123.png")
    end
  end

  test 'remove_starter_asset! returns true if starter_assets are nil' do
    level = create :level
    level.expects(:save).never
    assert_nil level.starter_assets

    assert level.remove_starter_asset!('non-existent-asset.png')
  end

  test 'remove_starter_asset! deletes key-value pair from starter_assets' do
    key = 'my-key.png'
    level = create :level, starter_assets: {key => '123-abc.png'}
    assert_equal 1, level.starter_assets.length

    successful_save = level.remove_starter_asset!(key)
    level.reload

    assert successful_save
    assert_nil level.starter_assets
  end
end
