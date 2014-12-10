require 'test_helper'

class CachingTest < ActionDispatch::IntegrationTest
  
  setup do
    Script.send(:clear_cache)
  end
  
  test "should get show of frozen level 1" do
    get '/s/frozen/stage/1/puzzle/1'
    assert_response :success

    Rails.logger.info '--------------'
    Rails.logger.info 'SECOND REQUEST'
    Rails.logger.info '--------------'
    
    ActiveRecord::Base.connection.disconnect!
    get '/s/frozen/stage/1/puzzle/1'
    assert_response :success
  end

  test "should get show of frozen level 10 twice" do
    get '/s/frozen/stage/1/puzzle/10'
    assert_response :success

    Rails.logger.info '--------------'
    Rails.logger.info 'SECOND REQUEST'
    Rails.logger.info '--------------'
    
    ActiveRecord::Base.connection.disconnect!
    get '/s/frozen/stage/1/puzzle/10'
    assert_response :success
  end

  test "should get show of frozen level 20 twice" do
    get '/s/frozen/stage/1/puzzle/20'
    assert_response :success

    Rails.logger.info '--------------'
    Rails.logger.info 'SECOND REQUEST'
    Rails.logger.info '--------------'
    
    ActiveRecord::Base.connection.disconnect!
    get '/s/frozen/stage/1/puzzle/20'
    assert_response :success
  end


  test "should get show of frozen level 1 and then level 10" do
    get '/s/frozen/stage/1/puzzle/1'
    assert_response :success

    Rails.logger.info '--------------'
    Rails.logger.info 'SECOND REQUEST'
    Rails.logger.info '--------------'
    
    ActiveRecord::Base.connection.disconnect!
    get '/s/frozen/stage/1/puzzle/10'
    assert_response :success
  end


  # course1 is not caching yet
  # test "should get show of course1 level 1 and then level 10" do
  #   get '/s/course1/stage/1/puzzle/1'
  #   assert_response :success

  #   Rails.logger.info '--------------'
  #   Rails.logger.info 'SECOND REQUEST'
  #   Rails.logger.info '--------------'
    
  #   ActiveRecord::Base.connection.disconnect!
  #   get '/s/course1/stage/1/puzzle/10'
  #   assert_response :success
  # end

end
