require 'test_helper'

class NameableTest < ActiveSupport::TestCase
  describe 'presence validations' do
    it 'allows a user with a name' do
      user = build(:user, name: panda_panda)
      _(user).must_be :valid?
      _(user.errors[:name]).must_be :empty?
    end

    it 'does not allow a user without a name' do
      user = build(:user, name: nil)
      _(user).wont_be :valid?
      _(user.errors[:name]).must_include I18n.t('activerecord.errors.messages.blank')
    end

    context 'when purged_at is set' do
      let(:user) {build :user, name: nil, purged_at: Time.now}
      it 'allows a user without a name' do
        _(user).must_be :valid?
        _(user.errors[:name]).must_be :empty?
      end
    end
  end

  describe 'length validations' do
    context 'when name is exactly 1 character' do
      subject(:user) {build(:user, name: 'A')}
      it {_user.must_be :valid?}
    end

    context 'when name is exactly 70 characters' do
      subject(:user) {build(:user, name: 'A' * 70)}
      it {_user.must_be :valid?}
    end

    context 'when name is 71 characters' do
      subject(:user) {build(:user, name: 'A' * 71)}
      it 'is invalid' do
        _user.wont_be :valid?
        _(user.errors[:name]).must_include 'is too long (maximum is 70 characters)'
      end
    end
  end

  describe 'strip_display_given_family_names callback' do
    subject(:user) {create :teacher, name: '  First  ', given_name: '   Given   ', family_name: ' Last '}
    it 'strips whitespace from name, given_name, and family_name if changed' do
      _(user.name).must_equal 'First'
      _(user.given_name).must_equal 'Given'
      _(user.family_name).must_equal 'Last'
    end

    context 'on update' do
      let(:user) {create :student}

      it 'strips whitespace when name is updated' do
        user.update(name: '  UpdatedFirst  ')
        user.reload
        _(user.name).must_equal 'UpdatedFirst'
      end

      it 'strips whitespace when given_name is updated' do
        user.update(given_name: '  UpdatedGiven  ')
        user.reload
        _(user.given_name).must_equal 'UpdatedGiven'
      end

      it 'strips whitespace when family_name is updated' do
        user.update(family_name: '  UpdatedLast  ')
        user.reload
        _(user.family_name).must_equal 'UpdatedLast'
      end
    end
  end

  describe 'creating a user with the same name as a deleted user' do
    before do
      create :user, :deleted, name: 'Same Name'
    end

    it 'is valid with the same name as a deleted user' do
      user = build(:user, name: 'Same Name')
      _(user).must_be :valid?
    end
  end

  describe '#sort_by_family_name?' do
    it 'returns true when sort_by_family_name is set' do
      user = build :user, sort_by_family_name: true
      _(user.sort_by_family_name?).must_equal true
    end

    it 'returns false when sort_by_family_name is nil' do
      user = build :user, sort_by_family_name: nil
      _(user.sort_by_family_name?).must_equal false
    end
  end

  describe '#short_name' do
    it {_(build(:user, name: 'Laurel Fan').short_name).must_equal 'Laurel'} # first name last name
    it {_(build(:user, name: 'Winnie the Pooh').short_name).must_equal 'Winnie'} # middle name
    it {_(build(:user, name: "D'Andre Means").short_name).must_equal "D'Andre"} # punctuation ok
    it {_(build(:user, name: '樊瑞').short_name).must_equal '樊瑞'} # ok, this isn't actually right but ok for now
    it {_(build(:user, name: 'Laurel').short_name).must_equal 'Laurel'} # just one name
    it {_(build(:user, name: '  some whitespace in front  ').short_name).must_equal 'some'} # whitespace in front
  end

  describe '#initial' do
    it {_(build(:user, name: 'Laurel Fan').initial).must_equal 'L'} # first name last name
    it {_(build(:user, name: 'Winnie the Pooh').initial).must_equal 'W'} # middle name
    it {_(build(:user, name: "D'Andre Means").initial).must_equal 'D'} # punctuation ok
    it {_(build(:user, name: '樊瑞').initial).must_equal '樊'} # ok, this isn't actually right but ok for now
    it {_(build(:user, name: 'Laurel').initial).must_equal 'L'} # just one name
    it {_(build(:user, name: '  some whitespace in front  ').initial).must_equal 'S'} # whitespace in front
  end

  describe '#second_name' do
    it {_(build(:user, name: 'Laurel Fan').second_name).must_equal 'Fan'} # first name last name
    it {_(build(:user, name: 'Winnie the Pooh').second_name).must_equal 'the'} # middle name
    it {_(build(:user, name: "D'Andre Means").second_name).must_equal "Means"} # punctuation ok
    it {_(build(:user, name: '樊瑞').second_name).must_equal nil} # ok, this isn't actually right but ok for now
    it {_(build(:user, name: 'Laurel').second_name).must_equal nil} # just one name
    it {_(build(:user, name: '  some whitespace in front  ').second_name).must_equal 'whitespace'} # whitespace in front
  end
end
