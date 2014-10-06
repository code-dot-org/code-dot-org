require 'test_helper'

class LevelsControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    @level = create(:level)
    @user = create(:admin)
    sign_in(@user)
    @program = '<hey/>'

    @not_admin = create(:user)
    Rails.env = 'levelbuilder'
    # Prevent custom levels from being written out to files when emulating 'levelbuilder' environment in this test class
    ENV['FORCE_CUSTOM_LEVELS'] = '1'
  end

  teardown do
    Rails.env = "test"
    ENV.delete 'FORCE_CUSTOM_LEVELS'
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
    assert_equal "Karel", css.first.attributes['value']
    assert_response :success
  end

  test "should alphanumeric order custom levels on new" do
    Level.where(user_id: @user.id).map(&:destroy)
    level_1 = create(:level, user: @user, name: "BBBB")
    level_2 = create(:level, user: @user, name: "AAAA")
    level_3 = create(:level, user: @user, name: "Z1")
    level_4 = create(:level, user: @user, name: "Z10")
    level_5 = create(:level, user: @user, name: "Z2")

    get :new, game_id: @level.game, type: "Maze"

    assert_equal [level_2, level_1, level_3, level_5, level_4], assigns(:levels)
  end

  test "should not get builder if not admin" do
    sign_in @not_admin
    get :new, game_id: @level.game
    assert_response :forbidden
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
    assert_equal @user, assigns(:level).user

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
    old_env = ENV.delete 'FORCE_CUSTOM_LEVELS'
    level_name = 'TestCustomLevel'
    begin
      post :create, :level => { :name => level_name, :type => 'Artist' }, :game_id => Game.find_by_name("Custom").id, :program => @program
      level = Level.find_by(name: level_name)
      file_path = Level.level_file_path(level.name)
      assert_equal true, file_path && File.exist?(file_path)
      delete :destroy, id: level
      assert_equal false, file_path && File.exist?(file_path)
    ensure
      ENV['FORCE_CUSTOM_LEVELS'] = old_env
      file_path = Level.level_file_path(level_name)
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

  test "should not update blocks if not admin" do
    sign_in @not_admin
    post :update_blocks, :level_id => @level.id, :game_id => @level.game.id, :type => 'toolbox_blocks', :program => @program
    assert_response :forbidden
  end

  test "should not edit level if not custom level" do
    level = Script.twenty_hour_script.levels.first
    can_edit =  Ability.new(@user).can? :edit, level
    assert_equal false, can_edit

    post :update_blocks, :level_id => level.id, :game_id => level.game.id, :type => 'toolbox_blocks', :program => @program
    assert_response :forbidden
  end

  test "should set coordinates and direction from query string" do
    get :new, :type => "Artist", :x => 5, :y => 10, :start_direction => 90
    level = assigns(:level)
    assert_equal 5, level.x
    assert_equal 10, level.y
    assert_equal 90, level.start_direction
  end

  test "should handle coordinates if non integer" do
    get :new, :type => "Artist", :x => "", :y => 5.5, :start_direction => "hi"
    level = assigns(:level)
    assert level
    assert_nil level.x
    assert_nil level.y
    assert_nil level.start_direction
  end

  test "should not create level if not admin" do
    sign_in @not_admin
    assert_no_difference('Level.count') do
      post :create, :name => "NewCustomLevel", :program => @program
    end

    assert_response :forbidden
  end

  # This should represent the behavior on production.
  test "should not modify level if on test env" do
    Rails.env = "test"
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
    assert_equal @program, assigns[:start_blocks]
  end

  test "should update level" do
    patch :update, id: @level, level: {  }
    # Level update now uses AJAX callback, returns a 200 JSON response instead of redirect
    assert_response :success
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
    css = css_select "form[action=#{level_path(level)}]"
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
    values = skin_select.map { |option| option.attributes["value"] }
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
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, '+5', 1, '-5', 0, 0],
      [0, 0, 0, '+5', 0, '-5', 0, 0],
      [0, 0, 0, '+5', 0, '-5', 0, 0],
      [0, 0, 2, 1, 0, '-5', 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]]
    post :create, :level => {:name => "NewCustomLevel", :instructions => "Some Instructions", :type => 'Karel'}, :game_id => game.id, :size => 8
    my_level = Level.find_by(name: 'NewCustomLevel')

    patch :update, :level => {:maze_data => maze_array.to_json}, id: my_level, game_id: game.id
    maze_json = JSON.parse(Level.find_by(name: 'NewCustomLevel').maze)
    maze_array[0][0] = '+2'
    maze_array[2][0] = 1

    patch :update, :level => {:maze_data => maze_array.to_json}, id: my_level, game_id: game.id
    new_maze = JSON.parse(Level.find_by(name: 'NewCustomLevel').maze)
    maze_json[0][0] = 1
    maze_json[2][0] = 1
    assert_equal maze_json, new_maze
  end

  test 'should show match level' do
    my_level = create :level, name: 'MatchLevel', type: 'Match'
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
    sign_out(@user)
    sign_in(teacher)
    get :show, id: level, game_id: level.game
    assert_select '.pdf-button'

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
    sign_out(@user)
    sign_in(teacher)
    get :show, id: level, game_id: level.game
    assert_select '.pdf-button'

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
      post :clone, level_id: old.id
    end

    new_level = assigns(:level)
    assert_equal new_level.game, old.game
    assert_equal new_level.name, "Fun Level (copy 1)"
    assert_redirected_to "/levels/#{new_level.id}/edit"
  end
end
