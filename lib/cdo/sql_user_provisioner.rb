module Cdo
  # Provisions the non-root `writer` and `reader` application MySQL users for non-AWS systems (continuous integration
  # builds, local development environments, k8s, etc.), mirroring what the Custom::SQLUser CloudFormation Lambda
  # (aws/cloudformation/lambdas/sql-user/index.js) provisions against the Aurora cluster in AWS environments.
  module SqlUserProvisioner
    # Privileges granted to each application user.
    #
    # KEEP THESE PERMISSIONS IN SYNC with CloudFormation `aws/cloudformation/components/database.yml.erb`.
    PRIVILEGES = {
      writer: [
        'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'REFERENCES', 'INDEX', 'ALTER',
        'CREATE TEMPORARY TABLES', 'LOCK TABLES', 'EXECUTE', 'CREATE VIEW', 'SHOW VIEW',
        'CREATE ROUTINE', 'ALTER ROUTINE', 'EVENT', 'TRIGGER'
      ].freeze,
      reader: ['SELECT'].freeze,
    }.freeze

    # Grant on `dashboard%`.* and `pegasus%`.* only (never *.*, which would expose
    # the internal `mysql` schema). The wildcard covers the numbered test
    # databases (dashboard_test1, dashboard_test2, ...) used for parallel CI.
    GRANT_DATABASES = %w[dashboard pegasus].freeze

    # Match the Lambda: users may connect from any host.
    CLIENT_HOST = '%'.freeze

    # The ordered SQL statements that create/update one user and grant its
    # privileges, mirroring the Lambda. The block escapes a string for use inside
    # SQL single quotes (e.g. Mysql2::Client#escape) and must not add the
    # surrounding quotes.
    def self.statements_for(name:, password:, privileges:, host: CLIENT_HOST, databases: GRANT_DATABASES)
      quoted_password = "'#{yield(password.to_s)}'"
      [
        "CREATE USER IF NOT EXISTS '#{name}'@'#{host}' " \
          "IDENTIFIED WITH mysql_native_password BY #{quoted_password}",
        # Keep the password in sync on re-provision, matching the Lambda.
        "ALTER USER '#{name}'@'#{host}' " \
          "IDENTIFIED WITH mysql_native_password BY #{quoted_password}",
        *databases.map do |database|
          "GRANT #{privileges.join(',')} ON `#{database}%`.* TO `#{name}`@`#{host}`"
        end,
      ]
    end

    # Provision each user in `users` (an array of {role:, username:, password:,
    # privileges:}) using `admin_client`, anything responding to #query and
    # #escape such as a Mysql2::Client. Idempotent, like the Lambda: only ever
    # GRANTs, never REVOKEs.
    #
    # A user whose username equals `admin_username` is skipped rather than
    # stripped down to these privileges, so pointing a credential at the admin
    # login (e.g. config not yet updated to a non-root user) is a no-op instead of
    # locking out the superuser. Returns {provisioned: [username, ...], skipped:
    # [username, ...]}.
    def self.provision!(admin_client:, admin_username:, users:)
      result = {provisioned: [], skipped: []}
      users.each do |user|
        if user[:username] == admin_username
          result[:skipped] << user[:username]
          next
        end
        statements_for(
          name: user[:username],
          password: user[:password],
          privileges: user[:privileges]
        ) {|value| admin_client.escape(value)}.each {|statement| admin_client.query(statement)}
        result[:provisioned] << user[:username]
      end
      result
    end

    # The full flow the `db:provision_sql_users` rake task runs: read the current
    # db_* connection settings, connect to the cluster writer as the admin user,
    # and provision the writer and reader users. Returns the provision! result.
    #
    # This is the only method that touches CDO and the mysql2 driver; the methods
    # above stay database- and configuration-free so they can be unit tested.
    def self.provision_from_config!
      require 'mysql2'

      admin_credential = CDO.db_credential_admin
      admin_client = Mysql2::Client.new(
        host: CDO.db_endpoint_writer,
        port: CDO.db_endpoint_writer_port,
        username: admin_credential['username'],
        password: admin_credential['password']
      )

      users = {writer: CDO.db_credential_writer, reader: CDO.db_credential_reader}.map do |role, credential|
        {
          role: role,
          username: credential['username'],
          password: credential['password'],
          privileges: PRIVILEGES.fetch(role),
        }
      end

      begin
        provision!(admin_client: admin_client, admin_username: admin_credential['username'], users: users)
      ensure
        admin_client.close
      end
    end
  end
end
