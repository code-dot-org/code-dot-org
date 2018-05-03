require 'test_helper'
require 'cdo/delete_accounts_helper'

#
# This test is the comprehensive spec on the desired behavior when purging a
# user from our system (that is, hard-deleting a user).  If you need to change
# the user purge process, start by testing the desired behavior here, then work
# your way down to the appropriate implementation point.
#
# Purging a user is an irreversible operation.  We don't delete every row that
# has ever been associated with that user, but we do remove all sensitive
# information, anything that might possibly be used to identify the particular
# user, and anything we don't need to keep around for our metrics.
#
# Getting this right is important for compliance with various privacy
# regulations around the globe, so changes to this behavior should be carefully
# reviewed by the product team.
#
class DeleteAccountsHelperTest < ActionView::TestCase
  test 'clears user.name' do
    user = create :student

    refute_nil user.name

    purge_user user

    user.reload
    assert_nil user.name
  end

  test 'anonymizes user.username' do
    user = create :student

    refute_nil user.username
    refute_match /^sys_deleted_\w{8}$/, user.username

    purge_user user

    user.reload
    assert_match /^sys_deleted_\w{8}$/, user.username
  end

  test 'clears user.*_sign_in_ip' do
    user = create :student
    user.current_sign_in_ip = '192.168.0.1'
    user.last_sign_in_ip = '10.0.0.1'
    user.save

    user.reload
    refute_nil user.current_sign_in_ip
    refute_nil user.last_sign_in_ip

    purge_user user

    user.reload
    assert_nil user.current_sign_in_ip
    assert_nil user.last_sign_in_ip
  end

  test 'clears user email fields' do
    user = create :teacher
    user.parent_email = 'fake-parent-email@example.com'
    user.save

    user.reload
    refute_nil user.email
    refute_nil user.hashed_email
    refute_nil user.parent_email

    purge_user user

    user.reload
    assert_empty user.email
    assert_empty user.hashed_email
    assert_nil user.parent_email
  end

  test 'clears password fields' do
    user = create :student
    user.reset_password_token = 'fake-reset-password-token'
    user.save

    user.reload
    refute_nil user.encrypted_password
    refute_nil user.reset_password_token
    refute_nil user.secret_picture
    refute_nil user.secret_words

    purge_user user

    user.reload
    assert_nil user.encrypted_password
    assert_nil user.reset_password_token
    assert_nil user.secret_picture
    assert_nil user.secret_words
  end

  test 'clears provider uid but not provider type' do
    user = create :student
    user.provider = 'clever'
    user.uid = 'fake-clever-uid'
    user.save

    user.reload
    assert_equal user.provider, 'clever'
    refute_nil user.uid

    purge_user user

    user.reload
    assert_equal user.provider, 'clever'
    assert_nil user.uid
  end

  private

  def purge_user(user)
    SolrHelper.stubs(:delete_document).once
    DeleteAccountsHelper.new(
      solr: nil,
      pegasus_db: PEGASUS_DB,
      pegasus_reporting_db: sequel_connect(
        CDO.pegasus_reporting_db_writer,
        CDO.pegasus_reporting_db_reader
      )
    ).purge_user(user)
  end
end
