require 'test_helper'

class ProviderFlagsTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks
  describe '#sponsored?' do
    context 'when provider is migrated with no authentication options' do
      let(:student) {create(:student_in_picture_section)}
      before do
        student.migrate_to_multi_auth
        student.reload
      end
      it 'returns true' do
        _(student.authentication_options.empty?).must_equal true
        _(student.sponsored?).must_equal true
      end
    end
    context 'when provider is migrated with an authentication option' do
      let(:user) {create(:user, :with_google_authentication_option)}
      it 'returns false' do
        _(user.authentication_options.count).must_be :>, 0
        _(user.sponsored?).must_equal false
      end
    end
    context 'when student is in a picture section' do
      let(:student) {create(:student_in_picture_section)}
      it 'returns true' do
        _(student.sponsored?).must_equal true
      end
    end
    context 'when student is in a word section' do
      let(:student) {create(:student_in_word_section)}
      it 'returns true' do
        _(student.sponsored?).must_equal true
      end
    end
  end
  describe '#migrated?' do
    context 'when provider is migrated' do
      let(:user) {create(:user)}
      it 'returns true' do
        _(user.migrated?).must_equal true
      end
    end
    context 'when provider is not migrated' do
      let(:user) {create(:user, :demigrated)}
      it 'returns false' do
        _(user.migrated?).must_equal false
      end
    end
  end
  describe '#manual' do
    context 'when a provider is manual' do
      let(:user) {create(:user, :demigrated)}
      before do
        user.provider = User::PROVIDER_MANUAL
        user.save!
      end
      it 'returns true' do
        _(user.manual?).must_equal true
      end
    end
    context 'when provider is not manual' do
      let(:user) {create(:user)}
      it 'returns false' do
        _(user.manual?).must_equal false
      end
    end
  end
end
