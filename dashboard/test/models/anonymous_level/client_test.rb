require 'test_helper'

class AnonymousLevel::ClientTest < ActiveSupport::TestCase
  let(:anon_user_id) {Cdo::AnonUserId.generate}

  describe 'validations' do
    it 'is valid with anonymous user ID and name' do
      _(build(:anonymous_level_client)).must_be :valid?
    end

    it 'requires anonymous user ID' do
      client = build(:anonymous_level_client, anon_user_id: nil)

      _(client).wont_be :valid?
      _(client.errors[:anon_user_id]).must_include 'is required'
    end

    it 'requires anonymous user ID to be UUID v4' do
      client = build(:anonymous_level_client, anon_user_id: 'invalid')

      _(client).wont_be :valid?
      _(client.errors[:anon_user_id]).must_include 'is invalid'
    end

    context 'when anonymous user ID already exists' do
      let(:duplicate) {build(:anonymous_level_client, anon_user_id:)}

      before do
        create(:anonymous_level_client, anon_user_id:)
      end

      it 'requires unique anonymous user ID' do
        _(duplicate).wont_be :valid?
        _(duplicate.errors[:anon_user_id]).must_include 'has already been taken'
      end
    end

    it 'requires name' do
      client = build(:anonymous_level_client, name: nil)

      _(client).wont_be :valid?
      _(client.errors[:name]).must_include 'is required'
    end
  end
end
