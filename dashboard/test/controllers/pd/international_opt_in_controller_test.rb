require 'test_helper'

class Pd::InternationalOptInControllerTest < ::ActionController::TestCase
  self.use_transactional_test_case = true

  test 'signed in teacher' do
    teacher = create :teacher
    sign_in teacher
    get :new
    assert_response :success
  end

  test 'signed out' do
    get :new
    assert_template 'pd/application/teacher_application/logged_out'
  end

  test 'signed in student' do
    sign_in create :student
    get :new
    assert_template 'pd/application/teacher_application/not_teacher'
  end

  test 'signed in teacher with no email' do
    teacher = create :teacher
    teacher.email = ""
    teacher.save(validate: false)
    sign_in teacher
    get :new
    assert_template 'pd/application/teacher_application/no_teacher_email'
  end
end
