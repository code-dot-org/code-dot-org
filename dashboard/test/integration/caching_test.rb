require 'test_helper'

class CachingTest < ActionDispatch::IntegrationTest

  def setup
    Script.clear_cache
    # turn on the cache (off by default in test env so tests don't confuse each other)
    Dashboard::Application.config.action_controller.perform_caching = true
    Dashboard::Application.config.cache_store = :memory_store, { size: 64.megabytes }
    Rails.application.config.stubs(:levelbuilder_mode).returns false

    Rails.cache.clear
  end

  def no_database
    Rails.logger.info '--------------'
    Rails.logger.info 'DISCONNECTING DATABASE'
    Rails.logger.info '--------------'

    ActiveRecord::Base.connection.disconnect!
  end

  test "should get /hoc/1" do
    get '/hoc/1'
    assert_response :success

    no_database

    get '/hoc/1'
    assert_response :success
  end

  test "should get /s/frozen" do
    get '/s/frozen'
    assert_response :success

    no_database

    get '/s/frozen'
    assert_response :success
  end

  test "should get show of frozen level 1" do
    get '/s/frozen/stage/1/puzzle/1'
    assert_response :success

    no_database

    get '/s/frozen/stage/1/puzzle/1'
    assert_response :success
  end

  test "should get show of frozen level 10 twice" do
    get '/s/frozen/stage/1/puzzle/10'
    assert_response :success

    no_database

    get '/s/frozen/stage/1/puzzle/10'
    assert_response :success
  end

  test "should get show of frozen level 20 twice" do
    get '/s/frozen/stage/1/puzzle/20'
    assert_response :success

    no_database

    get '/s/frozen/stage/1/puzzle/20'
    assert_response :success
  end

  test "should get show of frozen level 1 and then level 10" do
    get '/s/frozen/stage/1/puzzle/1'
    assert_response :success

    no_database

    get '/s/frozen/stage/1/puzzle/10'
    assert_response :success
  end

  test "post milestone to frozen passing" do
    sl = Script.find_by_name('frozen').script_levels[2]
    params = {program: 'fake program', testResult: 100, result: 'true'}

    post "/milestone/0/#{sl.id}", params
    assert_response 200

    no_database

    post "/milestone/0/#{sl.id}", params
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

  # course1 is not caching yet
  test "should get show of course1 level 1 twice" do
    get '/s/course1/stage/3/puzzle/1'
    assert_response :success

    no_database

    get '/s/course1/stage/3/puzzle/1'
    assert_response :success
  end

  test "should get show of course1 level 1 and then level 10" do
    get '/s/course1/stage/3/puzzle/1'
    assert_response :success

    no_database

    get '/s/course1/stage/3/puzzle/10'
    assert_response :success
  end

  test "post milestone to course1 passing" do
    sl = Script.find_by_name('course1').script_levels[2]
    params = {program: 'fake program', testResult: 100, result: 'true'}

    post "/milestone/0/#{sl.id}", params
    assert_response 200

    no_database

    post "/milestone/0/#{sl.id}", params
    assert_response 200
  end

end
