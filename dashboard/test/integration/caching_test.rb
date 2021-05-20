require 'test_helper'

class CachingTest < ActionDispatch::IntegrationTest
  def setup
    setup_script_cache
  end

  test "should get /hoc/1" do
    assert_cached_queries(0) do
      get '/hoc/1'
    end
    assert_response :success
  end

  test "should get /s/frozen" do
    assert_cached_queries(0) do
      get '/s/frozen'
    end
    assert_response :success
  end

  test "should get show of frozen level 1" do
    assert_cached_queries(0) do
      get '/s/frozen/lessons/1/levels/1'
    end
    assert_response :success
  end

  test "should get show of frozen level 10 twice" do
    assert_cached_queries(0) do
      get '/s/frozen/lessons/1/levels/10'
    end
    assert_response :success
  end

  test "should get show of frozen level 20 twice" do
    assert_cached_queries(0) do
      get '/s/frozen/lessons/1/levels/20'
    end
    assert_response :success
  end

  test "should get show of frozen level 1 and then level 10" do
    skip 'not working'
    get '/s/frozen/lessons/1/levels/1'
    assert_response :success

    assert_cached_queries(0) do
      get '/s/frozen/lessons/1/levels/10'
    end
    assert_response :success
  end

  test "post milestone to frozen passing" do
    sl = Script.find_by_name('frozen').script_levels[2]
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
  #   sl = Script.find_by_name('frozen').script_levels[2]
  #   params = {program: 'fake program', testResult: 5, result: 'false'}

  #   post "milestone/0/#{sl.id}", params
  #   assert_response 200

  #   no_database

  #   post "milestone/0/#{sl.id}", params
  #   assert_response 200
  # end

  test "should get show of course1 level 1 twice" do
    assert_cached_queries(0) do
      get '/s/course1/lessons/3/levels/1'
    end
    assert_response :success
  end

  test "should get show of course1 level 1 and then level 10" do
    skip 'not working'
    assert_cached_queries(0) do
      get '/s/course1/lessons/3/levels/10'
    end
    assert_response :success
  end

  test "post milestone to course1 passing" do
    sl = Script.find_by_name('course1').script_levels[2]
    params = {program: 'fake program', testResult: 100, result: 'true'}

    assert_cached_queries(0) do
      post "/milestone/0/#{sl.id}", params: params
    end
    assert_response :success
  end

  test 'should cache script after initialization' do
    Script.script_cache_to_cache
    assert_queries(0, ignore_filters: [], capture_filters: [/script\.rb.*get_from_cache/]) do
      get '/s/course1/lessons/3/levels/1'
    end
  end

  test 'redirects old stage url without hitting database' do
    assert_queries(0, ignore_filters: [], capture_filters: []) do
      get '/s/course1/stage/3/puzzle/1'
    end
    assert_response :redirect
    assert_redirected_to '/s/course1/lessons/3/levels/1'
  end
end
