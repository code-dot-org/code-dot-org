require 'test_helper'

class Api::V1::Pd::FacilitatorProgramRegistrationsControllerTest < ::ActionController::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @facilitator = create :facilitator
    @test_params = {
      form_data: build(:pd_facilitator_program_registration_hash),
      teachercon: 1
    }
  end

  test 'logged in facilitators can create facilitator program_registrations' do
    sign_in @facilitator

    assert_creates Pd::FacilitatorProgramRegistration do
      put :create, params: @test_params
      assert_response :success
    end
  end

  test 'validates against invalid responses' do
    sign_in @facilitator

    program_registration_hash = build(:pd_facilitator_program_registration_hash)
    program_registration_hash.delete('liabilityWaiver')

    assert_no_difference 'Pd::FacilitatorProgramRegistration.count' do
      put :create, params: {
        form_data: program_registration_hash,
        teachercon: 1
      }
      assert_response :bad_request
    end

    program_registration_hash['liabilityWaiver'] = "Invalid response"

    assert_no_difference 'Pd::FacilitatorProgramRegistration.count' do
      put :create, params: {
        form_data: program_registration_hash,
        teachercon: 1
      }
      assert_response :bad_request
    end

    program_registration_hash['liabilityWaiver'] = "Yes"

    assert_creates Pd::FacilitatorProgramRegistration do
      put :create, params: {
        form_data: program_registration_hash,
        teachercon: 1
      }
      assert_response :success
    end
  end

  test 'strip_utf8mb4' do
    sign_in @facilitator

    program_registration_hash = build(:pd_facilitator_program_registration_hash)
    program_registration_hash['notes'] = "My favorite emoji, the #{panda_panda}, would not be possible without CS"

    assert_creates Pd::FacilitatorProgramRegistration do
      put :create, params: {
        form_data: program_registration_hash,
        teachercon: 1
      }
      assert_response :success
    end

    result_hash = Pd::FacilitatorProgramRegistration.last.form_data_hash
    assert_equal 'My favorite emoji, the Panda, would not be possible without CS', result_hash['notes']
  end
end
