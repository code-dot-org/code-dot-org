require 'test_helper'

class AnonymousLevel::GeoTest < ActiveSupport::TestCase
  let(:described_class) {AnonymousLevel::Geo}
  let(:anon_user_id) {Cdo::AnonUserId.generate}

  describe 'validations' do
    it 'requires an anonymous user ID' do
      geo = build(:anonymous_level_geo, anon_user_id: nil)

      _(geo).wont_be :valid?
      _(geo.errors[:anon_user_id]).must_include 'is required'
    end

    it 'requires the anonymous user ID to be UUID v4' do
      geo = build(:anonymous_level_geo, anon_user_id: 'invalid')

      _(geo).wont_be :valid?
      _(geo.errors[:anon_user_id]).must_include 'is invalid'
    end

    context 'when the anonymous user ID already exists' do
      let(:duplicate) {build(:anonymous_level_geo, anon_user_id:)}

      before do
        create(:anonymous_level_geo, anon_user_id:)
      end

      it 'requires unique anonymous user ID' do
        _(duplicate).wont_be :valid?
        _(duplicate.errors[:anon_user_id]).must_include 'has already been taken'
      end
    end
  end
end
