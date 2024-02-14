require 'test_helper'

module RegistrationsControllerTests
  #
  # Tests over PATCH /users/set_user_information
  #
  class SetUserInformationTest < ActionDispatch::IntegrationTest
    test "set_user_information does nothing if user is not signed in" do
      User.any_instance.expects(:update).never
      patch '/users/set_user_information', params: {user: {age: '20'}}
      assert_response :forbidden
    end

    test "set_user_information does nothing if user age is already set" do
      User.any_instance.expects(:update).never
      student = create :student, age: 18
      assert_equal 18, student.age

      sign_in student
      patch '/users/set_user_information', params: {user: {age: '20'}}
      assert_response :success

      student.reload
      assert_equal 18, student.age
    end

    test "set_user_information sets age if user is signed in and age is blank" do
      student = create :student_in_picture_section, birthday: nil
      assert student.age.blank?

      sign_in student
      patch '/users/set_user_information', params: {user: {age: '20'}}
      assert_response :success

      student.reload
      assert_equal 20, student.age
    end
  end
end
