require 'test_helper'
require 'timecop'

class SessionsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @request.env["devise.mapping"] = Devise.mappings[:user]
  end

  test 'login error derives locale from cdo.locale' do
    locale = 'es-ES'
    @request.env['cdo.locale'] = locale
    post :create
    assert_select '.alert', I18n.t('devise.failure.not_found_in_database', locale: locale)
  end

  test "teachers go to homepage after signing in" do
    teacher = create(:teacher)

    post :create, params: {
      user: {
        login: '',
        hashed_email: teacher.hashed_email,
        password: teacher.password
      }
    }

    assert_signed_in_as teacher
    assert_redirected_to '/home'
  end

  test "students go to learn homepage after signing in" do
    student = create(:student)

    post :create, params: {
      user: {
        login: '',
        hashed_email: student.hashed_email,
        password: student.password
      }
    }

    assert_signed_in_as student
    assert_redirected_to '/'
  end

  test "sign in page saves return to url in session" do
    # Note that we currently have no restrictions on what the domain of the
    # redirect url can be; we may at some point want to add domain
    # restrictions, but if we do so we want to make sure that both
    # studio.code.org and code.org are supported.
    #
    # See also the "sign up page saves return to url in session" test in
    # registrations_controller_test
    urls = [
      "/foo",
      "//studio.code.org/foo",
      "//code.org/foo",
      "//some_other_domain.com/foo"
    ]

    urls.each do |url|
      session.delete(:user_return_to)
      get :new, params: {user_return_to: url}
      assert_equal url, session[:user_return_to]
    end
  end

  test "teachers go to specified return to url after signing in" do
    teacher = create(:teacher)

    session[:user_return_to] = user_return_to = '//test.code.org/the-return-to-url'

    post :create, params: {
      user: {
        login: '',
        hashed_email: teacher.hashed_email,
        password: teacher.password
      }
    }

    assert_signed_in_as teacher
    assert_redirected_to user_return_to
  end

  test 'signing in as user via username' do
    user = create(:user, birthday: Date.new(2010, 1, 3), email: 'my@email.xx')

    post :create, params: {
      user: {login: user.username, hashed_email: '', password: user.password}
    }

    assert_signed_in_as user
    assert_redirected_to '/'
  end

  test 'signing in as student via hashed_email' do
    student = create(:student, birthday: Date.new(2010, 1, 3), email: 'my@email.xx')

    post :create, params: {
      user: {
        login: '',
        hashed_email: student.hashed_email,
        password: student.password
      }
    }

    assert_signed_in_as student
    assert_redirected_to '/'
  end

  test 'signing in new user creates blank UserGeo' do
    user = create(:user)

    assert UserGeo.find_by_user_id(user.id).nil?

    post :create, params: {
      user: {
        login: '',
        hashed_email: user.hashed_email,
        password: user.password
      }
    }

    assert UserGeo.find_by_user_id(user.id)
  end

  test 'signing in user with existing UserGeo does not change UserGeo' do
    user = create(:user, current_sign_in_ip: '1.2.3.4')
    UserGeo.create(user_id: user.id, ip_address: '127.0.0.1')

    assert_no_change('UserGeo.find_by_user_id(user.id)') do
      post :create, params: {
        user: {
          login: '',
          hashed_email: user.hashed_email,
          password: user.password
        }
      }
    end

    assert_equal 1, UserGeo.count
  end

  test 'failed signin does not create UserGeo' do
    user = create(:user)

    assert_no_change('UserGeo.count') do
      post :create, params: {
        user: {
          login: '',
          hashed_email: user.hashed_email,
          password: 'wrong password'
        }
      }
    end
  end

  test 'signing in user creates SignIn' do
    frozen_time = Date.parse('1985-10-26 01:20:00')
    DateTime.stubs(:now).returns(frozen_time)
    user = create :user, sign_in_count: 2
    assert_creates(SignIn) do
      post :create, params: {
        user: {
          login: '',
          hashed_email: user.hashed_email,
          password: user.password
        }
      }
    end
    sign_in = SignIn.find_by_user_id(user.id)
    assert sign_in
    assert_equal 2 + 1, sign_in.sign_in_count
    assert_equal frozen_time, sign_in.sign_in_at
  end

  test 'failed signin does not create SignIn' do
    user = create :user
    assert_does_not_create(SignIn) do
      post :create, params: {
        user: {
          login: '',
          hashed_email: user.hashed_email,
          password: 'wrongpassword'
        }
      }
    end
  end

  test "users go to code.org after logging out" do
    student = create(:student)
    sign_in student

    delete :destroy

    assert_redirected_to '//test.code.org'
  end

  test "if you're not signed in you can still sign out" do
    delete :destroy

    assert_redirected_to '//test.code.org'
  end

  test "facebook users go to generic oauth sign out page after logging out" do
    student = create(:student, provider: :facebook)
    sign_in student

    delete :destroy

    assert_redirected_to '/oauth_sign_out/migrated'
  end

  test "google account users go to generic oauth sign out page after logging out" do
    student = create(:student, provider: :google_oauth2)
    sign_in student

    delete :destroy

    assert_redirected_to '/oauth_sign_out/migrated'
  end

  test "microsoft account users go to generic oauth sign out page after logging out" do
    student = create(:student, provider: :windowslive)
    sign_in student

    delete :destroy

    assert_redirected_to '/oauth_sign_out/migrated'
  end

  test "oauth sign out page for facebook" do
    get :oauth_sign_out, params: {provider: 'facebook'}
    assert_select 'a[href="https://www.facebook.com/logout.php"]'
    assert_select 'h4', 'You used Facebook to sign in. Click here to sign out of Facebook.'
  end

  test "oauth sign out page for google account" do
    get :oauth_sign_out, params: {provider: 'google_oauth2'}
    assert_select 'a[href="https://accounts.google.com/logout"]'
    assert_select 'h4', 'You used Google to sign in. Click here to sign out of Google.'
  end

  test "oauth sign out page for microsoft account" do
    get :oauth_sign_out, params: {provider: 'windowslive'}
    assert_select 'a[href="http://login.live.com/logout.srf"]'
    assert_select 'h4', 'You used Microsoft to sign in. Click here to sign out of Microsoft.'
  end

  test "deleted user cannot sign in" do
    teacher = create(:teacher, :deleted)

    post :create, params: {
      user: {
        login: '',
        hashed_email: teacher.hashed_email,
        password: teacher.password
      }
    }

    assert_signed_in_as nil
  end

  test "session cookie set if remember me not checked" do
    teacher = create(:teacher)

    post :create, params: {
      user: {
        login: '',
        hashed_email: teacher.hashed_email,
        password: teacher.password
      }
    }

    assert_nil @response.cookies["remember_user_token"]
  end

  test "persistent cookie set if remember me is checked" do
    teacher = create(:teacher)

    post :create, params: {
      user: {
        login: '',
        hashed_email: teacher.hashed_email,
        password: teacher.password,
        remember_me: '1'
      }
    }

    assert @response.cookies["remember_user_token"]
  end
end
