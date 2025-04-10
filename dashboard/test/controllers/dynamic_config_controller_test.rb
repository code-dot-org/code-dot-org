require 'test_helper'

class DynamicConfigControllerTest < ActionController::TestCase
  test 'inaccessible by non-admins' do
    # Including both anonymous users
    get :show
    assert_response :redirect
    assert_redirected_to :new_user_session

    # And signed-in users without elevated permissions
    sign_in(create(:user))
    get :show
    assert_response :forbidden
  end

  test 'accessible by admins' do
    sign_in(create(:admin))

    get :show
    assert_response :success
  end

  test 'can render dynamic config values' do
    sign_in(create(:admin))
    get :show
    assert_response :success
    assert_includes @response.body, "# Gatekeeper Config\n --- {}"
    assert_includes @response.body, "# DCDO Config\n--- {}"

    Gatekeeper.set('test gatekeeper', where: {foo: 'bar'}, value: true)
    DCDO.set('test dcdo', 'baz')
    get :show
    assert_response :success
    assert_includes @response.body, "# Gatekeeper Config\n ---\ntest gatekeeper:"
    assert_includes @response.body, "# DCDO Config\n---\ntest dcdo: baz"
  end
end
