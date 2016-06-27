require 'test_helper'

class LevelsControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    Level.any_instance.stubs(:write_to_file?).returns(false) # don't write to level files

    @level = create(:level)
    @admin = create(:admin)
    @not_admin = create(:user)
    @levelbuilder = create(:levelbuilder)
    sign_in(@levelbuilder)
    @program = '<hey/>'
  end

  test "should get index" do
    get :index, game_id: @level.game
    assert_response :success
    assert_not_nil assigns(:levels)
  end

  test "should get new" do
    get :new, game_id: @level.game
    assert_response :success
  end

  test "should get new maze" do
    get :new, game_id: @level.game, type: "Maze"
    assert_response :success
  end

  test "should get new karel" do
    get :new, type: 'Karel'

    css = css_select "#level_type"
    assert_equal "Karel", css.first.attributes['value'].to_s
    assert_response :success
  end

  test "should get new of all types" do
    Level.descendants.each do |klass|
      get :new, type: klass.name

      assert_response :success
    end
  end

  test "should alphanumeric order custom levels on new" do
    Level.where(user_id: @levelbuilder.id).map(&:destroy)
    level_1 = create(:level, user: @levelbuilder, name: "BBBB")
    level_2 = create(:level, user: @levelbuilder, name: "AAAA")
    level_3 = create(:level, user: @levelbuilder, name: "Z1")
    level_4 = create(:level, user: @levelbuilder, name: "Z10")
    level_5 = create(:level, user: @levelbuilder, name: "Z2")

    get :new, game_id: @level.game

    assert_equal [level_2, level_1, level_3, level_5, level_4], assigns(:levels)
  end

  test "should not get builder if not levelbuilder" do
    [@not_admin, @admin].each do |user|
      sign_in user
      get :new, game_id: @level.game
      assert_response :forbidden
    end
  end

  test "should create maze level" do
    maze = fixture_file_upload("maze_level.csv", "r")
    game = Game.find_by_name("CustomMaze")

    assert_difference('Level.count') do
      post :create, :level => {:name => "NewCustomLevel", :instructions => "Some Instructions", :type => 'Maze'}, :game_id => game.id, :program => @program, :maze_source => maze, :size => 8
    end

    assert assigns(:level)
    assert assigns(:level).game
    assert_equal edit_level_path(assigns(:level)), JSON.parse(@response.body)["redirect"]
  end

  test "should create maze levels with step mode" do
    maze = fixture_file_upload("maze_level.csv", "r")
    game = Game.find_by_name("CustomMaze")

    assert_difference('Level.count') do
      post :create, :level => {:name => "NewCustomLevel", :instructions => "Some Instructions", :step_mode => 1, :type => 'Maze'}, :game_id => game.id, :program => @program, :maze_source => maze, :size => 8
    end

    assert assigns(:level)
    assert assigns(:level).step_mode
  end

  test "should create maze levels with k1 on" do
    maze = fixture_file_upload("maze_level.csv", "r")
    game = Game.find_by_name("CustomMaze")

    assert_difference('Level.count') do
      post :create, :level => {:name => "NewCustomLevel", :instructions => "Some Instructions", :step_mode => 1, :type => 'Maze', :is_k1 => true}, :game_id => game.id, :program => @program, :maze_source => maze, :size => 8
    end

    assert assigns(:level)
    assert assigns(:level).is_k1
  end

  test "should create maze levels with k1 off" do
    maze = fixture_file_upload("maze_level.csv", "r")
    game = Game.find_by_name("CustomMaze")

    assert_difference('Level.count') do
      post :create, :level => {:name => "NewCustomLevel", :instructions => "Some Instructions", :step_mode => 1, :type => 'Maze', :is_k1 => false}, :game_id => game.id, :program => @program, :maze_source => maze, :size => 8
    end

    assert assigns(:level)
    assert !assigns(:level).is_k1
  end

  test "should not create invalid maze level" do
    maze = fixture_file_upload("maze_level_invalid.csv", "r")
    game = Game.find_by_name("CustomMaze")

    assert_no_difference('Level.count') do
      post :create, :level => {:name => "NewCustomLevel", :instructions => "Some Instructions", :type => 'Maze'}, :game_id => game.id, :program => @program, :maze_source => maze, :size => 8
    end

    assert_response :not_acceptable
  end

  test "should create karel level" do
    karel = fixture_file_upload("karel_level.csv", "r")
    game = Game.find_by_name("CustomMaze")

    assert_difference('Level.count') do
      post :create, :level => {:name => "NewCustomLevel", :instructions => "Some Instructions", :type => 'Karel'}, :game_id => game.id, :program => @program, :maze_source => karel, :size => 8
    end

    assert assigns(:level)
    assert assigns(:level).game
    assert_equal @levelbuilder, assigns(:level).user

    assert_equal edit_level_path(assigns(:level)), JSON.parse(@response.body)["redirect"]
  end

  test "should not create invalid karel level" do
    karel = fixture_file_upload("karel_level_invalid.csv", "r")
    game = Game.find_by_name("CustomMaze")

    assert_no_difference('Level.count') do
      post :create, :level => {:name => "NewCustomLevel", :instructions => "Some Instructions", :type => 'Karel'}, :game_id => game.id, :program => @program, :maze_source => karel, :size => 8
    end

    assert_response :not_acceptable
  end

  test "should create artist level" do
    game = Game.find_by_name("Custom")
    assert_difference('Level.count') do
      post :create, :level => { :name => "NewCustomLevel", :type => 'Artist' }, :game_id => game.id, :program => @program
    end

    assert_equal edit_level_path(assigns(:level)), JSON.parse(@response.body)["redirect"]
  end

  test "should create studio level" do
    game = Game.find_by_name("CustomStudio")
    assert_difference('Level.count') do
      post :create, :level => { :name => "NewCustomLevel", :type => 'Studio' }, :game_id => game.id, :program => @program
    end

    assert_equal edit_level_path(assigns(:level)), JSON.parse(@response.body)["redirect"]
  end

  test "should create and destroy custom level with level file" do
    # Enable writing custom level to file for this specific test only
    Level.any_instance.stubs(:write_to_file?).returns(true)

    level_name = 'TestCustomLevel'
    begin
      post :create, :level => { :name => level_name, :type => 'Artist', :published => true }, :game_id => Game.find_by_name("Custom").id, :program => @program
      level = Level.find_by(name: level_name)
      file_path = LevelLoader.level_file_path(level.name)
      assert_equal true, file_path && File.exist?(file_path)
      delete :destroy, id: level
      assert_equal false, file_path && File.exist?(file_path)
    ensure
      file_path = LevelLoader.level_file_path(level_name)
      File.delete(file_path) if file_path && File.exist?(file_path)
    end
  end

  test "should not create invalid artist level" do
    game = Game.find_by_name("Custom")
    assert_no_difference('Level.count') do
      post :create, :level => { :name => '', :type => 'Artist' }, :game_id => game.id, :program => @program
    end
    assert_response :not_acceptable
  end

  test "should update blocks" do
    post :update_blocks, :level_id => @level.id, :game_id => @level.game.id, :type => 'toolbox_blocks', :program => @program
    assert_response :success
    level = assigns(:level)
    assert_equal level.properties[:toolbox_blocks.to_s], @program
  end

  test "should not update blocks if not levelbuilder" do
    [@not_admin, @admin].each do |user|
      sign_in user
      post :update_blocks, :level_id => @level.id, :game_id => @level.game.id, :type => 'toolbox_blocks', :program => @program
      assert_response :forbidden
    end
  end

  test "should not edit level if not custom level" do
    level = Script.twenty_hour_script.levels.first
    can_edit =  Ability.new(@levelbuilder).can? :edit, level
    assert_equal false, can_edit

    post :update_blocks, :level_id => level.id, :game_id => level.game.id, :type => 'toolbox_blocks', :program => @program
    assert_response :forbidden
  end

  test "should not create level if not levelbuilder" do
    [@not_admin, @admin].each do |user|
      sign_in user
      assert_no_difference('Level.count') do
        post :create, :name => "NewCustomLevel", :program => @program
      end

      assert_response :forbidden
    end
  end

  # This should represent the behavior on production.
  test "should not modify level if not in levelbuilder mode" do
    Rails.application.config.stubs(:levelbuilder_mode).returns false

    post :create, :name => "NewCustomLevel", :program => @program
    assert_response :forbidden
  end

  test "should show level" do
    get :show, id: @level
    assert_response :success
  end

  test "should show level on test env" do
    Rails.env = "test"
    get :show, id: @level
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @level
    assert_response :success
  end

  test "should get edit blocks" do
    @level.update(toolbox_blocks: @program)
    get :edit_blocks, level_id: @level.id, type: 'toolbox_blocks'
    assert_equal @program, assigns[:level_view_options][:start_blocks]
  end

  test "should load file contents when editing a dsl defined level" do
    level_path = 'config/scripts/test_demo_level.external'
    data, _ = External.parse_file level_path
    External.setup data

    level = Level.find_by_name 'Test Demo Level'
    get :edit, id: level.id

    assert_equal level_path, assigns(:level).filename
    assert_equal "name 'test demo level'", assigns(:level).dsl_text.split("\n").first
  end

  test "should load encrypted file contents when editing a dsl defined level with the wrong encryption key" do
    CDO.stubs(:properties_encryption_key).returns("thisisafakekeyyyyyyyyyyyyyyyyyyyyy")
    level = Level.find_by_name 'Test External Markdown'
    get :edit, id: level.id

    assert_equal 'config/scripts/test_external_markdown.external', assigns(:level).filename
    assert_equal "name", assigns(:level).dsl_text.split("\n").first.split(" ").first
    assert_equal "encrypted", assigns(:level).dsl_text.split("\n")[1].split(" ").first
  end

  test "should update level" do
    patch :update, id: @level, level: {  }
    # Level update now uses AJAX callback, returns a 200 JSON response instead of redirect
    assert_response :success
  end

  test "update sends JSON::ParserError to user" do
    level = create(:applab)
    invalid_json = "{,}"
    patch :update, id: level, level: {"code_functions" => invalid_json}
    # Level update now uses AJAX callback, returns a 200 JSON response instead of redirect
    assert_response :unprocessable_entity

    expected = {'code_functions' => ["JSON::ParserError: 757: unexpected token at '{,}'"]}
    assert_equal expected, JSON.parse(@response.body)
  end

  test "should destroy level" do
    assert_difference('Level.count', -1) do
      delete :destroy, id: @level
    end

    assert_redirected_to levels_path
  end

  test "should route new to levels" do
    assert_routing({method: "post", path: "/levels"}, {controller: "levels", action: "create"})
  end

  test "should use level for route helper" do
    level = create(:artist)
    get :edit, id: level
    css = css_select "form[action=\"#{level_path(level)}\"]"
    assert_not css.empty?
  end

  test "should use first skin as default" do
    maze = fixture_file_upload("maze_level.csv", "r")
    game = Game.find_by_name("CustomMaze")

    post :create, :level => {:name => "NewCustomLevel", :instructions => "Some Instructions", :type => 'Maze'}, :game_id => game.id, :program => @program, :maze_source => maze, :size => 8
    assert_equal Maze.skins.first, assigns(:level).skin
  end

  test "should use skin from params on create" do
    maze = fixture_file_upload("maze_level.csv", "r")
    game = Game.find_by_name("CustomMaze")

    post :create, :level => {:skin => Maze.skins.last, :name => "NewCustomLevel", :instructions => "Some Instructions", :type => 'Maze'}, :game_id => game.id, :program => @program, :maze_source => maze, :size => 8
    assert_equal Maze.skins.last, assigns(:level).skin
  end

  test "edit form should include skins" do
    level = create(:artist)
    skins = level.class.skins
    get :edit, id: level, game_id: level.game
    skin_select = css_select "#level_skin option"
    values = skin_select.map { |option| option.attributes["value"].to_s }
    assert_equal skins, values
  end

  test "should populate artist start direction with current value" do
    level = create(:artist, :start_direction => 180)
    get :edit, id: level, game_id: level.game
    assert_select "#level_start_direction[value='180']"
  end

  test "should populate maze start direction with current value" do
    level = create(:maze, :start_direction => 2)
    get :edit, id: level, game_id: level.game
    assert_select "#level_start_direction option[value='2'][selected='selected']"
  end

  test "should populate level skin with current value" do
    level = create(:maze, :skin => 'pvz')
    get :edit, id: level, game_id: level.game
    assert_select "#level_skin option[value='pvz'][selected='selected']"
  end

  test 'should render level num in title' do
    get :show, id: @level, game_id: @level.game
    assert_match /#{Regexp.quote(@level.level_num)}/, Nokogiri::HTML(@response.body).css('title').text.strip
  end

  test "should update maze data properly" do
    game = Game.find_by_name("CustomMaze")
    post :create, :level => {:name => "NewCustomLevel", :instructions => "Some Instructions", :type => 'Maze'},
      :game_id => game.id, :maze_source => fixture_file_upload("maze_level.csv", "r"), :size => 8

    my_level = Level.where(name: 'NewCustomLevel').first
    maze_json = JSON.parse(my_level.maze)
    maze_json[0][0] = '2'
    maze_json[2][0] = 3

    patch :update, :level => {:maze_data => maze_json.to_json}, id: my_level, game_id: game.id

    new_maze = JSON.parse(Level.where(name: 'NewCustomLevel').first.maze)
    maze_json[0][0] = 2
    assert_equal maze_json, new_maze
  end

  test "should update karel data properly" do
    game = Game.find_by_name("CustomMaze")
    maze_array = [
      [{"tileType": 0}, {"tileType": 0}, {"tileType": 0}, {"tileType": 0}, {"tileType": 0}, {"tileType": 0}, {"tileType": 0}, {"tileType": 0}],
      [{"tileType": 0}, {"tileType": 0}, {"tileType": 0}, {"tileType": 0}, {"tileType": 0}, {"tileType": 0}, {"tileType": 0}, {"tileType": 0}],
      [{"tileType": 0}, {"tileType": 1}, {"tileType": 1}, {"tileType": 1}, {"tileType": 1}, {"tileType": 1}, {"tileType": 1}, {"tileType": 0}],
      [{"tileType": 0}, {"tileType": 2}, {"tileType": 1, "featureType": 2, "value": 1, "cloudType": 1, "range": 1}, {"tileType": 1, "featureType": 2, "value": 1, "cloudType": 2, "range": 1}, {"tileType": 1, "featureType": 2, "value": 1, "cloudType": 3, "range": 1}, {"tileType": 1, "featureType": 1, "value": 1, "cloudType": 4, "range": 1}, {"tileType": 1}, {"tileType": 0}],
      [{"tileType": 0}, {"tileType": 1}, {"tileType": 1}, {"tileType": 1}, {"tileType": 1}, {"tileType": 1}, {"tileType": 1}, {"tileType": 0}],
      [{"tileType": 0}, {"tileType": 1}, {"tileType": 1}, {"tileType": 1}, {"tileType": 1}, {"tileType": 1}, {"tileType": 1}, {"tileType": 0}],
      [{"tileType": 0}, {"tileType": 0}, {"tileType": 0}, {"tileType": 0}, {"tileType": 0}, {"tileType": 0}, {"tileType": 0}, {"tileType": 0}],
      [{"tileType": 0}, {"tileType": 0}, {"tileType": 0}, {"tileType": 0}, {"tileType": 0}, {"tileType": 0}, {"tileType": 0}, {"tileType": 0}]
    ]
    post :create, :level => {:name => "NewCustomLevel", :instructions => "Some Instructions", :type => 'Karel'}, :game_id => game.id, :size => 8
    my_level = Level.find_by(name: 'NewCustomLevel')

    patch :update, :level => {:maze_data => maze_array.to_json}, id: my_level, game_id: game.id
    new_maze = Level.find_by(name: 'NewCustomLevel').serialized_maze
    assert_equal maze_array.to_json, new_maze
  end

  test 'should show match level' do
    my_level = create :match, name: 'MatchLevel', type: 'Match'
    get :show, id: my_level, game_id: my_level.game
  end

  test 'should show legacy unplugged level' do
    level = create :unplugged, name: 'OldUnplugged', type: 'Unplugged'
    get :show, id: level, game_id: level.game
    assert_select 'div.unplugged > h2', 'Test title'
    assert_select 'div.unplugged > p', 'Test description'
  end

  test 'should hide legacy unplugged pdf download button for students' do
    level = create :unplugged, name: 'OldUnplugged', type: 'Unplugged'
    teacher = create(:teacher)
    sign_out(@levelbuilder)
    sign_in(teacher)
    get :show, id: level, game_id: level.game
    assert_select '.pdf-button'

    @controller = LevelsController.new
    student = create(:student)
    sign_out(teacher)
    sign_in(student)
    get :show, id: level, game_id: level.game
    assert_select '.pdf-button', false, "Students shouldn't see PDF download button"
  end

  test 'should show new style unplugged level' do
    level = create :unplugged, name: 'NewUnplugged', type: 'Unplugged'
    get :show, id: level, game_id: level.game

    assert_select 'div.unplugged > h2', 'Test title'
    assert_select 'div.unplugged > p', 'Test description'
  end

  test 'should hide unplugged pdf download section for students' do
    level = create :unplugged, name: 'NewUnplugged', type: 'Unplugged'
    teacher = create(:teacher)
    sign_out(@levelbuilder)
    sign_in(teacher)
    get :show, id: level, game_id: level.game
    assert_select '.pdf-button'

    @controller = LevelsController.new
    student = create(:student)
    sign_out(teacher)
    sign_in(student)
    get :show, id: level, game_id: level.game
    assert_select '.lesson-plan', false, "Students shouldn't see lesson plan"
  end

  test "should clone" do
    game = Game.find_by_name("Custom")
    old = create(:level, game_id: game.id, name: "Fun Level")
    assert_difference('Level.count') do
      post :clone, level_id: old.id, name: "Fun Level (copy 1)"
    end

    new_level = assigns(:level)
    assert_equal new_level.game, old.game
    assert_equal new_level.name, "Fun Level (copy 1)"
    assert_equal "/levels/#{new_level.id}/edit", URI(JSON.parse(@response.body)['redirect']).path
  end

  test 'cannot update level name with just a case change' do
    level = create :level, name: 'original name'

    post :update, id: level.id, level: {name: 'ORIGINAL NAME'}

    assert_response 422

    # error message
    assert assigns(:level).errors[:name]

    level = level.reload
    # same name
    assert_equal 'original name', level.name
  end

  test 'no error message when not actually changing level name' do
    level = create :level, name: 'original name'

    post :update, id: level.id, level: {name: 'original name'}

    assert_response 200

    # no error message
    assert assigns(:level).errors[:name].blank?

    level = level.reload
    # same name
    assert_equal 'original name', level.name
  end

  test 'can update level name' do
    level = create :level, name: 'original name'

    post :update, id: level.id, level: {name: 'different name'}

    level = level.reload
    # same name
    assert_equal 'different name', level.name
  end

  test 'trailing spaces in level name get stripped' do
    level = create :level, name: 'original name '
    assert_equal 'original name', level.name

    post :update, id: level.id, level: {name: 'different name  '}

    level = level.reload
    # same name
    assert_equal 'different name', level.name
  end

  test 'can show level when not signed in' do
    set_env :test

    level = create :artist
    sign_out @levelbuilder

    get :edit, id: level
    assert_response :redirect

    get :show, id: level
    assert_response :success
  end

  test 'can show embed level when not signed in' do
    set_env :test

    level = create :artist
    sign_out @levelbuilder

    get :embed_level, level_id: level
    assert_response :success
  end

  test 'can show embed blocks when not signed in' do
    set_env :test

    level = create :artist
    sign_out @levelbuilder

    get :embed_blocks, level_id: level, block_type: :solution_blocks
    assert_response :success
  end
end
