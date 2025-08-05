require 'test_helper'

class CachingTest < ActionDispatch::IntegrationTest
  def setup
    @multi_lesson_unit = create :unit, :with_levels, lessons_count: 3, levels_count: 10
    @multi_lesson_unit_group = create :single_unit_course, unit: @multi_lesson_unit

    @other_hoc_unit = create :unit, :with_levels, levels_count: 10
    @other_hoc_course = create :hoc_course, unit: @other_hoc_unit

    setup_script_cache
  end

  test "should get /hoc/1" do
    create_hourofcode_unit_and_levels
    setup_script_cache

    assert_cached_queries(1) do
      get '/hoc/1'
    end
    assert_response :success
  end

  test "should get other hoc course unit overview" do
    assert_cached_queries(0) do
      get "/courses/#{@other_hoc_course.name}/units/1"
    end
    assert_response :success
  end

  test "should get show of other hoc course level 1" do
    assert_cached_queries(0) do
      get "/courses/#{@other_hoc_course.name}/units/1/lessons/1/levels/1"
    end
    assert_response :success
  end

  test "should get show of other hoc course level 10 twice" do
    assert_cached_queries(0) do
      get "/courses/#{@other_hoc_course.name}/units/1/lessons/1/levels/10"
    end
    assert_response :success
  end

  test "should get show of other hoc course level 1 and then level 10" do
    get "/courses/#{@other_hoc_course.name}/units/1/lessons/1/levels/1"
    assert_response :success

    assert_cached_queries(0) do
      get "/courses/#{@other_hoc_course.name}/units/1/lessons/1/levels/10"
    end
    assert_response :success
  end

  test "post milestone to other hoc unit passing" do
    sl = Unit.find_by_name(@other_hoc_unit.name).script_levels[2]
    params = {program: 'fake program', testResult: 100, result: 'true'}

    assert_cached_queries(0) do
      post "/milestone/0/#{sl.id}", params: params
    end
    assert_response 200
  end

  #
  # We do not yet cache hints so turning hints back on makes this test fail.
  #
  # test "post milestone to frozen failing" do
  #   sl = Unit.find_by_name('frozen').script_levels[2]
  #   params = {program: 'fake program', testResult: 5, result: 'false'}

  #   post "milestone/0/#{sl.id}", params
  #   assert_response 200

  #   no_database

  #   post "milestone/0/#{sl.id}", params
  #   assert_response 200
  # end

  test "should get show of lesson 3 level 1 twice" do
    assert_cached_queries(0) do
      get "/courses/#{@multi_lesson_unit_group.name}/units/1/lessons/3/levels/1"
    end
    assert_response :success
  end

  test "should get show of lesson 3 level 1 and then level 10" do
    assert_cached_queries(0) do
      get "/courses/#{@multi_lesson_unit_group.name}/units/1/lessons/3/levels/10"
    end
    assert_response :success
  end

  test "post milestone to multi-lesson course passing" do
    unit = create :unit, :with_levels, lessons_count: 3, levels_count: 10
    sl = unit.script_levels[2]
    params = {program: 'fake program', testResult: 100, result: 'true'}

    assert_cached_queries(0) do
      post "/milestone/0/#{sl.id}", params: params
    end
    assert_response :success
  end

  test 'should cache script after initialization' do
    Unit.unit_cache_to_cache
    assert_queries(0, ignore_filters: [], capture_filters: [/script\.rb.*get_from_cache/]) do
      get '/courses/course1/units/1/lessons/3/levels/1'
    end
  end

  test 'redirects old stage url without hitting database' do
    assert_queries(0, ignore_filters: [], capture_filters: []) do
      get '/s/course1/stage/3/puzzle/1'
    end
    assert_response :redirect
    assert_redirected_to '/s/course1/lessons/3/levels/1'
    follow_redirect!
    assert_redirected_to '/courses/course1/units/1/lessons/3/levels/1'
  end
end
