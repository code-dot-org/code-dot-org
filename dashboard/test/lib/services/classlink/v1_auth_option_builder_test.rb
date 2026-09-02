require 'test_helper'

class Services::Classlink::V1AuthOptionBuilderTest < ActiveSupport::TestCase
  describe '.call' do
    let(:result) do
      Services::Classlink::V1AuthOptionBuilder.call(
        classlink_v2_id: classlink_v2_id,
        classlink_user_id: classlink_user_id
      )
    end

    let(:classlink_user_id) {'59777133'}

    context 'when a v2 auth option exists with the given id' do
      let(:user) {create(:student)}
      let(:classlink_v2_id) {'2222|T5678-0005'}
      let(:original_auth) do
        create(
          :authentication_option,
          user: user,
          credential_type: AuthenticationOption::CLASSLINK,
          authentication_id: classlink_v2_id,
          version: AuthenticationOption::Classlink::VERSION[:v2],
          data: {oauth_token: 'some-classlink-token'}.to_json
        )
      end

      before do
        original_auth
      end

      it 'returns a new auth option carrying the classlink UserId' do
        _(result.authentication_id).must_equal '59777133'
      end

      it 'leaves version nil, marking the v1 format' do
        _(result.version).must_be_nil
      end

      it 'preserves credential type as classlink' do
        _(result.credential_type).must_equal AuthenticationOption::CLASSLINK
      end

      it 'belongs to the same user' do
        _(result.user_id).must_equal user.id
      end

      it 'preserves original email' do
        _(result.email).must_equal original_auth.email
      end

      it 'preserves original data' do
        _(result.data).must_equal original_auth.data
      end

      it 'does not persist the new auth option' do
        _(result.id).must_be_nil
      end

      it 'leaves the v2 auth option untouched' do
        original_attributes = original_auth.attributes
        result
        _(original_auth.reload.attributes).must_equal original_attributes
      end

      context 'with an integer classlink_user_id' do
        let(:classlink_user_id) {59_777_133}

        it 'normalizes to the string form' do
          _(result.authentication_id).must_equal '59777133'
        end
      end

      context 'when a v1 auth option already exists' do
        before do
          create(
            :authentication_option,
            user: user,
            credential_type: AuthenticationOption::CLASSLINK,
            authentication_id: classlink_user_id
          )
        end

        it 'returns nil' do
          _(result).must_be_nil
        end
      end

      context 'when another account holds the v1 id' do
        before do
          create(
            :authentication_option,
            user: create(:student),
            credential_type: AuthenticationOption::CLASSLINK,
            authentication_id: classlink_user_id
          )
        end

        # ClassLink's UserId is globally unique, so this means a duplicate account
        # exists. Dismissing it as "nothing to do" would discard the only trace of
        # that, so the builder hands back a record the caller cannot save and reports.
        it 'returns a record rather than nil' do
          refute_nil result
        end

        it 'returns a record that fails to save' do
          refute result.save
        end
      end

      context 'when a v1 auth option exists whose id differs only by case' do
        let(:classlink_user_id) {'u59777133a'}

        before do
          create(
            :authentication_option,
            credential_type: AuthenticationOption::CLASSLINK,
            authentication_id: classlink_user_id.upcase
          )
        end

        # The existence check must compare byte-exactly. Under the column's
        # case-insensitive collation a case-twin's record would look like this
        # account's own, leaving it permanently without a v1 record.
        it 'still builds the auth option' do
          _(result.authentication_id).must_equal classlink_user_id
        end
      end

      context 'with a blank classlink_user_id' do
        let(:classlink_user_id) {''}

        it 'returns nil' do
          _(result).must_be_nil
        end
      end

      context 'with a nil classlink_user_id' do
        let(:classlink_user_id) {nil}

        it 'returns nil' do
          _(result).must_be_nil
        end
      end
    end

    context 'when no v2 auth option exists with the given id' do
      let(:classlink_v2_id) {'2222|does-not-exist'}

      it 'returns nil' do
        _(result).must_be_nil
      end
    end
  end
end
