require 'test_helper'

module Api::V1::Pd
  class Teachercon1819RegistrationsControllerTest < ::ActionController::TestCase
    test_redirect_to_sign_in_for :create

    test 'teachers without applications cannot submit registration' do
      app = create :pd_teacher1819_application
      teacher_without_app = create :teacher

      assert_no_difference 'Pd::Teachercon1819Registration.count' do
        sign_in teacher_without_app
        put :create, params: {
          form_data: build(:pd_teachercon1819_registration_hash),
          applicationId: app.id
        }
        assert_response :forbidden
      end
    end

    test 'teachers with applications can submit registration' do
      app = create :pd_teacher1819_application
      teacher_with_app = app.user

      assert_creates Pd::Teachercon1819Registration do
        sign_in teacher_with_app
        put :create, params: {
          form_data: build(:pd_teachercon1819_registration_hash),
          "applicationId" => app.id
        }
        assert_response :created
      end
    end

    test 'only regional partner users can submit partner registrations' do
      partner = create :program_manager

      assert_no_difference 'Pd::Teachercon1819Registration.count' do
        put :create_partner_or_lead_facilitator, params: {
          form_data: build(:pd_teachercon1819_registration_hash, :partner_accepted),
          regionalPartnerId: partner.regional_partners.first.id
        }
        assert_response :forbidden
      end

      assert_creates Pd::Teachercon1819Registration do
        sign_in partner
        put :create_partner_or_lead_facilitator, params: {
          form_data: build(:pd_teachercon1819_registration_hash, :partner_accepted),
          regionalPartnerId: partner.regional_partners.first.id
        }
        assert_response :success
      end
    end
  end
end
