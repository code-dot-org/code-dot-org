require 'test_helper'

class CharsetTest < ActionDispatch::IntegrationTest
  def no_database
    Rails.logger.info '--------------'
    Rails.logger.info 'DISCONNECTING DATABASE'
    Rails.logger.info '--------------'

    ActiveRecord::Base.connection.disconnect!
  end

  test "attempting to log in as user with utf8mb4 chars does not hit the db" do
    # make sure all the classes are loaded
    post '/users/sign_in', login: 'not a user', password: 'not a password'
    assert_response :success
    assert_select 'div.alert', 'Invalid email or password.'

    no_database

    panda_panda = "Panda \u{1F43C}"
    post '/users/sign_in', login: panda_panda, password: 'not a password'
    assert_response :success
    assert_select 'div.alert', 'Invalid email or password.'
  end

  test "attempting to create a user with utf8mb4 chars does not hit the db" do
    student_params = {name: "",
                      password: "password",
                      email: "a_student@somewhere.xx",
                      gender: 'F',
                      age: '15',
                      user_type: 'student'}

    # make sure all the classes are loaded
    post '/users', user: student_params
    assert_response :success
    assert_select 'div#error_explanation', /Display Name is required/

    no_database

    post '/users', user: student_params.merge(name: panda_panda)
    assert_response :success
    assert_select 'div#error_explanation', /Display Name is invalid/

    post '/users', user: student_params.merge(email: "#{panda_panda}@panda.com")
    assert_response :success
    assert_select 'div#error_explanation', /Email is invalid/
  end

  def sign_in(user)
    post '/users/sign_in', user: {login: user.email, password: '00secret'}
    assert_response :redirect
  end

  test "attempting to update a user with utf8mb4 chars does not hit the db" do
    sign_in create(:user)

    no_database

    put '/users', user: {name: panda_panda}
    assert_response :success
    assert_select 'div#error_explanation', /Display Name is invalid/

    put '/users', user: {email: "#{panda_panda}@panda.xx"}
    assert_response :success
    assert_select 'div#error_explanation', /Display Name is invalid/

  end

end
