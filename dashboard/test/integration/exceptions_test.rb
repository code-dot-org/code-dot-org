require 'test_helper'

class ExceptionsTest < ActionDispatch::IntegrationTest

  def setup
  end

  test "invalid format for template raises 404 not 500" do
    get '/', {}, {'HTTP_ACCEPT' => 'image/jpeg'}

    assert_response 404
  end
end
