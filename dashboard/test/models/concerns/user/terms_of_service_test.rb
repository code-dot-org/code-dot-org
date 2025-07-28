require 'test_helper'

class TermsOfServiceTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:teacher) {build(:teacher, :with_terms_of_service)}
  let(:latest_tos_version) {User::TermsOfService::TERMS_OF_SERVICE_VERSIONS.last}

  describe '#accepted_latest_terms?' do
    it 'returns true if user accepted the latest version' do
      _(teacher.accepted_latest_terms?).must_equal true
    end

    it 'returns false if user accepted an older version' do
      teacher.terms_of_service_version = latest_tos_version - 1
      _(teacher.accepted_latest_terms?).must_equal false
    end

    it 'returns false if user has no accepted version' do
      teacher.terms_of_service_version = nil
      _(teacher.accepted_latest_terms?).must_equal false
    end
  end

  describe '#latest_terms_version' do
    it 'returns the latest version' do
      _(teacher.latest_terms_version).must_equal(latest_tos_version)
    end
  end

  describe '#update_user_tos_version_accept' do
    it 'updates the terms_of_service_version to the latest and saves' do
      teacher.save!
      teacher.terms_of_service_version = nil
      teacher.update_user_tos_version_accept
      _(teacher.terms_of_service_version).must_equal(latest_tos_version)
    end
  end
end
