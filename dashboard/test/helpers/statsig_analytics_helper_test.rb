require 'test_helper'

class StatsigAnalyticsHelperTest < ActionView::TestCase
  describe '#load_web_analytics?' do
    subject(:load_web_analytics) {load_web_analytics?(request)}

    let(:ge_region) {nil}
    let(:request_path) {'/'}

    let(:request) do
      ActionDispatch::TestRequest.create.tap do |request|
        request.path = request_path
        request.stubs(:ge_region).returns(ge_region)
      end
    end

    it 'returns false' do
      _load_web_analytics.must_equal false
    end

    StatsigAnalyticsHelper::TARGET_PATHS.each do |target_path|
      context "when request path is #{target_path}" do
        let(:request_path) {target_path}

        it 'returns true' do
          _load_web_analytics.must_equal true
        end
      end
    end
  end

  describe '#analytics_config' do
    before do
      CDO.stubs(:safe_statsig_api_client_key).returns('client-test-key')
      CDO.stubs(:managed_test_server?).returns(false)
      CDO.stubs(:statsig_force_transmit).returns(false)
    end

    it 'reports provider none in a non-transmitting environment' do
      _(analytics_config).must_equal({provider: 'none'})
    end

    it 'reports the client key in production' do
      set_env :production
      _(analytics_config).must_equal(
        {provider: 'statsig', statsig: {clientKey: 'client-test-key'}}
      )
    end

    it 'reports the client key on the managed test server' do
      CDO.stubs(:managed_test_server?).returns(true)
      _(analytics_config).must_equal(
        {provider: 'statsig', statsig: {clientKey: 'client-test-key'}}
      )
    end

    it 'reports the client key when statsig_force_transmit is set' do
      CDO.stubs(:statsig_force_transmit).returns(true)
      _(analytics_config).must_equal(
        {provider: 'statsig', statsig: {clientKey: 'client-test-key'}}
      )
    end

    it 'reports provider none when the client key is missing' do
      set_env :production
      CDO.stubs(:safe_statsig_api_client_key).returns('')
      _(analytics_config).must_equal({provider: 'none'})
    end
  end
end
