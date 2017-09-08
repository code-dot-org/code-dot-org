require 'test_helper'

class ExceptionsTest < ActionDispatch::IntegrationTest
  def setup
  end

  test "invalid format for template raises 406 not 500" do
    get '/courses', params: {}, headers: {'HTTP_ACCEPT' => 'image/jpeg'}

    assert_response 406
  end

  test  "invalid URL raises 404" do
    get '/courses/not-a-real-page'
    assert_response 404
  end

  test "internal server raises 500" do
    get '/courses', params: {}, headers: {'HTTP_ACCEPT' => 'image/jpeg'}
    assert_response 500
  end
end
