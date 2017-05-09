require 'test_helper'

class Pd::TeacherApplicationControllerTest < ::ActionController::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @teacher_application = create :pd_teacher_application
  end

  # Both teachers and students can see the teacher application form.
  # Note student accounts will be converted to teacher on create
  # (see Pd::TeacherApplication.ensure_user_is_a_teacher).
  test_user_gets_response_for :new, user: :teacher
  test_user_gets_response_for :new, user: :student
  test_redirect_to_sign_in_for :new

  def self.test_workshop_admin_only(method, action, success_response, params = nil)
    test_user_gets_response_for action, user: :teacher, method: method, params: params, response: :forbidden
    test_user_gets_response_for action, user: :workshop_admin, method: method, params: params, response: success_response
  end

  test_workshop_admin_only :get, :manage, :success
  test_workshop_admin_only :get, :edit, :success, -> {{teacher_application_id: @teacher_application.id}}
  test_workshop_admin_only :patch, :update, :redirect, -> do
    {
      teacher_application_id: @teacher_application.id,

      # need at least one required update param
      pd_teacher_application: {
        primary_email: @teacher_application.primary_email
      }
    }
  end

  test_workshop_admin_only :get, :construct_email, :success, -> {{teacher_application_id: @teacher_application.id}}
  test_workshop_admin_only :post, :send_email, :success, -> {{teacher_application_id: @teacher_application.id}}
end
