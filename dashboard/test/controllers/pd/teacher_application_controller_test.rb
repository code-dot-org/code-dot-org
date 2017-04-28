require 'test_helper'

class Pd::TeacherApplicationControllerTest < ::ActionController::TestCase
  # Both teachers and students can see the teacher application form.
  # Note student accounts will be converted to teacher on create
  # (see Pd::TeacherApplication.ensure_user_is_a_teacher).
  test_user_gets_response_for :new, user: :teacher
  test_user_gets_response_for :new, user: :student
  test_redirect_to_sign_in_for :new
end
