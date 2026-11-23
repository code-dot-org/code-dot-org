require 'test_helper'

class WardenUserCookiesTest < ActionDispatch::IntegrationTest
  setup do
    @roles = []
    Queries::User::EnabledExperiments.stubs(:call).with {@roles << ActiveRecord::Base.current_role}.returns([])
    sign_in create(:student)
  end

  test 'user cookies are read from the writer at sign-in and from the replica on later requests' do
    assert_equal :writing, role_for_next_get
    assert_equal :reading, role_for_next_get
  end

  test 'user cookies are read from the writer until the replica delay has passed since a write request' do
    post '/api/v1/users/me/mute_music', params: {mute_music: 'true'}
    assert_response :ok
    assert_equal :writing, role_for_next_get

    # travel drops sub-second precision, so a delay of exactly SEND_TO_REPLICA_DELAY could land short of it.
    travel Middleware::LastWriteStamp::Resolver::SEND_TO_REPLICA_DELAY + 1.second do
      assert_equal :reading, role_for_next_get
    end
  end

  private def role_for_next_get
    @roles.clear
    get '/get_token'
    assert_response :ok
    @roles.sole
  end
end
