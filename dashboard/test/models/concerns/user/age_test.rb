require 'test_helper'

class AgeTest < ActiveSupport::TestCase
  describe 'validations' do
    context 'when the user is not sponsored' do
      let(:user) {create(:user, age: 10)}
      it 'validates age presence on create' do
        _(user).must_be :valid?
      end
    end
    context 'when the user has a google_oauth2 provider' do
      let(:user) {create(:user, :google_sso_provider, age: nil)}
      it 'does not validate age presence on create' do
        _(user).must_be :valid?
      end
    end
    context 'when the user has a clever provider' do
      let(:user) {create(:user, :clever_sso_provider, age: nil)}
      it 'does not validate age presence on create' do
        _(user).must_be :valid?
      end
    end
    context 'when the user has a sponsored provider' do
      let(:user) {create(:student, :sponsored, age: nil)}
      it 'does not validate age presence on create' do
        _(user).must_be :valid?
      end
    end
    context 'when the user has an LTI provider' do
      let(:user) {create(:user, :with_lti_auth, age: nil)}
      it 'does not validate age presence on create' do
        _(user).must_be :valid?
      end
    end
    context 'when age is not included in the dropdown options' do
      let(:user) {build(:user, age: 1)}
      it 'is not valid' do
        _(user).wont_be :valid?
        _(user.errors[:age]).must_include 'is required'
      end
    end
    context 'when updating an existing user' do
      let(:user) {create(:user, age: 10)}
      before do
        user.age = nil
        user.save!
      end
      it 'does not require age on update' do
        _(user).must_be :valid?
      end
    end
  end
  describe '#under_13?' do
    subject(:under_13?) {user.under_13?}
    let(:user) {create(:user, age: 10)}
    context 'when the user is under 13' do
      it {_under_13?.must_equal true}
    end
    context 'when the user is 13' do
      before do
        user.age = 13
        user.save!
      end
      it {_under_13?.must_equal false}
    end
    context 'when the user is over 13' do
      before do
        user.age = 14
        user.save!
      end
      it {_under_13?.must_equal false}
    end
    context 'when the users age is nil' do
      before do
        user.update_attribute(:birthday, nil) # cheating...
      end
      it 'returns true' do
        reloaded_user = User.find(user.id)
        _(reloaded_user.birthday).must_be_nil
        _(reloaded_user.under_13?).must_equal true
      end
    end
  end
  describe '#over_21?' do
    subject(:over_21?) {user.over_21?}
    let(:user) {create(:user, age: 22)}
    context 'when the user is over 21' do
      it 'returns true' do
        _(user.over_21?).must_equal true
      end
    end
    context 'when the user is 21' do
      before do
        user.age = 21
        user.save!
      end
      it {_over_21?.must_equal true}
    end
    context 'when the user is under 21' do
      before do
        user.age = 20
        user.save!
      end
      it {_over_21?.must_equal false}
    end
    context 'when the users age is nil' do
      before do
        user.update_attribute(:birthday, nil) # cheating...
      end
      it 'returns false' do
        reloaded_user = User.find(user.id)
        _(reloaded_user.birthday).must_be_nil
        _(reloaded_user.over_21?).must_equal false
      end
    end
  end
  describe '#age' do
    subject(:age) {user.age}
    let(:user) {create(:user, birthday: 10.years.ago)}
    context 'when the user is under 4' do
      before do
        user.update_attribute(:birthday, 3.years.ago)
      end
      it {_age.must_be_nil}
    end
    context 'when the user is 4' do
      before do
        user.update_attribute(:birthday, 4.years.ago)
      end
      it {_age.must_equal 4}
    end
    context 'when the user is over 21' do
      before do
        user.update_attribute(:birthday, 22.years.ago)
      end
      it {_age.must_equal '21+'}
    end
  end
  describe '#age=' do
    subject(:age) {user.age}
    let(:user) {create(:user, birthday: 10.years.ago)}
    context 'when age is set to current age it remains unchanged' do
      before do
        user.age = 10
      end
      it {_age.must_equal 10}
    end
    context 'when age is set to 0 it remains unchanged' do
      before do
        user.age = 0
      end
      it {_age.must_equal 10}
    end
    context 'when age is set to 200 it remains unchanged' do
      before do
        user.age = 200
      end
      it {_age.must_equal 10}
    end
    context 'when the user is 4' do
      before do
        user.age = 4
      end
      it 'sets the birthday to 4 years ago' do
        _(user.birthday).must_equal 4.years.ago.to_date
      end
    end
    context 'when the user is over 21' do
      before do
        user.age = 22
      end
      it 'sets the birthday to 22 years ago' do
        _(user.birthday).must_equal 22.years.ago.to_date
      end
    end
  end
end
