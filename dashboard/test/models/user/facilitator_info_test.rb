require 'test_helper'

class User::FacilitatorInfoTest < ActiveSupport::TestCase
  describe 'validations' do
    subject(:user_facilitator_info) {build(:user_facilitator_info, user: user, bio: bio)}

    let(:user) {create(:facilitator)}
    let(:bio) {Faker::Lorem.paragraph_by_chars(number: User::FacilitatorInfo::BIO_MAX_LENGTH)}

    let(:error_messages) {user_facilitator_info.errors.full_messages}

    before do
      ProfanityFilter.stubs(:find_potential_profanity)
    end

    it 'is valid' do
      _user_facilitator_info.must_be :valid?
    end

    context 'when associated user has no facilitator permission' do
      before do
        user.delete_permission(UserPermission::FACILITATOR)
      end

      it 'contains user permission error' do
        _(user).wont_be :facilitator?
        _user_facilitator_info.wont_be :valid?
        _(error_messages).must_equal ['User must have the facilitator permission']
      end
    end

    context 'when bio is too short' do
      let(:bio) {Faker::Lorem.paragraph.truncate(User::FacilitatorInfo::BIO_MIN_LENGTH.pred)}

      it 'contains bio too short error' do
        _user_facilitator_info.wont_be :valid?
        _(error_messages).must_equal [
          "Biography is too short (minimum is #{User::FacilitatorInfo::BIO_MIN_LENGTH} characters)"
        ]
      end
    end

    context 'when bio is too long' do
      let(:bio) {Faker::Lorem.paragraph_by_chars(number: User::FacilitatorInfo::BIO_MAX_LENGTH.next)}

      it 'contains bio too long error' do
        _user_facilitator_info.wont_be :valid?
        _(error_messages).must_equal [
          "Biography is too long (maximum is #{User::FacilitatorInfo::BIO_MAX_LENGTH} characters)"
        ]
      end
    end

    context 'when bio has profanity' do
      let(:profanity) {'profanity'}

      let!(:locale) {I18n.locale = 'uk-UA'}

      before do
        ProfanityFilter.stubs(:find_potential_profanity).with(bio, locale).returns(profanity)
      end

      it 'contains bio profanity error' do
        _user_facilitator_info.wont_be :valid?
        _(error_messages).must_equal ['Biography contains profanity']
      end

      context 'when bio is blank' do
        let(:bio) {''}

        it 'does not validate bio for profanity' do
          _user_facilitator_info.must_be :valid?
          _(error_messages).wont_include 'Biography contains profanity'
        end
      end

      context 'when has other errors' do
        let(:other_error) {'some other error'}

        before do
          # Prevents the error from being cleared during validation
          user_facilitator_info.errors.stubs(:clear)
          user_facilitator_info.errors.add(:base, other_error)
        end

        it 'does not validate bio for profanity' do
          ProfanityFilter.expects(:find_potential_profanity).never
          _user_facilitator_info.wont_be :valid?
          _(error_messages).must_equal [other_error]
        end
      end
    end
  end
end
