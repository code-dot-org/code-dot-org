require_relative '../test_helper'
require 'cdo/database_proxy'

class DatabaseProxyTest < Minitest::Test
  # `db_proxy_admin` stands in for ProxySQL being installed, which is what `selected` reconciles the configured
  # proxy against.
  def stub_config(db_proxy:, proxysql_installed: false, web_application: false)
    CDO.stubs(:db_proxy).returns(db_proxy)
    CDO.stubs(:db_proxy_admin).returns(proxysql_installed ? 'mysql://admin:not-a-secret@127.0.0.1:6032/' : nil)
    CDO.stubs(:running_web_application?).returns(web_application)
  end

  def test_proxysql_is_reconciled_against_what_is_installed
    stub_config(db_proxy: 'proxysql', proxysql_installed: true)
    assert_equal Cdo::DatabaseProxy::PROXYSQL, Cdo::DatabaseProxy.selected

    # The daemon is configured for ProxySQL along with the rest of the deployment but never runs the recipe.
    stub_config(db_proxy: 'proxysql', proxysql_installed: false)
    assert_equal Cdo::DatabaseProxy::NONE, Cdo::DatabaseProxy.selected
  end

  def test_an_unset_proxy_preserves_what_this_deployment_already_connects_through
    stub_config(db_proxy: '', proxysql_installed: true)
    assert_equal Cdo::DatabaseProxy::PROXYSQL, Cdo::DatabaseProxy.selected

    stub_config(db_proxy: nil, proxysql_installed: false)
    assert_equal Cdo::DatabaseProxy::NONE, Cdo::DatabaseProxy.selected
  end

  # Reads and writes answer alike, so a worker or shell script never holds a pool open behind the proxy.
  def test_only_the_web_application_connects_through_rds_proxy
    stub_config(db_proxy: 'rdsproxy', web_application: true)
    assert Cdo::DatabaseProxy.rds_proxy_for_writes?
    assert Cdo::DatabaseProxy.rds_proxy_for_reads?

    stub_config(db_proxy: 'rdsproxy', web_application: false)
    refute Cdo::DatabaseProxy.rds_proxy_for_writes?
    refute Cdo::DatabaseProxy.rds_proxy_for_reads?
  end

  def test_no_process_reaches_rds_proxy_under_another_setting
    [['proxysql', true], ['proxysql', false], ['none', false], ['', false]].each do |db_proxy, proxysql_installed|
      stub_config(db_proxy: db_proxy, proxysql_installed: proxysql_installed, web_application: true)
      refute Cdo::DatabaseProxy.rds_proxy_for_writes?, "#{db_proxy.inspect} must not route writes through RDS Proxy"
      refute Cdo::DatabaseProxy.rds_proxy_for_reads?, "#{db_proxy.inspect} must not route reads through RDS Proxy"
    end
  end
end
