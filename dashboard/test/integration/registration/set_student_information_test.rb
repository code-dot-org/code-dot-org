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
      student = create :student, age: 18, us_state: 'AL', gender_student_input: 'he'
      assert_equal 18, student.age
      assert_equal 'AL', student.us_state
      assert_equal 'm', student.gender

      sign_in student
      patch '/users/set_student_information', params: {user: {age: '20', us_state: 'AK', gender_student_input: 'They'}}
      assert_response :success

      student.reload
      assert_equal 18, student.age
      assert_equal 'AL', student.us_state
      assert_equal 'm', student.gender
    end

    test "set_student_information sets age if user is signed in and age is blank" do
      student = create :student_in_picture_section, birthday: nil
      assert student.age.blank?

      sign_in student
      patch '/users/set_student_information', params: {user: {age: '20', us_state: 'AL', gender_student_input: 'he'}}
      assert_response :success

      student.reload
      assert_equal 20, student.age
      assert_equal 'AL', student.us_state
      assert_equal 'm', student.gender
    end
  end
end
