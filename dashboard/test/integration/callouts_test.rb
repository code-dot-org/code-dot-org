require 'test_helper'

class CalloutsTest < ActionDispatch::IntegrationTest
  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    @maze_data = {game_id: 25, user_id: 1, name: '__bob4', level_num: 'custom', skin: 'birds', instructions: 'sdfdfs'}
    @level = Maze.create(@maze_data)
    @level.callout_json = '[{"localization_key": "run", "element_id": "#runButton"}]'
    @level.save!
    @script_level = create(:script_level, levels: [@level])
    @level_path = "/levels/#{@level.id}"
    @script_level_path = "/s/#{@script_level.script.name}/stage/1/puzzle/1"
    Script.script_cache.delete @script_level.script.name
    Script.script_cache.delete @script_level.script.id.to_s

    @expected_callouts = [{"id"=>nil, "element_id"=>"#runButton", "created_at"=>nil, "updated_at"=>nil, "script_level_id"=>nil, "qtip_config"=>"null", "on"=>nil, "callout_text"=>nil, "localized_text"=>"Hit \"Run\" to try your program"}]

    Script.clear_cache
  end

  def got_callouts(callouts)
    assert_equal (callouts ? @expected_callouts : []), assigns(:view_options).try(:[],:callouts)
  end

  test 'remember that we saw callouts in script_levels/show' do
    # first, yes callouts
    get @script_level_path
    got_callouts true

    # second, no callouts
    get @script_level_path
    got_callouts false

    # as level, no callouts
    get @level_path
    got_callouts false
  end

  test 'remember that we saw callouts in levels/show' do
    # first, yes callouts
    get @level_path
    got_callouts true

    # second, no callouts
    get @level_path
    got_callouts false

    # as script_level, no callouts
    get @script_level_path
    got_callouts false
  end

  test 'forget that we saw callouts if given the show_callouts param' do
    # first, yes callouts
    get @level_path
    got_callouts true

    # second, no callouts
    get @level_path
    got_callouts false

    # with param, yes callouts
    get @level_path + '?show_callouts=1'
    got_callouts true

    # as script_level with param, yes callouts
    get @script_level_path + '?show_callouts=1'
    got_callouts true
  end
end
