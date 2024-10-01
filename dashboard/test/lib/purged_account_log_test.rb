require 'test_helper'
require 'purged_account_log'

class PurgedAccountLogTest < ActiveSupport::TestCase
  test 'records reason for account purge' do
    log_obj = PurgedAccountLog.new create(:user),
      reason: PurgedAccountLog::SOFT_DELETE_28_DAYS_AGO
    log = JSON.parse log_obj.to_json
    assert_equal PurgedAccountLog::SOFT_DELETE_28_DAYS_AGO, log["reason"]

    log_obj = PurgedAccountLog.new create(:user),
      reason: PurgedAccountLog::REQUESTED_BY_USER
    log = JSON.parse log_obj.to_json
    assert_equal PurgedAccountLog::REQUESTED_BY_USER, log["reason"]
  end

  test 'raises ArgumentError when given invalid reason' do
    assert_raises ArgumentError do
      PurgedAccountLog.new create(:user)
    end
    assert_raises ArgumentError do
      PurgedAccountLog.new create(:user),
        reason: 'Some other reason'
    end
  end

  test 'records user id' do
    user = create :student
    log_obj = PurgedAccountLog.new user,
      reason: PurgedAccountLog::SOFT_DELETE_28_DAYS_AGO
    log = JSON.parse log_obj.to_json
    assert_equal user.id, log["user_id"]
  end

  test 'records hashed email' do
    user = create :student
    refute_nil user.hashed_email
    log_obj = PurgedAccountLog.new user,
      reason: PurgedAccountLog::SOFT_DELETE_28_DAYS_AGO
    log = JSON.parse log_obj.to_json
    assert_equal user.hashed_email, log["hashed_email"]
  end

  test 'does not record hashed email if delete was requested manually' do
    user = create :student
    refute_nil user.hashed_email
    log_obj = PurgedAccountLog.new user,
      reason: PurgedAccountLog::REQUESTED_BY_USER
    log = JSON.parse log_obj.to_json
    assert_nil log["hashed_email"]
  end

  # TODO: Multi-auth handle multiple hashed emails

  test 'records Pardot ids' do
    log_obj = PurgedAccountLog.new create(:teacher),
      reason: PurgedAccountLog::SOFT_DELETE_28_DAYS_AGO
    log_obj.pardot_ids = [1, 2, 3]
    log = JSON.parse log_obj.to_json
    assert_equal [1, 2, 3], log["pardot_ids"]
  end

  test 'records Poste ids' do
    log_obj = PurgedAccountLog.new create(:teacher),
      reason: PurgedAccountLog::SOFT_DELETE_28_DAYS_AGO
    log_obj.poste_contact_ids = [1, 2, 3]
    log = JSON.parse log_obj.to_json
    assert_equal [1, 2, 3], log["poste_contact_ids"]
  end

  test 'records purged_at date' do
    log_obj = PurgedAccountLog.new create(:teacher),
      reason: PurgedAccountLog::SOFT_DELETE_28_DAYS_AGO
    purge_time = Time.now
    log_obj.purged_at = purge_time
    log = JSON.parse log_obj.to_json
    assert_equal purge_time.to_s, Time.parse(log["purged_at"]).to_s
  end

  test 'records confirmed_at date' do
    log_obj = PurgedAccountLog.new create(:teacher),
      reason: PurgedAccountLog::SOFT_DELETE_28_DAYS_AGO
    confirm_time = Time.now
    log_obj.confirmed_at = confirm_time
    log = JSON.parse log_obj.to_json
    assert_equal confirm_time.to_s, Time.parse(log["confirmed_at"]).to_s
  end

  test 'uploads to S3 under dated folder' do
    teacher = create :teacher
    purge_time = Time.parse '2018-08-08'

    log_obj = PurgedAccountLog.new teacher,
      reason: PurgedAccountLog::SOFT_DELETE_28_DAYS_AGO
    log_obj.purged_at = purge_time

    class StubUploader
      def initialize(_bucket = '', _prefix = '')
      end

      def upload_log(_name, _body)
      end
    end

    stub_uploader = StubUploader.new
    AWS::S3::LogUploader.
      expects(:new).
      with('cdo-audit-logs', "purged-users/test/2018-08-08").
      returns(stub_uploader)

    stub_uploader.
      expects(:upload_log).
      with(teacher.id.to_s, log_obj.to_json)

    log_obj.upload
  end

  test 'refuses to upload if purged_at is not set' do
    teacher = create :teacher

    log_obj = PurgedAccountLog.new teacher,
      reason: PurgedAccountLog::SOFT_DELETE_28_DAYS_AGO
    AWS::S3::LogUploader.expects(:new).never

    assert_raises RuntimeError do
      log_obj.upload
    end
  end
end
