require 'test_helper'

class Pd::TeacherApplicationControllerTest < ::ActionController::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @teacher_application = create :pd_teacher_application
    @workshop_admin = create :workshop_admin
    @teacher = create :teacher
  end

  test_redirect_to_sign_in_for :new
  test 'redirects to new teacher application' do
    sign_in @teacher
    get :new
    assert_response :redirect
    assert_redirected_to '/pd/application/teacher'
  end

  def self.test_workshop_admin_only(method, action, success_response, params = nil)
    test_user_gets_response_for action, user: -> {@teacher}, method: method, params: params, response: :forbidden
    test_user_gets_response_for action, user: -> {@workshop_admin}, method: method, params: params, response: success_response
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

  test_workshop_admin_only :post, :upgrade_to_teacher, :redirect, -> {{teacher_application_id: @teacher_application.id}}
  test 'upgrade to teacher' do
    @teacher_application.user.update!(user_type: User::TYPE_STUDENT)
    sign_in @workshop_admin
    post :upgrade_to_teacher, params: {teacher_application_id: @teacher_application.id}
    assert_redirected_to action: :edit
    assert @teacher_application.user.reload.teacher?
  end

  test_workshop_admin_only :get, :construct_email, :success, -> {{teacher_application_id: @teacher_application.id}}
  test_workshop_admin_only :post, :send_email, :success, -> {{teacher_application_id: @teacher_application.id}}
end
