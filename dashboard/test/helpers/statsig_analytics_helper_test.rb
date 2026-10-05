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
    # Defined here rather than inherited, so these cases never depend on
    # whatever sign-in state Devise happens to leave behind.
    let(:current_user) {nil}

    before do
      DCDO.stubs(:get).with('statsig-enabled', true).returns(true)
    end

    it 'reports the client key when one is provisioned' do
      CDO.stubs(:safe_statsig_api_client_key).returns('client-test-key')
      _(analytics_config).must_equal(
        {
          provider: 'statsig',
          enabled: true,
          statsig: {clientKey: 'client-test-key', autoCapture: false},
        }
      )
    end

    # The frontend runs autocapture exactly where the legacy bundle loads, so
    # this reads the same path gate rather than a list of its own.
    it 'turns autocapture on for a path the gate matches' do
      CDO.stubs(:safe_statsig_api_client_key).returns('client-test-key')
      request.path = StatsigAnalyticsHelper::TARGET_PATHS.first

      _(analytics_config[:statsig][:autoCapture]).must_equal true
    end

    it 'leaves autocapture off for a path the gate does not match' do
      CDO.stubs(:safe_statsig_api_client_key).returns('client-test-key')
      request.path = '/home'

      _(analytics_config[:statsig][:autoCapture]).must_equal false
    end

    it 'reports provider none when the client key is missing' do
      set_env :production
      CDO.stubs(:safe_statsig_api_client_key).returns('')
      _(analytics_config).must_equal({provider: 'none', enabled: true})
    end

    it 'surfaces the switch without collapsing the configured provider' do
      CDO.stubs(:safe_statsig_api_client_key).returns('client-test-key')
      DCDO.stubs(:get).with('statsig-enabled', true).returns(false)
      _(analytics_config).must_equal(
        {
          provider: 'statsig',
          enabled: false,
          statsig: {clientKey: 'client-test-key', autoCapture: false},
        }
      )
    end

    it 'reports the switch alongside an unconfigured provider' do
      CDO.stubs(:safe_statsig_api_client_key).returns('')
      DCDO.stubs(:get).with('statsig-enabled', true).returns(false)
      _(analytics_config).must_equal({provider: 'none', enabled: false})
    end

    context 'when a user is signed in' do
      let(:current_user) {build(:teacher, id: 42)}

      it 'seeds the identity alongside the client key' do
        CDO.stubs(:safe_statsig_api_client_key).returns('client-test-key')
        _(analytics_config).must_equal(
          {
            provider: 'statsig',
            enabled: true,
            statsig: {clientKey: 'client-test-key', autoCapture: false},
            user: {userId: '42', userType: 'teacher'},
          }
        )
      end

      it 'keeps seeding the identity while the switch is off' do
        CDO.stubs(:safe_statsig_api_client_key).returns('client-test-key')
        DCDO.stubs(:get).with('statsig-enabled', true).returns(false)
        _(analytics_config).must_equal(
          {
            provider: 'statsig',
            enabled: false,
            statsig: {clientKey: 'client-test-key', autoCapture: false},
            user: {userId: '42', userType: 'teacher'},
          }
        )
      end

      it 'omits the identity when there is no provider to carry it' do
        CDO.stubs(:safe_statsig_api_client_key).returns('')
        _(analytics_config).must_equal({provider: 'none', enabled: true})
      end
    end
  end
end
