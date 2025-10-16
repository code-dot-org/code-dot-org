require 'test_helper'

class User::EmailPreferencesTest < ActiveSupport::TestCase
  describe 'validations' do
    context 'when user is a teacher' do
      let(:teacher) {build(:user, email: 'teacher@example.com', user_type: 'teacher')}
      before do
        teacher.email_preference_opt_in = 'yes'
      end

      it 'must validate presence of email_preference_request_ip' do
        teacher.valid?
        _(teacher.errors[:email_preference_request_ip]).wont_be_empty
      end

      it 'must validate presence of email_preference_source' do
        teacher.valid?
        _(teacher.errors[:email_preference_source]).wont_be_empty
      end

      it 'must validate presence of email_preference_form_kind' do
        teacher.valid?
        _(teacher.errors[:email_preference_form_kind]).wont_be_empty
      end
    end

    context 'when user is a student' do
      let(:student) {build(:user, user_type: 'student', parent_email_preference_opt_in_required: '1')}

      before do
        student.parent_email_preference_opt_in = 'yes'
      end

      it 'must validate presence of parent_email_preference_email' do
        student.valid?
        _(student.errors[:parent_email_preference_email]).wont_be_empty
      end

      it 'must validate presence of parent_email_preference_request_ip' do
        student.valid?
        _(student.errors[:parent_email_preference_request_ip]).wont_be_empty
      end

      it 'must validate presence of parent_email_preference_source' do
        student.valid?
        _(student.errors[:parent_email_preference_source]).wont_be_empty
      end
    end
  end

  describe '#save_email_preference' do
    subject(:save_email_preference) {user.save_email_preference}

    let(:user) {User.new(email: 'teacher@example.com', user_type: 'teacher')}
    before do
      user.email_preference_opt_in = 'yes'
      user.email_preference_request_ip = '127.0.0.1'
      user.email_preference_source = 'ACCOUNT_EMAIL_CHANGE'
      user.email_preference_form_kind = 1
    end

    it 'saves email preference for teacher' do
      _ {save_email_preference}.must_change 'EmailPreference.count', +1

      pref = EmailPreference.find_by(email: user.email)
      _(pref).wont_be_nil
      _(pref.opt_in).must_equal true
    end
  end

  describe '#save_parent_email_preference' do
    subject(:save_parent_email_preference) {student.save_parent_email_preference}

    let(:student) {create(:student)}
    before do
      student.parent_email = 'parent@example.com'
      student.parent_email_preference_opt_in = 'no'
      student.parent_email_preference_request_ip = '127.0.0.2'
      student.parent_email_preference_source = 'PARENT_EMAIL_CHANGE'
    end

    it 'saves email preference for parent' do
      _ {save_parent_email_preference}.must_change 'EmailPreference.count', +1

      pref = EmailPreference.find_by(email: student.parent_email)
      _(pref).wont_be_nil
      _(pref.opt_in).must_equal false
    end
  end

  describe '#save_email_reg_partner_preference' do
    subject(:save_email_reg_partner_preference) {user.save_email_reg_partner_preference}

    let(:user) {create(:teacher)}
    before do
      user.email = 'partner-optin@example.com'
      user.save!
    end

    it 'sets share_teacher_email_regional_partner_opt_in timestamp' do
      # Assign accessor just before the method call
      user.share_teacher_email_reg_partner_opt_in_radio_choice = 'yes'

      save_email_reg_partner_preference
      user.reload

      _(user.share_teacher_email_regional_partner_opt_in).wont_be_nil
    end
  end

  describe '#parent_email_preference_setup' do
    subject(:parent_email_preference_setup) {student.parent_email_preference_setup}

    let(:student) {create(:student)}
    before do
      student.parent_email_preference_email = 'setup@example.com'
    end

    it 'sets parent_email from parent_email_preference_email' do
      parent_email_preference_setup
      _(student.parent_email).must_equal 'setup@example.com'
    end
  end

  describe '#parent_email_update_only?' do
    subject(:parent_email_update_only?) {student.parent_email_update_only?}

    let(:student) {create(:student)}
    it 'returns true when parent_email_update_only is 1 and user is student' do
      student.parent_email_update_only = '1'
      _parent_email_update_only?.must_equal true
    end

    it 'returns false when parent_email_update_only is not 1' do
      student.parent_email_update_only = '0'
      _parent_email_update_only?.must_equal false
    end
  end

  describe '#parent_email_preference_opt_in_required?' do
    subject(:parent_email_preference_opt_in_required?) {student.parent_email_preference_opt_in_required?}

    let(:student) {create(:student)}
    it 'returns true when checkbox is 1 and user is student' do
      student.parent_email_preference_opt_in_required = '1'
      _parent_email_preference_opt_in_required?.must_equal true
    end

    it 'returns false otherwise' do
      student.parent_email_preference_opt_in_required = '0'
      _parent_email_preference_opt_in_required?.must_equal false
    end
  end
end
