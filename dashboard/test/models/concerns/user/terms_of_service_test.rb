require 'test_helper'

class TermsOfServiceTest < ActiveSupport::TestCase
  let(:teacher_tos_version) {User.latest_terms_version}
  let(:teacher) {build(:teacher, terms_of_service_version: teacher_tos_version)}
  let(:latest_tos_version) {User::TermsOfService::TERMS_OF_SERVICE_VERSIONS.last}

  describe '#accepted_latest_terms?' do
    context 'when user accepted the latest version' do
      it 'returns true' do
        expect(teacher.accepted_latest_terms?).must_equal true
      end
    end

    context 'when user accepted an older version' do
      let(:teacher_tos_version) {User.latest_terms_version - 1}
      it 'returns false' do
        _(teacher.accepted_latest_terms?).must_equal false
      end
    end

    context 'when user has no accepted version' do
      let(:teacher_tos_version) {nil}
      it 'returns false if user has no accepted version' do
        _(teacher.accepted_latest_terms?).must_equal false
      end
    end
  end

  describe '#latest_terms_version' do
    it 'returns the latest version' do
      _(User.latest_terms_version).must_equal(latest_tos_version)
    end
  end

  describe '#update_user_tos_version_accept' do
    let(:teacher_tos_version) {nil}
    it 'updates the terms_of_service_version to the latest and saves' do
      teacher.save!
      teacher.update_user_tos_version_accept
      _(teacher.terms_of_service_version).must_equal(latest_tos_version)
    end
  end
end
