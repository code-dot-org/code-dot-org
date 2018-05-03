require 'test_helper'
require 'cdo/delete_accounts_helper'

class DeleteAccountsHelperTest < ActionView::TestCase
  def setup
    SolrHelper.stubs(:delete_document).once
  end

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

  private

  def purge_user(user)
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
