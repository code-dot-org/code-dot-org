require 'test_helper'

class JavaBuilderSessionsControllerTest < ActionController::TestCase
  setup do
    @rsa_key_test = OpenSSL::PKey::RSA.new(2048)
    OpenSSL::PKey::RSA.stubs(:new).returns(@rsa_key_test)
  end

  test_user_gets_response_for :get_access_token, user: :student, response: :forbidden
  test_user_gets_response_for :get_access_token, user: :levelbuilder, response: :success

  test 'can decode jwt token' do
    levelbuilder = create :levelbuilder
    sign_in(levelbuilder)
    get :get_access_token

    response = JSON.parse(@response.body)
    token = response['token']
    decoded_token = JWT.decode(token, @rsa_key_test.public_key, true, {algorithm: 'RS256'})

    # token[0] is the JWT header
    assert_not_nil decoded_token[0]['iat']
    assert_not_nil decoded_token[0]['exp']
  end

  test 'csa pilot participant can get access token' do
    user = create :user
    create(:single_user_experiment, min_user_id: user.id, name: 'csa-pilot')
    sign_in(user)
    get :get_access_token
    assert_response :success
  end
end
