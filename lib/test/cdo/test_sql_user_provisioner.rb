require_relative '../test_helper'
require 'cdo/sql_user_provisioner'

class SqlUserProvisionerTest < Minitest::Test
  # Records the statements it is asked to run so provision! can be tested without
  # a live database. #escape mimics Mysql2::Client#escape closely enough to prove
  # the password is escaped (doubling single quotes is sufficient for the test).
  class FakeClient
    attr_reader :queries

    def initialize
      @queries = []
    end

    def escape(value)
      # Block form avoids gsub treating "\\'" in a replacement string as the
      # post-match backreference; returns a literal backslash before the quote.
      value.gsub("'") {"\\'"}
    end

    def query(statement)
      @queries << statement
    end
  end

  def test_reader_is_select_only
    assert_equal ['SELECT'], Cdo::SqlUserProvisioner::PRIVILEGES.fetch(:reader)
  end

  def test_reader_privileges_are_a_subset_of_writer
    reader = Cdo::SqlUserProvisioner::PRIVILEGES.fetch(:reader)
    writer = Cdo::SqlUserProvisioner::PRIVILEGES.fetch(:writer)
    assert_empty reader - writer, 'reader must not hold any privilege the writer lacks'
  end

  def test_privilege_lists_are_well_formed
    Cdo::SqlUserProvisioner::PRIVILEGES.each do |role, list|
      refute_empty list, "#{role} privileges must not be empty"
      assert_equal list, list.uniq, "#{role} privileges must not contain duplicates"
      list.each do |privilege|
        assert_match(/\A[A-Z]+( [A-Z]+)*\z/, privilege, "unexpected privilege token: #{privilege.inspect}")
      end
    end
  end

  def test_statements_for_mirror_the_lambda
    statements = Cdo::SqlUserProvisioner.statements_for(
      name: 'reader',
      password: 'pw',
      privileges: ['SELECT']
    ) {|value| value}

    assert_equal(
      [
        "CREATE USER IF NOT EXISTS 'reader'@'%' IDENTIFIED WITH mysql_native_password BY 'pw'",
        "ALTER USER 'reader'@'%' IDENTIFIED WITH mysql_native_password BY 'pw'",
        'GRANT SELECT ON `dashboard%`.* TO `reader`@`%`',
        'GRANT SELECT ON `pegasus%`.* TO `reader`@`%`',
      ],
      statements
    )
  end

  def test_statements_for_grant_never_targets_all_schemas
    statements = Cdo::SqlUserProvisioner.statements_for(
      name: 'writer',
      password: 'pw',
      privileges: %w[SELECT INSERT]
    ) {|value| value}

    grants = statements.grep(/\AGRANT/)
    assert_equal 2, grants.length
    grants.each do |grant|
      # Scoped to `dashboard%`/`pegasus%`, never `*.*`, so the internal `mysql`
      # schema stays off-limits.
      refute_includes grant, 'ON *.*'
      assert_match(/ON `(dashboard|pegasus)%`\.\*/, grant)
    end
  end

  def test_statements_for_escapes_the_password
    statements = Cdo::SqlUserProvisioner.statements_for(
      name: 'reader',
      password: "pw's",
      privileges: ['SELECT']
    ) {|value| FakeClient.new.escape(value)}

    assert_includes statements.first, %q{BY 'pw\'s'}
  end

  def test_provision_runs_each_users_statements
    client = FakeClient.new
    users = [
      {role: :writer, username: 'writer', password: 'w', privileges: %w[SELECT INSERT]},
      {role: :reader, username: 'reader', password: 'r', privileges: ['SELECT']},
    ]

    result = Cdo::SqlUserProvisioner.provision!(
      admin_client: client, admin_username: 'root', users: users
    )

    assert_equal({provisioned: %w[writer reader], skipped: []}, result)
    # 2 users * (CREATE + ALTER + 2 GRANTs) = 8 statements.
    assert_equal 8, client.queries.length
    assert_includes client.queries, 'GRANT SELECT,INSERT ON `dashboard%`.* TO `writer`@`%`'
    assert_includes client.queries, 'GRANT SELECT ON `pegasus%`.* TO `reader`@`%`'
  end

  def test_an_aurora_cluster_id_identifies_a_cloudformation_provisioned_deployment
    ['adhoc-my-branch-cluster', 'autoscale-prod-cluster'].each do |cluster_id|
      CDO.stubs(:db_cluster_id).returns(cluster_id)
      assert Cdo::SqlUserProvisioner.aurora_cluster?, "expected #{cluster_id.inspect} to name an Aurora cluster"
    end
  end

  def test_no_cluster_id_identifies_a_community_mysql_deployment
    [Cdo::SqlUserProvisioner::NO_DB_CLUSTER, nil, ''].each do |cluster_id|
      CDO.stubs(:db_cluster_id).returns(cluster_id)
      refute Cdo::SqlUserProvisioner.aurora_cluster?, "expected #{cluster_id.inspect} to name no Aurora cluster"
    end
  end

  def test_provision_from_config_does_nothing_on_an_aurora_cluster
    # Returning before opening a client is what keeps an app server in a CloudFormation Stack from re-provisioning
    # users the Custom::SQLUser Resources own, and from needing an admin credential production does not give it.
    CDO.stubs(:db_cluster_id).returns('autoscale-prod-cluster')

    assert_nil Cdo::SqlUserProvisioner.provision_from_config!
  end

  def test_provision_from_config_raises_where_it_is_responsible_but_has_no_admin_credential
    CDO.stubs(:db_cluster_id).returns(Cdo::SqlUserProvisioner::NO_DB_CLUSTER)

    [nil, '', {}, {'username' => ''}].each do |credential|
      CDO.stubs(:db_credential_admin).returns(credential)
      exception = assert_raises(RuntimeError) {Cdo::SqlUserProvisioner.provision_from_config!}
      assert_match 'db_credential_admin', exception.message
    end
  end

  def test_provision_skips_a_user_that_matches_the_admin
    client = FakeClient.new
    users = [
      {role: :writer, username: 'root', password: '', privileges: %w[SELECT INSERT]},
      {role: :reader, username: 'reader', password: 'r', privileges: ['SELECT']},
    ]

    result = Cdo::SqlUserProvisioner.provision!(
      admin_client: client, admin_username: 'root', users: users
    )

    assert_equal({provisioned: ['reader'], skipped: ['root']}, result)
    # Only the reader's 4 statements should have run; the admin is never touched.
    assert_equal 4, client.queries.length
    refute(client.queries.any? {|statement| statement.include?("'root'")})
  end
end
