require 'test_helper'

class Services::Lti::DeepLinkingResponseBuilderTest < ActiveSupport::TestCase
  let(:request_issuer) {Policies::Lti::LMS_PLATFORMS[:schoology][:issuer]}
  let(:client_id) {SecureRandom.alphanumeric(10)}
  let(:deployment_id) {SecureRandom.alphanumeric(10)}
  let(:deep_linking_settings_data) {SecureRandom.alphanumeric(10)}
  let(:content_items) {['item-1', 'item-2']}
  let(:described_instance) do
    described_class.new(
      request_issuer:,
      client_id:,
      deployment_id:,
      deep_linking_settings_data:,
      content_items:
    )
  end

  subject(:response_jwt) {described_instance.call}
  subject(:decoded_jwt) {decoded_jwt}

  describe '#call' do
    before do
      jwk = JWT::JWK.new(OpenSSL::PKey::RSA.new(2048), {use: 'sig', alg: 'RS256', kid: 'test-kid'})
      fake_private_key_obj = {
        kid: jwk[:kid],
        private_key: jwk.signing_key.to_s,
      }
      CDO.stubs(:jwk_private_key_data).returns(fake_private_key_obj)
    end

    it 'returns a valid JWT' do
      _(decoded_jwt).wont_be_nil
    end

    it 'includes expected claims in the JWT payload' do
      payload = decoded_jwt[0]
      _(payload['iss']).must_equal client_id
      _(payload['aud']).must_equal request_issuer
      _(payload[Policies::Lti::MessageType::CLAIM.to_s]).must_equal Policies::Lti::MessageType::DEEP_LINKING_RESPONSE
      _(payload[Policies::Lti::LTI_DEPLOYMENT_ID_CLAIM]).must_equal deployment_id
      _(payload[Policies::Lti::DEEP_LINKING_DATA_CLAIM]).must_equal deep_linking_settings_data
      _(payload[Policies::Lti::DEEP_LINKING_CONTENT_ITEMS_CLAIM]).must_equal content_items
    end

    context 'when deep_linking_settings_data is not provided' do
      let(:deep_linking_settings_data) {nil}

      it 'omits the data claim from the JWT payload' do
        payload = decoded_jwt[0]
        _(payload).wont_include Policies::Lti::DEEP_LINKING_DATA_CLAIM
      end
    end

    context 'when content_items is empty' do
      let(:content_items) {[]}

      it 'includes an empty content items array in the JWT payload' do
        payload = decoded_jwt[0]
        _(payload[Policies::Lti::DEEP_LINKING_CONTENT_ITEMS_CLAIM]).must_equal []
      end
    end
  end

  private def decoded_jwt
    pk_string = CDO.jwk_private_key_data.transform_keys(&:to_sym)[:private_key]
    pk = OpenSSL::PKey::RSA.new(pk_string)
    JWT.decode(response_jwt, pk, true, {algorithm: 'RS256'})
  end
end
