require 'test_helper'
class Pd::WorkshopMaterialOrdersControllerTest < ::ActionController::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @workshop = create :pd_ended_workshop, course: Pd::Workshop::COURSE_CSF
    @teacher = create :teacher
    @enrollment = create :pd_enrollment, :from_user, user: @teacher, workshop: @workshop
  end

  setup do
    Pd::Enrollment.any_instance.stubs(completed_survey?: true)
    Geocoder.stubs(:search).returns(
      [OpenStruct.new(
        city: 'Seattle',
        postal_code: '98101',
        state_code: 'WA',
        street_number: '1501'
      )]
    )
  end

  test_redirect_to_sign_in_for :new, params: -> {{enrollment_code: @enrollment.code}}

  test 'teacher without survey is redirected to survey' do
    Pd::Enrollment.any_instance.stubs(completed_survey?: false)
    sign_in @teacher
    get :new, params: {enrollment_code: @enrollment.code}
    assert_response :redirect
    assert_redirected_to CDO.code_org_url("/pd-workshop-survey/#{@enrollment.code}", CDO.default_scheme)
  end

  # The survey page displays a thanks message for a non CSF workshop with a completed survey.
  test 'non-CSF enrollment is redirected to survey' do
    non_csf_workshop = create :pd_ended_workshop, course: Pd::Workshop::COURSE_CSD
    non_csf_teacher = create :teacher
    non_csf_enrollment = create :pd_enrollment, :from_user, user: non_csf_teacher, workshop: non_csf_workshop

    sign_in non_csf_teacher
    get :new, params: {enrollment_code: non_csf_enrollment.code}
    assert_response :redirect
    assert_redirected_to CDO.code_org_url("/pd-workshop-survey/#{non_csf_enrollment.code}", CDO.default_scheme)
  end

  test 'teacher with survey can see the form' do
    sign_in @teacher
    get :new, params: {enrollment_code: @enrollment.code}
    assert_response :success
    assert_select 'h2', /^Complete the following form if you'd like to receive materials/
  end

  test 'teacher who already submitted an order sees thanks' do
    create :pd_workshop_material_order, enrollment: @enrollment
    sign_in @teacher
    get :new, params: {enrollment_code: @enrollment.code}
    assert_response :success
    assert_thanks
  end

  test 'teachers get forbidden for an enrollment code that is not theirs' do
    another_enrollment = create :pd_enrollment
    sign_in @teacher
    get :new, params: {enrollment_code: another_enrollment.code}
    assert_response :forbidden
  end

  test 'create saves a new order' do
    sign_in @teacher
    assert_creates Pd::WorkshopMaterialOrder do
      post :create, params: create_params
    end
    assert_response :success
    assert_thanks
  end

  test 'create renders new with errors on failed save' do
    sign_in @teacher

    bad_params = create_params
    bad_params[:pd_workshop_material_order][:street] = ''
    assert_does_not_create Pd::WorkshopMaterialOrder do
      post :create, params: bad_params
    end
    assert_response :success
    assert_select '#error_explanation' do
      assert_select 'li', 'Street is required'
    end
  end

  test_user_gets_response_for :admin_index, user: :admin, response: :success
  test_user_gets_response_for :admin_index, user: :teacher, response: :forbidden

  test 'admin index has page header' do
    sign_in create(:admin)
    get :admin_index
    assert_select 'h5.page-header' do
      assert_select 'a.btn', '<<'
      assert_select 'a.btn', '<'
      assert_select 'a.btn', '>'
      assert_select 'a.btn', '>>'

      assert_select 'span.dropdown', /Show/ do
        assert_select 'a', '25'
        assert_select 'a', '50'
        assert_select 'a', 'All'
      end
    end
  end

  private

  def assert_thanks
    assert_select 'h1', 'Thank you'
    assert_select 'h3', /^Your request has been received\./
  end

  def create_params
    {
      enrollment_code: @enrollment.code,
      pd_workshop_material_order: {
        school_or_company: 'Code.org',
        street: '1501 4th Ave',
        apartment_or_suite: 'Suite 900',
        city: 'Seattle',
        state: 'WA',
        zip_code: '98101',
        phone_number: '555-111-2222'
      }
    }
  end
end
