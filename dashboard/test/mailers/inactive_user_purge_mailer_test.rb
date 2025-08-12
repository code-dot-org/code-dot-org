require 'test_helper'

class InactiveUserPurgeMailerTest < ActionMailer::TestCase
  let(:teacher) {create :teacher}

  describe '#teacher_inactivity_soft_delete_warning_email' do
    subject(:mail) {described_class.teacher_inactivity_soft_delete_warning_email(teacher)}
    let(:body) {mail.body.encoded}
    it 'has correct subject' do
      _(mail.subject).must_equal I18n.t('inactive_user_purge_mailer.teacher_soft_delete_warning_subject')
    end

    it 'is sent to the teacher’s email address' do
      _(mail.to.first).must_equal teacher.email
    end

    it 'has correct sender address' do
      _(mail[:from].decoded).must_equal '"Code.org" <noreply@code.org>'
      _(mail.from).must_equal ['noreply@code.org']
    end

    it 'has correct reply address' do
      _(mail.reply_to).must_equal ['support@code.org']
      _(mail[:reply_to].decoded).must_equal '"Code.org" <support@code.org>'
    end

    it 'includes inactivity notice and instructions in body' do
      _(body).must_include 'Your account is scheduled for deletion in 30 days due to 3 years of inactivity'
      _(body).must_include 'How to keep your account:'
    end
  end
end
