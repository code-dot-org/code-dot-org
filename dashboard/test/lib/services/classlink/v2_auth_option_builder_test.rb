require 'test_helper'

class Services::Classlink::V2AuthOptionBuilderTest < ActiveSupport::TestCase
  describe '.call' do
    let(:result) do
      Services::Classlink::V2AuthOptionBuilder.call(
        classlink_v1_id: classlink_v1_id,
        tenant_id: tenant_id,
        sourced_id: sourced_id
      )
    end

    let(:tenant_id) {'2222'}
    let(:sourced_id) {'5678_T5678-0005'}

    context 'when classlink auth option exists with given v1 id' do
      let(:user) {create(:student, :with_classlink_authentication_option)}
      let(:original_auth) do
        user.authentication_options.find_by(credential_type: AuthenticationOption::CLASSLINK)
      end
      let(:classlink_v1_id) {original_auth.authentication_id}

      it 'returns new auth option with v2 classlink id' do
        _(result.authentication_id).must_equal "#{tenant_id}|#{sourced_id}"
      end

      it 'sets version to v2' do
        _(result.version).must_equal AuthenticationOption::Classlink::VERSION[:v2]
      end

      it 'preserves credential type as classlink' do
        _(result.credential_type).must_equal AuthenticationOption::CLASSLINK
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

      it 'leaves the v1 auth option untouched' do
        original_attributes = original_auth.attributes
        result
        _(original_auth.reload.attributes).must_equal original_attributes
      end

      context 'with a pipe in sourced_id' do
        # SourcedId is an arbitrary SIS-supplied string; a pipe is legal.
        # The component-validation matrix lives in AuthIdGeneratorTest; this
        # case stays because it pins the id format an auth option carries.
        let(:sourced_id) {'week|end_T-0005'}

        it 'builds the auth option' do
          _(result.authentication_id).must_equal "#{tenant_id}|#{sourced_id}"
        end
      end

      context 'when the v2 id cannot be built' do
        let(:sourced_id) {''}

        it 'returns nil' do
          _(result).must_be_nil
        end
      end
    end

    context 'when no classlink auth option exists with given v1 id' do
      let(:classlink_v1_id) {'non-existent-v1-id'}

      it 'returns nil' do
        _(result).must_be_nil
      end
    end

    context 'when v2 auth option already exists' do
      let(:user) {create(:student, :with_classlink_authentication_option)}
      let(:original_auth) do
        user.authentication_options.find_by(credential_type: AuthenticationOption::CLASSLINK)
      end
      let(:classlink_v1_id) {original_auth.authentication_id}

      before do
        create(
          :authentication_option,
          credential_type: AuthenticationOption::CLASSLINK,
          authentication_id: "#{tenant_id}|#{sourced_id}"
        )
      end

      it 'returns nil' do
        _(result).must_be_nil
      end
    end

    context 'when a v2 auth option exists whose id differs only by case' do
      let(:user) {create(:student, :with_classlink_authentication_option)}
      let(:original_auth) do
        user.authentication_options.find_by(credential_type: AuthenticationOption::CLASSLINK)
      end
      let(:classlink_v1_id) {original_auth.authentication_id}
      let(:sourced_id) {'5678_t5678-0005'}

      before do
        create(
          :authentication_option,
          credential_type: AuthenticationOption::CLASSLINK,
          authentication_id: "#{tenant_id}|#{sourced_id.upcase}"
        )
      end

      # The idempotency check must compare byte-exactly: ids are case-sensitive
      # and the column collation is not, so a case-twin's record must not block
      # this user's v2 option from being built.
      it 'still builds the auth option' do
        _(result.authentication_id).must_equal "#{tenant_id}|#{sourced_id}"
      end
    end
  end
end
