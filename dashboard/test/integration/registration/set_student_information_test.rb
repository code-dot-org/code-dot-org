require 'test_helper'

module RegistrationsControllerTests
  #
  # Tests over PATCH /users/set_student_information
  #
  class SetStudentInformationTest < ActionDispatch::IntegrationTest
    test "set_student_information does nothing if user is not signed in" do
      User.any_instance.expects(:update).never
      patch '/users/set_student_information', params: {user: {age: '20'}}
      assert_response :forbidden
    end

    test "set_student_information does nothing if user age, state and gender are already set" do
      User.any_instance.expects(:update).never
      student = create :student, age: 18, us_state: 'AL', gender_student_input: 'he', user_provided_us_state: true, country_code: 'US'
      assert_equal 18, student.age
      assert_equal 'AL', student.us_state
      assert_equal 'm', student.gender
      assert_equal 'US', student.country_code

      sign_in student
      patch '/users/set_student_information', params: {user: {age: '20', us_state: 'AK', gender_student_input: 'They', country_code: 'CO'}}
      assert_response :success

      student.reload
      assert_equal 18, student.age
      assert_equal 'AL', student.us_state
      assert_equal 'm', student.gender
      assert_equal 'US', student.country_code
    end

    test "set_student_information updates state if user has not provided state" do
      student = create :student, age: 18, us_state: 'AL', gender_student_input: 'he', user_provided_us_state: false
      assert_equal 18, student.age
      assert_equal 'AL', student.us_state
      assert_equal 'm', student.gender
      assert_nil student.country_code

      sign_in student
      patch '/users/set_student_information', params: {user: {us_state: 'AK', country_code: 'US'}}
      assert_response :success

      student.reload
      assert_equal 18, student.age
      assert_equal 'AK', student.us_state
      assert_equal 'm', student.gender
      assert_equal true, student.user_provided_us_state
      assert_equal 'US', student.country_code
    end

    test "set_student_information sets age if user is only shown age option" do
      student = create :student_in_picture_section, birthday: nil
      assert student.age.blank?

      sign_in student
      patch '/users/set_student_information', params: {user: {age: '20'}}
      assert_response :success

      student.reload
      assert_equal 20, student.age
      assert_nil student.user_provided_us_state
    end

    test "set_student_information sets age and state if user is signed in and age and state is blank" do
      student = create :student_in_picture_section, birthday: nil
      assert student.age.blank?

      sign_in student
      patch '/users/set_student_information', params: {user: {age: '20', us_state: 'AL', gender_student_input: 'he', country_code: 'US'}}
      assert_response :success

      student.reload
      assert_equal 20, student.age
      assert_equal 'AL', student.us_state
      assert_equal 'm', student.gender
      assert_equal 'US', student.country_code
    end

    test "set_student_information sets age if user has user_provided_us_state set to false" do
      student = create :student
      student.update!(birthday: nil, age: nil, country_code: 'RD')
      sign_in student

      patch '/users/set_student_information', params: {user: {age: '10'}}
      assert_response :success

      assert_equal 10, student.reload.age
    end
  end
end
