require 'test_helper'

class Services::Lti::AccountUnlinkerTest < ActiveSupport::TestCase
  describe '#call' do
    let(:student_user) {create :student}
    let(:teacher_user) {create :teacher}
    let(:lti_integration) {create :lti_integration}
    let(:auth_option) {create :lti_authentication_option, authentication_id: "#{lti_integration.issuer}|#{lti_integration.client_id}|#{student_user.id}"}
    let(:lti_identity) {create :lti_user_identity, user: student_user, lti_integration: lti_integration, subject: student_user.id}

    context 'with one auth option' do
      before(:context) do
        student_user.authentication_options.find_by(credential_type: 'email')&.destroy
        student_user.authentication_options << auth_option
      end

      it 'does not remove the auth option' do
        assert_raises(Exception) do
          Services::Lti::AccountUnlinker.call(user: student_user, auth_option: auth_option)
        end
        assert student_user.reload.authentication_options.include?(auth_option)
      end

      it 'does not remove the lti user identity' do
        assert_raises(Exception) do
          Services::Lti::AccountUnlinker.call(user: student_user, auth_option: auth_option)
        end
        assert student_user.lti_user_identities.include?(lti_identity)
      end
    end

    context 'with multiple auth options' do
      it 'removes the auth option' do
        Services::Lti::AccountUnlinker.call(user: student_user, auth_option: auth_option)
        refute student_user.reload.authentication_options.any?(&:lti?)
      end

      it 'removes the lti user identity' do
        Services::Lti::AccountUnlinker.call(user: student_user, auth_option: auth_option)
        refute student_user.reload.lti_user_identities.any?
      end
    end

    context 'when student' do
      it 'does not remove the user from sections' do
        section = create :section
        section.students << student_user
        Services::Lti::AccountUnlinker.call(user: student_user, auth_option: auth_option)
        assert section.reload.students.include?(student_user)
        assert student_user.reload.sections_as_student.include?(section)
      end

      it 'does not attempt to promote coteachers' do
        Services::Lti::AccountUnlinker.any_instance.expects(:promote_coteachers).never
        Services::Lti::AccountUnlinker.call(user: student_user, auth_option: auth_option)
      end
    end

    context 'when teacher' do
      let(:auth_option) {create :lti_authentication_option, authentication_id: "#{lti_integration.issuer}|#{lti_integration.client_id}|#{teacher_user.id}"}
      let(:lti_identity) {create :lti_user_identity, user: teacher_user, lti_integration: lti_integration, subject: teacher_user.id}
      let(:coteacher) {create :teacher}
      let(:lti_course) {create :lti_course, lti_integration: lti_integration}
      let(:lti_section) {create :lti_section, section: create(:section, user: teacher_user, login_type: 'lti_v1'), lti_course: lti_course}

      before(:each) do
        teacher_user.authentication_options << auth_option unless teacher_user.authentication_options.include?(auth_option)
        teacher_user.lti_user_identities << lti_identity unless teacher_user.lti_user_identities.include?(lti_identity)
      end

      it 'promotes coteachers if present' do
        coteacher.sections_instructed << lti_section.section
        Services::Lti::AccountUnlinker.call(user: teacher_user, auth_option: auth_option)
        assert lti_section.reload.section.user_id == coteacher.id
      end

      it 'does not promote coteachers if none are present' do
        Services::Lti::AccountUnlinker.call(user: teacher_user, auth_option: auth_option)
        assert lti_section.reload.section.user_id == teacher_user.id
      end
    end
  end
end
