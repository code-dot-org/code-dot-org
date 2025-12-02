require 'test_helper'

class Services::Clever::V3AuthOptionBuilderTest < ActiveSupport::TestCase
  describe '.call' do
    let(:result) do
      Services::Clever::V3AuthOptionBuilder.call(
        clever_v2_id: clever_v2_id,
        clever_v3_id: clever_v3_id
      )
    end

    let(:clever_v3_id) {'new-v3-clever-id-123'}

    context 'when clever auth option exists with given v2 id' do
      let(:user) {create(:student, :with_clever_authentication_option)}
      let(:original_auth) do
        user.authentication_options.find_by(credential_type: AuthenticationOption::CLEVER)
      end
      let(:clever_v2_id) {original_auth.authentication_id}

      it 'returns new auth option with v3 clever id' do
        _(result.authentication_id).must_equal clever_v3_id
      end

      it 'sets version to v3.1' do
        _(result.version).must_equal AuthenticationOption::Clever::VERSION[:v3_1]
      end

      it 'preserves credential type as clever' do
        _(result.credential_type).must_equal AuthenticationOption::CLEVER
      end

      it 'does not persist the new auth option' do
        _(result.id).must_be_nil
      end

      it 'preserves original email' do
        _(result.email).must_equal original_auth.email
      end

      it 'preserves original hashed_email' do
        _(result.hashed_email).must_equal original_auth.hashed_email
      end

      it 'preserves original user_id' do
        _(result.user_id).must_equal original_auth.user_id
      end

      it 'preserves original data' do
        _(result.data).must_equal original_auth.data
      end
    end

    context 'when no clever auth option exists with given v2 id' do
      let(:clever_v2_id) {'non-existent-v2-id'}

      it 'returns nil' do
        _(result).must_be_nil
      end
    end
  end
end
