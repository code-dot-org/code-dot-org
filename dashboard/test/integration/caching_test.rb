require 'test_helper'

class CachingTest < ActionDispatch::IntegrationTest

  def setup
    Script.clear_cache
    LevelSource.class_variable_set(:@@cache_enabled, true)
  end

  def no_database
    Rails.logger.info '--------------'
    Rails.logger.info 'DISCONNECTING DATABASE'
    Rails.logger.info '--------------'
    
    ActiveRecord::Base.connection.disconnect!
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

    post "milestone/0/#{sl.id}", params
    assert_response 200

    no_database

    post "milestone/0/#{sl.id}", params
    assert_response 200
  end

  test "post milestone to frozen failing" do
    sl = Script.find_by_name('frozen').script_levels[2]
    params = {program: 'fake program', testResult: 5, result: 'false'}

    post "milestone/0/#{sl.id}", params
    assert_response 200

    no_database

    post "milestone/0/#{sl.id}", params
    assert_response 200
  end


  # course1 is not caching yet
   test "should get show of course1 level 1 twice" do
     get '/s/course1/stage/3/puzzle/1'
     assert_response :success

     no_database

     get '/s/course1/stage/3/puzzle/1'
     assert_response :success
   end

  # course1 caching across levels is not working yet
   # test "should get show of course1 level 1 and then level 10" do
   #   get '/s/course1/stage/3/puzzle/1'
   #   assert_response :success

   #   no_database

   #   get '/s/course1/stage/3/puzzle/10'
   #   assert_response :success
   # end

   test "post milestone to course1 passing" do
     sl = Script.find_by_name('course1').script_levels[2]
     params = {program: 'fake program', testResult: 100, result: 'true'}

     post "milestone/0/#{sl.id}", params
     assert_response 200

     no_database

     post "milestone/0/#{sl.id}", params
     assert_response 200
   end

end
