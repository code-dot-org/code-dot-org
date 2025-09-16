require 'test_helper'
require 'cdo/delete_accounts_helper'

class Services::User::PiiScrubberTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:email) {Faker::Internet.unique.email}
  let(:user) do
    create(
      :teacher,
      :within_united_states,
      email: email,
      current_sign_in_ip: '192.168.0.1',
      name: 'John Doe',
      given_name: 'John',
      family_name: 'Doe',
      full_address: '123 Main St, Springfield, USA',
    )
  end
  let(:described_instance) {described_class.new(user: user)}

  describe '#call' do
    subject(:scrub_pii) {described_instance.call}

    let(:delete_accounts_helper_stub) {stub(:delete_accounts_helper)}
    let(:soft_deleted_user) {true}

    before do
      delete_accounts_helper_stub.stubs(:anonymize_regional_partner_contacts)
      delete_accounts_helper_stub.stubs(:anonymize_legacy_pd_tables)
      delete_accounts_helper_stub.stubs(:anonymize_peer_reviews)
      delete_accounts_helper_stub.stubs(:anonymize_pd_applications)
      delete_accounts_helper_stub.stubs(:anonymize_workshop_surveys)
      delete_accounts_helper_stub.stubs(:remove_poste_data)
      delete_accounts_helper_stub.stubs(:purge_contact_rollups)
      DeleteAccountsHelper.stubs(:new).with(bypass_safety_constraints: true).returns(delete_accounts_helper_stub)

      user.destroy if soft_deleted_user
    end

    it 'removes data using helper methods' do
      expect(delete_accounts_helper_stub).to receive(:anonymize_legacy_pd_tables)
      expect(delete_accounts_helper_stub).to receive(:anonymize_regional_partner_contacts).with(user.id)
      expect(delete_accounts_helper_stub).to receive(:anonymize_peer_reviews).with(user.id)
      expect(delete_accounts_helper_stub).to receive(:anonymize_pd_applications).with(user.id, email)
      expect(delete_accounts_helper_stub).to receive(:anonymize_workshop_surveys)
      expect(delete_accounts_helper_stub).to receive(:remove_poste_data).with(email)
      expect(delete_accounts_helper_stub).to receive(:purge_contact_rollups).with(email)
      scrub_pii
    end

    it 'removes data from external sources' do
      expect(described_instance).to receive(:scrub_external_data)
      scrub_pii
    end

    context 'when user has PD data with PII' do
      before do
        Pd::MiscSurvey.any_instance.stubs(:map_answers_to_attributes) # Avoids JotForm API calls
        user.simple_survey_submissions << create(:simple_survey_submission, simple_survey_form: create(:simple_survey_form), foorm_submission: create(:foorm_submission, answers: {foo: email}.to_json))
        user.misc_surveys << create(:misc_survey, submission_id: create(:foorm_submission).id, answers: {foo: email}.to_json)
        user.pd_enrollments << create(:pd_enrollment, email: email, first_name: 'John', last_name: 'Doe')
      end

      it 'removes email from foorm submissions' do
        scrub_pii
        _(user.simple_survey_submissions.first.foorm_submission.reload.answers).wont_match(/#{email}/)
      end

      it 'removes answers from misc surveys' do
        scrub_pii
        _(user.misc_surveys.first.reload.answers).must_be_nil
      end

      it 'removes PII from PD enrollments' do
        scrub_pii
        _(user.pd_enrollments.with_deleted.first.email).must_be_empty
        _(user.pd_enrollments.with_deleted.first.first_name).must_be_nil
        _(user.pd_enrollments.with_deleted.first.last_name).must_be_nil
      end
    end

    context 'when user is not soft-deleted' do
      let(:soft_deleted_user) {false}

      it 'raises an error' do
        _ {scrub_pii}.must_raise ArgumentError
      end
    end

    context 'when non-user object is passed in' do
      let(:user) {create(:section)}
      it 'raises an error' do
        _ {scrub_pii}.must_raise ArgumentError
      end
    end

    context 'when migrated' do
      it 'removes user email and authentication data' do
        _(user.read_attribute(:email)).must_be :present?
        _(user.read_attribute(:hashed_email)).must_be :present?
        _(user.authentication_options.with_deleted).must_be :present?
        scrub_pii
        user.reload
        _(user.email).must_equal ''
        _(user.hashed_email).must_equal ''
        _(user.authentication_options.with_deleted.first.email).must_equal ''
        _(user.authentication_options.with_deleted.first.data).must_be_nil
        _(user.authentication_options.with_deleted.first.authentication_id).must_be_nil
      end

      it 'removes names and assigns a UUID username' do
        _(user.name).must_be :present?
        _(user.given_name).must_be :present?
        _(user.family_name).must_be :present?
        original_username = user.username
        scrub_pii
        user.reload
        _(user.name).must_be_nil
        _(user.given_name).must_be_nil
        _(user.family_name).must_be_nil
        _(user.username).wont_equal original_username
        _(user.username).wont_be_nil
      end

      it 'removes address and location data' do
        _(user.full_address).must_be :present?
        _(user.current_sign_in_ip).must_be :present?
        scrub_pii
        user.reload
        _(user.full_address).must_be_nil
        _(user.current_sign_in_ip).must_be_nil
        _(user.user_geos.first.cleared?).must_equal true
      end

      it 'sets pii_scrubbed_at' do
        scrub_pii
        user.reload
        _(user.pii_scrubbed_at).wont_be_nil
      end
    end

    context 'when not migrated' do
      let(:user) do
        create(
          :teacher,
          :demigrated,
          :within_united_states,
          :google_sso_provider,
          email: email,
          current_sign_in_ip: '192.168.0.1',
        ).destroy
      end

      it 'removes legacy oauth fields' do
        _(user.oauth_token).must_be :present?
        _(user.oauth_refresh_token).must_be :present?
        _(user.oauth_token_expiration).must_be :present?
        scrub_pii
        user.reload
        _(user.oauth_token).must_be_nil
        _(user.oauth_refresh_token).must_be_nil
        _(user.oauth_token_expiration).must_be_nil
      end

      it 'removes email even without an auth option' do
        scrub_pii
        user.reload
        _(user.email).must_equal ''
        _(user.hashed_email).must_be_nil
      end
    end

    context 'when user is facilitator' do
      let(:user) {user_facilitator_info.user}

      let!(:user_facilitator_info) {create(:user_facilitator_info)}

      it 'destroys associated facilitator info record' do
        _ {scrub_pii}.must_change -> {user_facilitator_info.destroyed?}, from: false, to: true
      end
    end
  end
end
