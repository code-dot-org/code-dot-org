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
                      password: "apassword",
                      email: "a_student@somewhere.xx",
                      gender: 'F',
                      age: '15',
                      user_type: 'student'}

    # make sure all the classes are loaded
    post '/users', user: student_params
    assert_response :success
    assert_select 'div.alert', 'Name must be present'

#    no_database

    post '/users', user: student_params.merge(name: panda_panda)
    assert_response :success
    assert_select 'div#error_explanation', /Display Name is invalid/

    post '/users', user: student_params.merge(email: "#{panda_panda}@panda.com")
    assert_response :success
    assert_select 'div#error_explanation', /Email is invalid/
  end

  def sign_in(user, password)
    post '/users/sign_in', login: user.email, password: password
    assert_response :success
  end

  test "attempting to update a user with utf8mb4 chars does not hit the db" do
    password = 'password'
    user = create :user, password: password
    sign_in user, password

#    no_database

    post '/users', user: {name: panda_panda}
    assert_response :success
    assert_select 'div#error_explanation', /Display Name is invalid/

    post '/users', user: {email: "#{panda_panda}@panda.xx"}
    assert_response :success
    assert_select 'div#error_explanation', /Display Name is invalid/

  end

end
