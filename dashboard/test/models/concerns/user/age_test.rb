require 'test_helper'

class AgeTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks
  describe '#under_13?' do
    let(:user) {create(:user, age: 10)}
    context 'when the user is under 13' do
      it 'returns true' do
        _(user.under_13?).must_equal true
      end
    end
    context 'when the user is 13' do
      before do
        user.age = 13
        user.save!
      end
      it 'returns false' do
        _(user.under_13?).must_equal false
      end
    end
    context 'when the user is over 13' do
      before do
        user.age = 14
        user.save!
      end
      it 'returns false' do
        _(user.under_13?).must_equal false
      end
    end
    context 'when the users age is nil' do
      before do
        user.update_attribute(:birthday, nil) # cheating...
      end
      it 'returns false' do
        reloaded_user = User.find(user.id)
        _(reloaded_user.birthday).must_be_nil
        _(reloaded_user.under_13?).must_equal true
      end
    end
  end
  describe '#over_21?' do
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
      it 'returns true' do
        _(user.over_21?).must_equal true
      end
    end
    context 'when the user is under 21' do
      before do
        user.age = 20
        user.save!
      end
      it 'returns false' do
        _(user.over_21?).must_equal false
      end
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
    let(:user) {create(:user, birthday: 10.years.ago)}
    context 'when the user is under 4' do
      before do
        user.update_attribute(:birthday, 3.years.ago)
      end
      it 'returns nil' do
        _(user.age).must_be_nil
      end
    end
    context 'when the user is 4' do
      before do
        user.update_attribute(:birthday, 4.years.ago)
      end
      it 'returns 4' do
        _(user.age).must_equal 4
      end
    end
    context 'when the user is over 21' do
      before do
        user.update_attribute(:birthday, 22.years.ago)
      end
      it 'returns "21+"' do
        _(user.age).must_equal '21+'
      end
    end
  end
  describe '#age=' do
    let(:user) {create(:user, birthday: 10.years.ago)}
    context 'when age is set to current age' do
      before do
        user.age = 10
      end
      it 'age remains unchainged' do
        _(user.age).must_equal 10
      end
    end
    context 'when age is set to 0' do
      before do
        user.age = 0
      end
      it 'age remains unchanged' do
        _(user.age).must_equal 10
      end
    end
    context 'when age is set to 200' do
      before do
        user.age = 200
      end
      it 'age remains unchanged' do
        _(user.age).must_equal 10
      end
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
