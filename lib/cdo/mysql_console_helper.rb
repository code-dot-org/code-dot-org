module MysqlConsoleHelper
  def self.options(db)
    opts = %W(
      --user=#{db.user}
      --host=#{db.host}
    )
    database = db.path[1..]
    opts << "--database=#{database}" if database
    opts << "--port=#{db.port}" if db.port
    # Password is NOT included here to avoid exposure in logs.
    # Use MYSQL_PWD environment variable instead (see run method).
    opts.join(' ')
  end

  def self.run(db, args, warn: true)
    db = URI.parse(db) unless db.is_a?(URI)

    writer_warning = <<~STANDARD_OUTPUT
      **************************************************************************************
      *** Avoid connecting to the production database with WRITE PRIVILEGES. Safest are: ***
      *** bin/mysql-client-dashboard-reporting or bin/mysq-client-pegasus-reporting.     ***
      **************************************************************************************
    STANDARD_OUTPUT
    puts writer_warning if warn && (db.host == CDO.db_endpoint_writer) && rack_env?(:production)

    reporting_warning = <<~STANDARD_OUTPUT
      **************************************************************************************
      *** The safest way to execute read-only queries on the production database is with ***
      *** bin/mysql-client-dashboard-reporting or bin/mysq-client-pegasus-reporting.     ***
      **************************************************************************************
    STANDARD_OUTPUT
    puts reporting_warning if warn && (db.host != CDO.db_endpoint_proxy_reporting) && rack_env?(:production)

    mysql_command = "mysql #{options(db)}"
    mysql_command += " --execute=\"#{args}\"" unless args.empty?

    # Use MYSQL_PWD environment variable instead of --password= to prevent
    # password from appearing in process lists and logs.
    # This is the recommended approach for automated scripts per MySQL documentation.
    env = {}
    env['MYSQL_PWD'] = db.password if db.password

    system(env, mysql_command)
  end
end
