require "test_helper"

class LtiDeploymentTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  test 'validate required fields' do
    refute build(:lti_user_identity, lti_integration: nil).valid? 'lti_integration is required'
  end

  describe '#restricted?' do
    let(:deployment) {build(:lti_deployment)}
    let(:restricted_id) {SecureRandom.random_number(1_000_000)}
    let(:restricted?) {deployment.restricted?}

    before do
      stub_const('Policies::Lti::DeploymentConfiguration::RESTRICTED_DEPLOYMENTS', [restricted_id])
    end

    it 'returns false' do
      _(restricted?).must_equal false
    end

    context 'when restricted' do
      before do
        deployment.update(id: restricted_id)
      end

      it 'returns true' do
        _(restricted?).must_equal true
      end
    end
  end
end
