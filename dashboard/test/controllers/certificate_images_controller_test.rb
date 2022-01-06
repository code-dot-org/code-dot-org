require 'test_helper'
require 'base64'

class CertificateImagesControllerTest < ActionController::TestCase
  test 'can show certificate image' do
    data = {name: 'student', course: 'hourofcode'}
    filename = Base64.urlsafe_encode64(data.to_json)
    get :show, format: 'jpg', params: {filename: filename}
    assert_response :success
  end
end
