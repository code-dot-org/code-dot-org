require 'test_helper'

class ExceptionsTest < ActionDispatch::IntegrationTest
  def setup
  end

  test "invalid format for template raises 406 not 500" do
    get '/', params: {}, headers: {'HTTP_ACCEPT' => 'image/jpeg'}

    assert_response 406
  end
end
