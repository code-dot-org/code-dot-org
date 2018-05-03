require 'test_helper'
require 'cdo/delete_accounts_helper'

class DeleteAccountsHelperTest < ActionView::TestCase
  def setup
    SolrHelper.stubs(:delete_document).once
  end

  test 'removes user.name' do
    user = create :student

    refute_nil user.name

    test_configured_helper.purge_user(user)

    user.reload
    assert_nil user.name
  end

  test 'anonymizes user.username' do
    user = create :student

    refute_nil user.username
    refute_match /^sys_deleted_\w{8}$/, user.username

    test_configured_helper.purge_user(user)

    user.reload
    assert_match /^sys_deleted_\w{8}$/, user.username
  end

  private

  def test_configured_helper
    DeleteAccountsHelper.new(
      solr: nil,
      pegasus_db: PEGASUS_DB,
      pegasus_reporting_db: sequel_connect(
        CDO.pegasus_reporting_db_writer,
        CDO.pegasus_reporting_db_reader
      )
    )
  end
end
