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

      context 'with an integer tenant_id' do
        let(:tenant_id) {2222}

        it 'normalizes to the same id as the string form' do
          _(result.authentication_id).must_equal "2222|#{sourced_id}"
        end
      end

      context 'with a pipe in sourced_id' do
        # SourcedId is an arbitrary SIS-supplied string; a pipe is legal.
        let(:sourced_id) {'week|end_T-0005'}

        it 'builds the auth option' do
          _(result.authentication_id).must_equal "#{tenant_id}|#{sourced_id}"
        end

        it 'round-trips through parse_authentication_id' do
          parsed = Services::Classlink::V2AuthOptionBuilder.parse_authentication_id(result.authentication_id)
          _(parsed).must_equal [tenant_id, sourced_id]
        end
      end

      context 'with a blank sourced_id' do
        let(:sourced_id) {''}

        it 'returns nil' do
          _(result).must_be_nil
        end
      end

      context 'with a nil sourced_id' do
        let(:sourced_id) {nil}

        it 'returns nil' do
          _(result).must_be_nil
        end
      end

      context 'with a blank tenant_id' do
        let(:tenant_id) {''}

        it 'returns nil' do
          _(result).must_be_nil
        end
      end

      context 'with a pipe in tenant_id' do
        let(:tenant_id) {'22|22'}

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
  end

  describe '.version_for' do
    it 'returns v2 for a pipe-joined id' do
      _(Services::Classlink::V2AuthOptionBuilder.version_for('2222|5678_T5678-0005')).
        must_equal AuthenticationOption::Classlink::VERSION[:v2]
    end

    it 'returns nil for a legacy UserId' do
      _(Services::Classlink::V2AuthOptionBuilder.version_for('59777133')).must_be_nil
      _(Services::Classlink::V2AuthOptionBuilder.version_for(59_777_133)).must_be_nil
    end
  end

  describe '.parse_authentication_id' do
    it 'splits on the first pipe only' do
      _(Services::Classlink::V2AuthOptionBuilder.parse_authentication_id('2222|a|b')).
        must_equal ['2222', 'a|b']
    end
  end
end
