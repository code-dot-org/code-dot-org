require 'test_helper'

class Pd::FacilitatorProgramRegistrationControllerTest < ::ActionController::TestCase
  test 'non-facilitators cannot create' do
    get :new, params: {teachercon: 1}
    assert_template("unauthorized")

    sign_in create :student
    get :new, params: {teachercon: 1}
    assert_template("unauthorized")

    sign_in create :teacher
    get :new, params: {teachercon: 1}
    assert_template("unauthorized")
  end

  test 'non-registered facilitators cannot create' do
    sign_in create :facilitator
    get :new, params: {teachercon: 1}
    assert_template("not_attending")
  end

  test 'registered facilitators can create' do
    @facilitator = create :facilitator
    create :pd_facilitator_teachercon_attendance, user: @facilitator

    sign_in @facilitator
    get :new, params: {teachercon: 1}
    assert_template("new")
  end
end
