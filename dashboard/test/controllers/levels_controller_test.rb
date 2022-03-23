require 'test_helper'
require 'webmock/minitest'

class LevelsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  STUB_ENCRYPTION_KEY = SecureRandom.base64(Encryption::KEY_LENGTH / 8)

  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    Level.any_instance.stubs(:write_to_file?).returns(false) # don't write to level files

    @level = create(:level)
    @partner_level = create :level, editor_experiment: 'platformization-partners'
    @admin = create(:admin)
    @not_admin = create(:user)
    @platformization_partner = create :platformization_partner
    @levelbuilder = create(:levelbuilder)
    sign_in(@levelbuilder)
    @program = '<hey/>'

    enable_level_source_image_s3_urls

    @default_update_blocks_params = {
      id: @level.id,
      game_id: @level.game.id,
      type: 'toolbox_blocks',
      program: @program,
    }
    stub_request(:get, /https:\/\/cdo-v3-shared.firebaseio.com/).
      to_return({"status" => 200, "body" => "{}", "headers" => {}})
  end

  test "should get rubric" do
    level = create_level_with_rubric
    get :get_rubric, params: {id: level.id}
    assert_equal JSON.parse(@response.body), {
      "keyConcept" => "This is the key concept",
      "performanceLevel1" => "This is great",
      "performanceLevel2" => "This is good",
      "performanceLevel3" => "This is okay",
      "performanceLevel4" => "This is bad"
    }
  end

  test "anonymous user can get_rubric" do
    sign_out @levelbuilder
    level = create_level_with_rubric
    get :get_rubric, params: {id: level.id}
    assert_equal JSON.parse(@response.body), {
      "keyConcept" => "This is the key concept",
      "performanceLevel1" => "This is great",
      "performanceLevel2" => "This is good",
      "performanceLevel3" => "This is okay",
      "performanceLevel4" => "This is bad"
    }
  end

  test "empty success response for get_rubric on rubricless level" do
    level = create :level
    get :get_rubric, params: {id: level.id}
    assert_response :no_content
    assert_equal '', @response.body
  end

  def create_level_with_rubric
    create(:level,
      mini_rubric: 'true',
      rubric_key_concept: 'This is the key concept',
      rubric_performance_level_1: 'This is great',
      rubric_performance_level_2: 'This is good',
      rubric_performance_level_3: 'This is okay',
      rubric_performance_level_4: 'This is bad'
    )
  end

  test "should get filtered levels with just page param" do
    get :get_filtered_levels, params: {page: 1}
    assert_equal 7, JSON.parse(@response.body)['levels'].length
    assert_equal 22, JSON.parse(@response.body)['numPages']
  end

  test "should get filtered levels with name matching level key for blockly levels" do
    game = Game.find_by_name("CustomMaze")
    create(:level, name: 'blockly', level_num: 'special_blockly_level', game_id: game.id, type: "Maze")

    get :get_filtered_levels, params: {name: 'blockly:CustomMaze:special_blockly_level'}
    assert_equal 'blockly:CustomMaze:special_blockly_level', JSON.parse(@response.body)['levels'][0]["name"]
  end

  test "should get filtered levels with level_type" do
    existing_levels_count = Odometer.all.count
    level = create(:odometer)
    get :get_filtered_levels, params: {page: 1, level_type: 'Odometer'}
    assert_equal existing_levels_count + 1, JSON.parse(@response.body)['levels'].length
    assert_equal level.name, JSON.parse(@response.body)['levels'][0]["name"]
    assert_equal 1, JSON.parse(@response.body)['numPages']
  end

  test "should get filtered levels with script_id" do
    script = create(:script, :with_levels, levels_count: 7)
    get :get_filtered_levels, params: {page: 1, script_id: script.id}
    assert_equal 7, JSON.parse(@response.body)['levels'].length
    assert_equal 1, JSON.parse(@response.body)['numPages']
  end

  test "should get filtered levels with owner_id" do
    Level.where(user_id: @levelbuilder.id).destroy_all
    level = create :applab, user: @levelbuilder
    get :get_filtered_levels, params: {page: 1, owner_id: @levelbuilder.id}
    assert_equal level.name, JSON.parse(@response.body)['levels'][0]["name"]
    assert_equal 1, JSON.parse(@response.body)['numPages']
  end

  test "get_filtered_levels gets no content if not levelbuilder" do
    sign_out @levelbuilder
    sign_in create(:teacher)
    get :get_filtered_levels, params: {page: 1}
    assert_response :forbidden
  end

  test "should get index" do
    get :index, params: {game_id: @level.game}
    assert_response :success
    assert_not_nil assigns(:levels)
  end

  test_user_gets_response_for(
    :index,
    response: :success,
    user: :platformization_partner
  )

  # non-levelbuilder can't index levels
  test_user_gets_response_for(
    :index,
    response: :forbidden,
    user: :teacher
  )

  test "levelbuilder can get exemplar to edit" do
    get :edit_exemplar,
      params: {id: @level.id}
    assert_response :success
  end

  test "teacher cannot get exemplar to edit" do
    teacher = create(:teacher)
    sign_out(@levelbuilder)
    sign_in(teacher)

    get :edit_exemplar,
      params: {id: @level.id}
    assert_response :forbidden
  end

  test "levelbuilder can update exemplar" do
    CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)
    exemplar_sources = {"File.java" => "System.out.println()"}
    javalab_level = create(:javalab)
    assert_nil javalab_level.exemplar_sources

    post :update_exemplar_code,
      params: {id: javalab_level.id},
      body: {exemplar_sources: {"File.java" => "System.out.println()"}}.to_json

    assert_response :success
    javalab_level.reload
    assert_equal exemplar_sources, javalab_level.exemplar_sources
  end

  test "teacher cannot update exemplar" do
    teacher = create(:teacher)
    sign_out(@levelbuilder)
    sign_in(teacher)

    javalab_level = create(:javalab)
    post :update_exemplar_code,
      params: {id: javalab_level.id}
    assert_response :forbidden
  end

  test "should get new" do
    get :new, params: {game_id: @level.game}
    assert_response :success
  end

  test "should get new maze" do
    get :new, params: {game_id: @level.game, type: "Maze"}
    assert_response :success
  end

  test "should get new karel" do
    get :new, params: {type: 'Karel'}

    css = css_select "#level_type"
    assert_equal "Karel", css.first.attributes['value'].to_s
    assert_response :success
  end

  test "should get new of all types" do
    LevelsController::LEVEL_CLASSES.each do |klass|
      get :new, params: {type: klass.name}

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

    get :new, params: {game_id: @level.game}

    assert_equal [level_2, level_1, level_3, level_5, level_4], assigns(:levels)
  end

  test "should not get builder if not levelbuilder" do
    [@not_admin, @admin].each do |user|
      sign_in user
      get :new, params: {game_id: @level.game}
      assert_response :forbidden
    end
  end

  test "should create maze level" do
    maze = fixture_file_upload("maze_level.csv", "r")
    game = Game.find_by_name("CustomMaze")

    assert_creates(Level) do
      post :create, params: {
        level: {
          name: "NewCustomLevel",
          short_instructions: "Some Instructions",
          type: 'Maze'
        },
        game_id: game.id,
        program: @program,
        maze_source: maze,
        size: 8
      }
    end

    assert assigns(:level)
    assert assigns(:level).game
    assert_equal edit_level_path(assigns(:level)), JSON.parse(@response.body)["redirect"]
  end

  test "should create maze levels with step mode" do
    maze = fixture_file_upload("maze_level.csv", "r")
    game = Game.find_by_name("CustomMaze")

    assert_creates(Level) do
      post :create, params: {
        level: {
          name: "NewCustomLevel",
          short_instructions: "Some Instructions",
          step_mode: 1,
          type: 'Maze'
        },
        game_id: game.id,
        program: @program,
        maze_source: maze,
        size: 8
      }
    end

    assert assigns(:level)
    assert assigns(:level).step_mode
  end

  test "should create maze levels with k1 on" do
    maze = fixture_file_upload("maze_level.csv", "r")
    game = Game.find_by_name("CustomMaze")

    assert_creates(Level) do
      post :create, params: {
        level: {
          name: "NewCustomLevel",
          short_instructions: "Some Instructions",
          type: 'Maze',
          is_k1: true
        },
        game_id: game.id,
        program: @program,
        maze_source: maze,
        size: 8
      }
    end

    assert assigns(:level)
    assert assigns(:level).is_k1
  end

  test "should create maze levels with k1 off" do
    maze = fixture_file_upload("maze_level.csv", "r")
    game = Game.find_by_name("CustomMaze")

    assert_creates(Level) do
      post :create, params: {
        level: {
          name: "NewCustomLevel",
          short_instructions: "Some Instructions",
          step_mode: 1,
          type: 'Maze',
          is_k1: false
        },
        game_id: game.id,
        program: @program,
        maze_source: maze,
        size: 8
      }, as: :json
    end

    assert assigns(:level)
    assert assigns(:level).is_k1 == 'false'
  end

  test "should not create invalid maze level" do
    maze = fixture_file_upload("maze_level_invalid.csv", "r")
    game = Game.find_by_name("CustomMaze")

    assert_does_not_create(Level) do
      post :create, params: {
        level: {
          name: "NewCustomLevel",
          short_instructions: "Some Instructions",
          type: 'Maze'
        },
        game_id: game.id,
        program: @program,
        maze_source: maze,
        size: 8
      }
    end

    assert_response :not_acceptable
  end

  test "should create karel level" do
    karel = fixture_file_upload("karel_level.csv", "r")
    game = Game.find_by_name("CustomMaze")

    assert_creates(Level) do
      post :create, params: {
        level: {
          name: "NewCustomLevel",
          short_instructions: "Some Instructions",
          type: 'Karel'
        },
        game_id: game.id,
        program: @program,
        maze_source: karel,
        size: 8
      }
    end

    assert assigns(:level)
    assert assigns(:level).game
    assert_equal @levelbuilder, assigns(:level).user

    assert_equal edit_level_path(assigns(:level)), JSON.parse(@response.body)["redirect"]
  end

  test "should not create invalid karel level" do
    karel = fixture_file_upload("karel_level_invalid.csv", "r")
    game = Game.find_by_name("CustomMaze")

    assert_does_not_create(Level) do
      post :create, params: {
        level: {
          name: "NewCustomLevel",
          short_instructions: "Some Instructions",
          type: 'Karel'
        },
        game_id: game.id,
        program: @program,
        maze_source: karel,
        size: 8
      }
    end

    assert_response :not_acceptable
  end

  test "should create artist level" do
    game = Game.find_by_name("Custom")
    assert_creates(Level) do
      post :create, params: {
        level: {name: "NewCustomLevel", type: 'Artist'},
        game_id: game.id,
        program: @program
      }
    end

    assert_equal edit_level_path(assigns(:level)), JSON.parse(@response.body)["redirect"]
  end

  test "should return newly created level when do_not_redirect" do
    game = Game.find_by_name("Custom")
    assert_creates(Level) do
      post :create, params: {
        level: {name: "NewCustomLevel", type: 'Artist'},
        game_id: game.id,
        program: @program,
        do_not_redirect: true
      }
    end

    assert_equal 'NewCustomLevel', JSON.parse(@response.body)['name']
    assert_equal 'Artist', JSON.parse(@response.body)['type']
  end

  test "should create studio level" do
    game = Game.find_by_name("CustomStudio")
    assert_creates(Level) do
      post :create, params: {
        level: {name: "NewCustomLevel", type: 'Studio'},
        game_id: game.id,
        program: @program
      }
    end

    assert_equal edit_level_path(assigns(:level)), JSON.parse(@response.body)["redirect"]
  end

  test "should create spritelab level" do
    game = Game.find_by_name("Spritelab")
    assert_creates(Level) do
      post :create, params: {
        level: {name: "NewCustomLevel", type: 'GamelabJr'},
        game_id: game.id,
        program: @program
      }
    end

    assert_equal edit_level_path(assigns(:level)), JSON.parse(@response.body)["redirect"]
  end

  test "should create applab level" do
    game = Game.find_by_name("Applab")
    assert_creates(Level) do
      post :create, params: {
        level: {name: "NewCustomLevel", type: 'Applab'},
        game_id: game.id,
        program: @program
      }
    end

    assert_equal edit_level_path(assigns(:level)), JSON.parse(@response.body)["redirect"]
  end

  test "should create gamelab level" do
    game = Game.find_by_name("Gamelab")
    assert_creates(Level) do
      post :create, params: {
        level: {name: "NewCustomLevel", type: 'Gamelab'},
        game_id: game.id,
        program: @program
      }
    end

    assert_equal edit_level_path(assigns(:level)), JSON.parse(@response.body)["redirect"]
  end

  test "should create dance level" do
    game = Game.find_by_name("Dance")
    assert_creates(Level) do
      post :create, params: {
        level: {name: "NewCustomLevel", type: 'Dancelab'},
        game_id: game.id,
        program: @program
      }
    end

    assert_equal edit_level_path(assigns(:level)), JSON.parse(@response.body)["redirect"]
  end

  test "should create and destroy custom level with level file" do
    # Enable writing custom level to file for this specific test only
    Level.any_instance.stubs(:write_to_file?).returns(true)

    level_name = 'TestCustomLevel'
    begin
      post :create, params: {
        level: {name: level_name, type: 'Artist', published: true},
        game_id: Game.find_by_name("Custom").id,
        program: @program
      }
      level = Level.find_by(name: level_name)
      file_path = Level.level_file_path(level.name)
      assert_equal true, file_path && File.exist?(file_path)
      delete :destroy, params: {id: level}
      assert_equal false, file_path && File.exist?(file_path)
    ensure
      file_path = Level.level_file_path(level_name)
      File.delete(file_path) if file_path && File.exist?(file_path)
    end
  end

  test "should not create invalid artist level" do
    game = Game.find_by_name("Custom")
    assert_does_not_create(Level) do
      post :create, params: {
        level: {name: '', type: 'Artist'},
        game_id: game.id,
        program: @program
      }
    end
    assert_response :not_acceptable
  end

  test "should update blocks" do
    post :update_blocks, params: @default_update_blocks_params
    assert_response :success
    level = assigns(:level)
    assert_equal @program, level.properties['toolbox_blocks']
    assert_nil level.properties['solution_image_url']
  end

  test "should update App Lab starter code and starter HTML" do
    post :update_properties, params: {
      id: create(:applab).id,
    }, body:
      {
        start_html: '<h1>foo</h1>',
        start_blocks: 'console.log("hello world");',
      }.to_json

    assert_response :success
    level = assigns(:level)
    assert_equal '<h1>foo</h1>', level.properties['start_html']
    assert_equal 'console.log("hello world");', level.properties['start_blocks']
  end

  test "should update App Lab starter code and starter HTML with special characters" do
    post :update_properties, params: {
      id: create(:applab).id,
    }, body:
      {
        start_html: '<h1>Final Grade: 90%</h1><h2>student@code.org</h2>',
        start_blocks: 'console.log(4 % 2 == 0);',
      }.to_json

    assert_response :success
    level = assigns(:level)
    assert_equal '<h1>Final Grade: 90%</h1><h2>student@code.org</h2>', level.properties['start_html']
    assert_equal 'console.log(4 % 2 == 0);', level.properties['start_blocks']
  end

  test "non-levelbuilder cannot update_properties" do
    sign_out @levelbuilder
    sign_in create(:teacher)
    post :update_properties, params: {
      id: create(:applab).id,
    }, body: {
      start_html: '<h1>foo</h1>'
    }.to_json

    assert_response :forbidden
  end

  test "should update solution image when updating solution blocks" do
    LevelSourceImage.stubs(:find_by).returns(nil)
    LevelSourceImage.any_instance.expects(:save_to_s3).returns(true)
    post :update_blocks, params: @default_update_blocks_params.merge(
      type: 'solution_blocks',
      image: 'stub-image-data',
    )
    assert_response :success
    level = assigns(:level)
    assert_equal @program, level.properties['solution_blocks']
    assert_s3_image_url level.properties['solution_image_url']
  end

  test "should not update solution image when updating toolbox blocks" do
    post :update_blocks, params: @default_update_blocks_params.merge(
      image: 'stub-image-data',
    )
    assert_response :success
    level = assigns(:level)
    assert_equal @program, level.properties['toolbox_blocks']
    assert_nil level.properties['solution_image_url']
  end

  test "should update solution image if existing one is lower resolution" do
    small_size = mock('image_size')
    small_size.stubs(:width).returns(154)
    small_size.stubs(:height).returns(154)
    large_size = mock('image_size')
    large_size.stubs(:width).returns(400)
    large_size.stubs(:height).returns(400)
    ImageSize.stubs(:path).returns(small_size)
    ImageSize.stubs(:new).returns(large_size)
    LevelSourceImage.any_instance.stubs(:s3_url).returns('fake url')

    LevelSourceImage.any_instance.expects(:save_to_s3).returns(true)

    post :update_blocks, params: @default_update_blocks_params.merge(
      type: 'solution_blocks',
      image: 'stub-image-data',
    )
    assert_response :success
  end

  test "should not update blocks if not levelbuilder" do
    [@not_admin, @admin].each do |user|
      sign_in user
      post :update_blocks, params: @default_update_blocks_params
      assert_response :forbidden
    end
  end

  test "should not edit level if not custom level" do
    level = create(:deprecated_blockly_level, user_id: nil)
    refute Ability.new(@levelbuilder).can? :edit, level

    post :update_blocks, params: @default_update_blocks_params.merge(
      id: level.id,
      game_id: level.game.id,
    )
    assert_response :forbidden
  end

  test "should not be able to edit on levelbuilder in locale besides en-US" do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in @levelbuilder
    with_default_locale(:de) do
      get :edit, params: {id: @level}
    end
    assert_redirected_to "/"
  end

  test "should not create level if not levelbuilder" do
    [@not_admin, @admin].each do |user|
      sign_in user
      assert_does_not_create(Level) do
        post :create, params: {name: "NewCustomLevel", program: @program}
      end

      assert_response :forbidden
    end
  end

  # This should represent the behavior on production.
  test "should not modify level in production" do
    CDO.stubs(:rack_env).returns(:production)
    Rails.application.config.stubs(:levelbuilder_mode).returns false

    post :create, params: {name: "NewCustomLevel", program: @program}
    assert_response :forbidden
  end

  test "should show level" do
    get :show, params: {id: @level}
    assert_response :success
  end

  test "should show level group" do
    level_group = create :level_group, :with_sublevels, name: 'lg'
    level_group.save!
    get :show, params: {id: level_group.id}
    assert_response :success
  end

  test "should show level on test env" do
    Rails.env = "test"
    get :show, params: {id: @level}
    assert_response :success
  end

  test "should get edit" do
    get :edit, params: {id: @level}
    assert_response :success
  end

  test "should get edit blocks" do
    @level.update(toolbox_blocks: @program)
    get :edit_blocks, params: {id: @level.id, type: 'toolbox_blocks'}
    assert_equal @program, assigns[:level_view_options_map][@level.id][:start_blocks]
  end

  test "should load file contents when editing a dsl defined level" do
    level_path = 'config/scripts/test_demo_level.external'
    data, _ = External.parse_file level_path
    External.setup data

    level = Level.find_by_name 'Test Demo Level'
    get :edit, params: {id: level.id}

    assert_equal level_path, assigns(:level).filename
    assert_equal "name 'test demo level'", assigns(:level).dsl_text.split("\n").first
  end

  test "should load encrypted file contents when editing a dsl defined level with the wrong encryption key" do
    level_path = 'config/scripts/test_external_markdown.external'
    data, _ = External.parse_file level_path
    External.setup data
    CDO.stubs(:properties_encryption_key).returns("thisisafakekeyyyyyyyyyyyyyyyyyyyyy")
    level = Level.find_by_name 'Test External Markdown'
    get :edit, params: {id: level.id}

    assert_equal level_path, assigns(:level).filename
    assert_equal "name", assigns(:level).dsl_text.split("\n").first.split(" ").first
    assert_equal "encrypted", assigns(:level).dsl_text.split("\n")[1].split(" ").first
  end

  test "should allow rename of new level" do
    get :edit, params: {id: @level.id}
    assert_response :success
    assert_includes @response.body, @level.name
    assert_not_includes @response.body, 'level cannot be renamed'
  end

  test "should prevent rename of level in launched or pilot script" do
    script_level = create :script_level
    script = script_level.script
    script.published_state = 'stable'
    script.save!
    level = script_level.level

    get :edit, params: {id: level.id}
    assert_response :success
    assert_includes @response.body, level.name
    assert_includes @response.body, 'level cannot be renamed'

    script.published_state = 'beta'
    script.save!
    get :edit, params: {id: level.id}
    assert_response :success
    assert_includes @response.body, level.name
    assert_includes @response.body, 'level cannot be renamed'

    script.pilot_experiment = 'platformization-partners'
    script.published_state = 'pilot'
    script.save!
    get :edit, params: {id: level.id}
    assert_response :success
    assert_includes @response.body, level.name
    assert_includes @response.body, 'level cannot be renamed'

    script_level.destroy!
    get :edit, params: {id: level.id}
    assert_response :success
    assert_includes @response.body, level.name
    assert_not_includes @response.body, 'level cannot be renamed'
  end

  test "should prevent rename of stanadalone project level" do
    level_name = ProjectsController::STANDALONE_PROJECTS.values.first[:name]
    create(:level, name: level_name) unless Level.where(name: level_name).exists?
    level = Level.find_by(name: level_name)

    get :edit, params: {id: level.id}
    assert_response :success
    assert_includes @response.body, level.name
    assert_includes @response.body, 'level cannot be renamed'
  end

  test "should update level" do
    patch :update, params: {id: @level, level: {stub: nil}}
    # Level update now uses AJAX callback, returns a 200 JSON response instead of redirect
    assert_response :success
  end

  test "update sends JSON::ParserError to user" do
    level = create(:applab)
    invalid_json = "{,}"
    patch :update, params: {
      id: level,
      level: {'code_functions' => invalid_json}
    }
    # Level update now uses AJAX callback, returns a 200 JSON response instead of redirect
    assert_response :unprocessable_entity

    assert_match /JSON::ParserError/, JSON.parse(@response.body)['code_functions'].first
  end

  test "update_start_code encrypts validation" do
    CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)
    level = create(:javalab)
    post :update_start_code, params: {
      id: level.id
    }, body:
        {
          validation: {"Validation.java" => "{}"},
          start_sources: {"MyClass.java" => "{}"}
        }.to_json

    assert_response :success
    level = assigns(:level)

    # this property is encrypted, not plaintext
    assert_nil level.properties['validation']
    assert level.validation
    assert level.properties['encrypted_validation']

    # this property is plaintext
    assert level.properties['start_sources']
  end

  test "update_start_code works if level does not support validation" do
    post :update_start_code, params: {
      id: create(:applab).id,
    }, body:
           {
             start_html: '<h1>foo</h1>',
             start_blocks: 'console.log("hello world");',
           }.to_json

    assert_response :success
    level = assigns(:level)
    assert_equal '<h1>foo</h1>', level.properties['start_html']
    assert_equal 'console.log("hello world");', level.properties['start_blocks']
  end

  test "should destroy level" do
    assert_destroys(Level) do
      delete :destroy, params: {id: @level}
    end

    assert_redirected_to levels_path
  end

  test "should route new to levels" do
    assert_routing({method: "post", path: "/levels"}, {controller: "levels", action: "create"})
  end

  test "should use level for route helper" do
    level = create(:artist)
    get :edit, params: {id: level}
    css = css_select "form[action=\"#{level_path(level)}\"]"
    assert_not css.empty?
  end

  test "should use first skin as default" do
    maze = fixture_file_upload("maze_level.csv", "r")
    game = Game.find_by_name("CustomMaze")

    post :create, params: {
      level: {
        name: "NewCustomLevel",
        short_instructions: "Some Instructions",
        type: 'Maze'
      },
      game_id: game.id,
      program: @program,
      maze_source: maze,
      size: 8
    }
    assert_equal Maze.skins.first, assigns(:level).skin
  end

  test "should use skin from params on create" do
    maze = fixture_file_upload("maze_level.csv", "r")
    game = Game.find_by_name("CustomMaze")

    post :create, params: {
      level: {
        skin: Maze.skins.last,
        name: "NewCustomLevel",
        short_instructions: "Some Instructions",
        type: 'Maze'
      },
      game_id: game.id,
      program: @program,
      maze_source: maze,
      size: 8
    }
    assert_equal Maze.skins.last, assigns(:level).skin
  end

  test "edit form should include skins" do
    level = create(:artist)
    skins = level.class.skins
    get :edit, params: {id: level, game_id: level.game}
    skin_select = css_select "#level_skin option"
    values = skin_select.map {|option| option.attributes["value"].to_s}
    assert_equal skins, values
  end

  test "should populate artist start direction with current value" do
    level = create(:artist, start_direction: 180)
    get :edit, params: {id: level, game_id: level.game}
    assert_select "#level_start_direction[value='180']"
  end

  test "should populate maze start direction with current value" do
    level = create(:maze, start_direction: 2)
    get :edit, params: {id: level, game_id: level.game}
    assert_select "#level_start_direction option[value='2'][selected='selected']"
  end

  test "should populate level skin with current value" do
    level = create(:maze, skin: 'pvz')
    get :edit, params: {id: level, game_id: level.game}
    assert_select "#level_skin option[value='pvz'][selected='selected']"
  end

  test 'should render level name in title' do
    get :show, params: {id: @level, game_id: @level.game}
    assert_match /#{Regexp.quote(@level.name)}/, Nokogiri::HTML(@response.body).css('title').text.strip
  end

  test "should update maze data properly" do
    game = Game.find_by_name("CustomMaze")
    post :create, params: {
      level: {
        name: "NewCustomLevel",
        short_instructions: "Some Instructions",
        type: 'Maze'
      },
      game_id: game.id,
      maze_source: fixture_file_upload("maze_level.csv", "r"),
      size: 8
    }

    my_level = Level.where(name: 'NewCustomLevel').first
    maze_json = JSON.parse(my_level.maze)
    maze_json[0][0] = '2'
    maze_json[2][0] = 3

    patch :update, params: {
      level: {maze_data: maze_json.to_json},
      id: my_level,
      game_id: game.id
    }

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
    post :create, params: {
      level: {
        name: "NewCustomLevel",
        short_instructions: "Some Instructions",
        type: 'Karel'
      },
      game_id: game.id,
      size: 8
    }
    my_level = Level.find_by(name: 'NewCustomLevel')

    patch :update, params: {
      level: {maze_data: maze_array.to_json},
      id: my_level,
      game_id: game.id
    }
    new_maze = Level.find_by(name: 'NewCustomLevel').serialized_maze
    assert_equal maze_array.to_json, new_maze
  end

  test 'should show match level' do
    my_level = create :match, name: 'MatchLevel', type: 'Match'
    get :show, params: {id: my_level, game_id: my_level.game}
  end

  test 'should show applab level' do
    my_level = create :applab, type: 'Applab'
    get :show, params: {id: my_level, game_id: my_level.game}
  end

  test 'should show legacy unplugged level' do
    level = create :unplugged, name: 'OldUnplugged', type: 'Unplugged'
    get :show, params: {id: level, game_id: level.game}
    assert_select 'div.unplugged > h1', 'Test title'
    assert_select 'div.unplugged > p', 'Test description'
  end

  test 'should hide legacy unplugged pdf download button for students' do
    level = create :unplugged, name: 'OldUnplugged', type: 'Unplugged'
    teacher = create(:teacher)
    sign_out(@levelbuilder)
    sign_in(teacher)
    get :show, params: {id: level, game_id: level.game}
    assert_select '.pdf-button'

    @controller = LevelsController.new
    student = create(:student)
    sign_out(teacher)
    sign_in(student)
    get :show, params: {id: level, game_id: level.game}
    assert_select '.pdf-button', false, "Students shouldn't see PDF download button"
  end

  test 'should show new style unplugged level' do
    level = create :unplugged, name: 'NewUnplugged', type: 'Unplugged'
    get :show, params: {id: level, game_id: level.game}

    assert_select 'div.unplugged > h1', 'Test title'
    assert_select 'div.unplugged > p', 'Test description'
  end

  test 'should hide unplugged pdf download section for students' do
    level = create :unplugged, name: 'NewUnplugged', type: 'Unplugged'
    teacher = create(:teacher)
    sign_out(@levelbuilder)
    sign_in(teacher)
    get :show, params: {id: level, game_id: level.game}
    assert_select '.pdf-button'

    @controller = LevelsController.new
    student = create(:student)
    sign_out(teacher)
    sign_in(student)
    get :show, params: {id: level, game_id: level.game}
    assert_select '.lesson-plan', false, "Students shouldn't see lesson plan"
  end

  test "should clone" do
    game = Game.find_by_name("Custom")
    old = create(:level, game_id: game.id, name: "Fun Level")
    assert_creates(Level) do
      post :clone, params: {id: old.id, name: "Fun Level (copy 1)"}
    end

    new_level = assigns(:new_level)
    assert_equal old.game, new_level.game
    assert_equal "Fun Level (copy 1)", new_level.name
    assert_equal "/levels/#{new_level.id}/edit", URI(JSON.parse(@response.body)['redirect']).path
  end

  test "should clone without redirect" do
    game = Game.find_by_name("Custom")
    old = create(:level, game_id: game.id, name: "Fun Level")
    assert_creates(Level) do
      post :clone, params: {id: old.id, name: "Fun Level (copy 1)", do_not_redirect: true}
    end

    new_level = assigns(:new_level)
    assert_equal old.game, new_level.game
    assert_equal "Fun Level (copy 1)", new_level.name
    assert_equal "Fun Level (copy 1)", JSON.parse(@response.body)['name']
  end

  test "cannot clone hard-coded levels" do
    old = create(:deprecated_blockly_level, game_id: Game.first.id, name: "Fun Level", user_id: nil)
    refute old.custom?
    refute_creates(Level) do
      post :clone, params: {id: old.id, name: "Fun Level (copy 1)"}
      assert_response :forbidden
    end
  end

  test "cloning a level requires a name parameter" do
    old = create(:level, game_id: Game.first.id, name: "Fun Level")
    assert_raise ActionController::ParameterMissing do
      post :clone, params: {id: old.id, name: ''}
    end
  end

  test "platformization partner should own cloned level" do
    sign_out @levelbuilder
    sign_in @platformization_partner

    game = Game.find_by_name("Custom")
    old = create(:level, game_id: game.id, name: "Fun Level")
    assert_creates(Level) do
      post :clone, params: {id: old.id, name: "Fun Level (copy 1)"}
    end

    new_level = assigns(:new_level)
    assert_equal new_level.game, old.game
    assert_equal new_level.name, "Fun Level (copy 1)"
    assert_equal "/levels/#{new_level.id}/edit", URI(JSON.parse(@response.body)['redirect']).path
    assert_equal 'platformization-partners', new_level.editor_experiment
  end

  test "platformization partner cannot clone hard-coded levels" do
    sign_out @levelbuilder
    sign_in @platformization_partner

    old = create(:deprecated_blockly_level, game_id: Game.first.id, name: "Fun Level", user_id: nil)
    refute old.custom?
    refute_creates(Level) do
      post :clone, params: {id: old.id, name: "Fun Level (copy 1)"}
      assert_response :forbidden
    end
  end

  test 'cannot update level name with just a case change' do
    level = create :level, name: 'original name'

    post :update, params: {id: level.id, level: {name: 'ORIGINAL NAME'}}

    assert_response 422

    # error message
    assert assigns(:level).errors[:name]

    level = level.reload
    # same name
    assert_equal 'original name', level.name
  end

  test 'no error message when not actually changing level name' do
    level = create :level, name: 'original name'

    post :update, params: {id: level.id, level: {name: 'original name'}}

    assert_response 200

    # no error message
    assert assigns(:level).errors[:name].blank?

    level = level.reload
    # same name
    assert_equal 'original name', level.name
  end

  test 'can update level name' do
    level = create :level, name: 'original name'

    post :update, params: {id: level.id, level: {name: 'different name'}}

    level = level.reload
    # same name
    assert_equal 'different name', level.name
  end

  test 'trailing spaces in level name get stripped' do
    level = create :level, name: 'original name '
    assert_equal 'original name', level.name

    post :update, params: {id: level.id, level: {name: 'different name  '}}

    level = level.reload
    # same name
    assert_equal 'different name', level.name
  end

  test 'can show level when not signed in' do
    set_env :test

    level = create :artist
    sign_out @levelbuilder

    get :edit, params: {id: level}
    assert_response :redirect

    get :show, params: {id: level}
    assert_response :success
  end

  test 'can show embed level when not signed in' do
    set_env :test

    level = create :artist
    sign_out @levelbuilder

    get :embed_level, params: {id: level}
    assert_response :success
  end

  test 'external markdown levels will render <user_id/> as the actual user id' do
    File.stubs(:write)
    dsl_text = <<DSL
name 'user_id_replace'
title 'title for user_id_replace'
markdown 'this is the markdown for <user_id/>'
DSL
    level = External.create_from_level_builder({}, {name: 'my_user_id_replace', dsl_text: dsl_text})
    sign_in @not_admin
    get :show, params: {id: level}
    assert_response :success
    assert_select '.markdown-container[data-markdown=?]', "this is the markdown for #{@not_admin.id}"
  end

  # test_platformization_partner_calling_get_new_should_receive_success
  test_user_gets_response_for(
    :new,
    response: :success,
    user: :platformization_partner
  )

  test 'platformization partner creates and owns new artist level' do
    sign_out @levelbuilder
    sign_in @platformization_partner

    game = Game.find_by_name('Custom')
    assert_creates(Level) do
      post :create, params: {
        level: {name: 'partner artist level', type: 'Artist'},
        game_id: game.id,
        program: @program
      }
    end

    level = Level.last
    assert_equal 'partner artist level', level.name
    assert_equal 'platformization-partners', level.editor_experiment
  end

  test "should get serialized_maze" do
    level = create_level_with_serialized_maze
    get :get_serialized_maze, params: {id: level.id}
    expected_maze = [[{"tileType" => 1, "value" => 0}], [{"tileType" => 0, "assetId" => 5, "value" => 0}]]
    assert_equal expected_maze, JSON.parse(@response.body)
  end

  test "anonymous user can get_serialized_maze" do
    sign_out @levelbuilder
    level = create_level_with_serialized_maze
    get :get_serialized_maze, params: {id: level.id}
    expected_maze = [[{"tileType" => 1, "value" => 0}], [{"tileType" => 0, "assetId" => 5, "value" => 0}]]
    assert_equal expected_maze, JSON.parse(@response.body)
  end

  test "empty success response for get_serialized_maze on level without maze" do
    level = create :level
    get :get_serialized_maze, params: {id: level.id}
    assert_response :no_content
    assert_equal '', @response.body
  end

  def create_level_with_serialized_maze
    create(:javalab,
      serialized_maze: [[{tileType: 1, value: 0}], [{tileType: 0, assetId: 5, value: 0}]]
    )
  end

  test_user_gets_response_for(
    :edit,
    response: :forbidden,
    user: :platformization_partner,
    params: -> {{id: @level.id}}
  )

  test_user_gets_response_for(
    :edit,
    response: :success,
    user: :platformization_partner,
    params: -> {{id: @partner_level.id}}
  )

  test_user_gets_response_for(
    :update,
    method: :patch,
    response: :forbidden,
    user: :platformization_partner,
    params: -> {{id: @level.id, level: {name: 'new partner name'}}}
  )

  test_user_gets_response_for(
    :update,
    method: :patch,
    response: :success,
    user: :platformization_partner,
    params: -> {{id: @partner_level.id, level: {name: 'new partner name'}}}
  )

  private

  # Assert that the url is a real S3 url, and not a placeholder.
  def assert_s3_image_url(url)
    assert(
      %r{#{LevelSourceImage::S3_URL}.*\.png}.match(url),
      "expected #{url.inspect} to be an S3 URL"
    )
  end

  # Allow our update_blocks tests to verify that real S3 urls are being
  # generated when solution images are uploaded. We don't want to actually
  # upload any S3 images in our tests, so just enable the codepath where an
  # existing LevelSourceImage is found based on the program contents.
  def enable_level_source_image_s3_urls
    # Allow LevelSourceImage to return real S3 urls.
    CDO.stubs(:disable_s3_image_uploads).returns(false)

    # Make sure there is a LevelSourceImage associated with the program.
    create(:level_source, :with_image, level: @level, data: @program)

    # Because we cleared disable_s3_image_uploads, there's a chance we'll
    # accidentally try to upload an image to S3. Make sure this never happens.
    LevelSourceImage.any_instance.expects(:save_to_s3).never
  end
end
