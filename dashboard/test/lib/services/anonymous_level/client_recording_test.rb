require 'test_helper'

class Services::AnonymousLevel::ClientRecordingTest < ActiveSupport::TestCase
  let(:described_class) {Services::AnonymousLevel::ClientRecording}
  let(:described_instance) {described_class.new(anon_user_id:, user_agent:)}

  let(:anon_user_id) {Cdo::AnonUserId.generate}
  let(:webview) do
    'Mozilla/5.0 (Linux; Android 11; KFRAPWI Build/RS8338.3339N; wv) AppleWebKit/537.36 ' \
      '(KHTML, like Gecko) Version/4.0 Chrome/150.0.7871.181 Safari/537.36'
  end
  let(:user_agent) {"#{webview} CodeAIMobileApp/1.0.0 (com.amazon.venezia)"}

  let(:client_scope) {AnonymousLevel::Client.where(anon_user_id:)}

  it 'inherits from Services::Base' do
    _(described_class.superclass).must_equal Services::Base
  end

  it 'keeps first 1000 characters of user agent' do
    instance = described_class.new(anon_user_id:, user_agent: 'x' * 5_000)

    _(instance.user_agent).must_equal 'x' * 1_000
  end

  describe '#call' do
    subject(:record_client) {described_instance.call}

    it 'creates anonymous level client' do
      _ {record_client}.must_change -> {client_scope.count}, from: 0, to: 1
    end

    it 'returns anonymous level client' do
      _(record_client).must_equal client_scope.first!
    end

    it 'records app and install source' do
      client = record_client

      _(client.name).must_equal 'CodeAIMobileApp'
      _(client.install_source).must_equal 'com.amazon.venezia'
    end

    context 'when CodeAI mobile app has no install source' do
      let(:user_agent) {"#{webview} CodeAIMobileApp/1.0.0"}

      it 'records app without install source' do
        client = record_client

        _(client.name).must_equal 'CodeAIMobileApp'
        _(client.install_source).must_be_nil
      end
    end

    context 'when CodeAI iOS app recorded progress' do
      let(:user_agent) do
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 ' \
          '(KHTML, like Gecko) Mobile/15E148 CodeAIMobileApp/1.0.0'
      end

      it 'records app' do
        _(record_client.name).must_equal 'CodeAIMobileApp'
      end
    end

    context 'when browser recorded progress' do
      let(:user_agent) do
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36'
      end

      it 'records no client' do
        _ {record_client}.wont_change -> {client_scope.count}

        _(record_client).must_be_nil
      end
    end

    context 'when request has no user agent' do
      let(:user_agent) {nil}

      it 'records no client' do
        _ {record_client}.wont_change -> {client_scope.count}

        _(record_client).must_be_nil
      end
    end

    context 'when matching client exists' do
      let(:user_agent) {"#{webview} CodeAIMobileApp/1.0.0 (com.android.vending)"}
      let!(:client) {create(:anonymous_level_client, :amazon_mobile_app, anon_user_id:)}

      it 'returns existing client without updating it' do
        _ {record_client}.wont_change -> {client_scope.count}

        _(record_client).must_equal client
        _(client.reload.install_source).must_equal 'com.amazon.venezia'
      end
    end

    context 'when another request creates matching client first' do
      before do
        AnonymousLevel::Client.stubs(:find_or_create_by).with(anon_user_id:).raises(ActiveRecord::RecordNotUnique.new)
      end

      it 'returns nil' do
        _(record_client).must_be_nil
      end
    end

    context 'when uniqueness validation detects matching client created by another request' do
      before do
        create(:anonymous_level_client, :amazon_mobile_app, anon_user_id:)
        # find_or_create_by finds through a relation; missing the row there is what the race looks like.
        AnonymousLevel::Client.const_get(:ActiveRecord_Relation).any_instance.stubs(:find_by).returns(nil)
      end

      it 'returns unsaved client' do
        client = record_client

        _(client).wont_be :persisted?
        _(client.errors[:anon_user_id]).must_include 'has already been taken'
      end
    end

    context 'when client fails another validation' do
      let(:anon_user_id) {'invalid'}

      it 'returns unsaved client without raising' do
        client = record_client

        _(client).wont_be :persisted?
        _(client.errors[:anon_user_id]).must_include 'is invalid'
      end
    end
  end
end
