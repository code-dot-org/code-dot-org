module MysqlConsoleHelper
  def self.options(db)
    opts = %W(
      --user=#{db.user}
      --host=#{db.host}
    )
    database = db.path[1..]
    opts << "--database=#{database}" if database
    opts << "--port=#{db.port}" if db.port
    # SECURITY: Password is NOT included here to avoid exposure in logs and process lists.
    # Previously, we added --password=#{db.password} which exposed credentials.
    # Now, below, we use a temporary option file with restricted permissions instead (see run method).
    opts.join(' ')
  end

  # Executes MySQL command via CLI. Uses shell instead of Ruby MySQL client because:
  # - Interactive CLI features (pager, formatting, history) are required for developer/admin use
  # - Used by bin/mysql-client-* scripts which are interactive tools
  # Execution environment: Developer workstations, console servers
  # Temp file risk:
  # - Low - when used on a non-web-serving server
  # - Medium if used on a public web-serving server as an exploit could observe ps, /tmp
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

    # SECURITY: Use a temporary option file instead of --password= to prevent
    # password from appearing in process lists, logs, or environment variables.
    # Previously, we passed --password=#{db.password} on the command line, which:
    # - Exposed passwords in build logs (system() logs the full command string)
    # - Made passwords visible via `ps aux` (any user can see process arguments)
    # - Triggered MySQL's warning: "Using a password on the command line interface can be insecure."
    # Using --defaults-extra-file with a temporary file (mode 600) is the secure approach
    # per MySQL documentation.  See INF-1962
    if db.password
      require 'tempfile'
      require 'fileutils'
      # Create temporary option file with restricted permissions
      option_file = Tempfile.new(['mysql', '.cnf'])
      # Set restrictive permissions BEFORE writing password (owner read/write only)
      FileUtils.chmod(0o600, option_file.path)
      option_file.write("[client]\n")
      option_file.write("password=#{db.password}\n")
      option_file.close
      mysql_command = "mysql --defaults-extra-file=#{option_file.path} #{options(db)}"
      mysql_command += " --execute=\"#{args}\"" unless args.empty?
      begin
        system(mysql_command)
      ensure
        # Always clean up the temporary file
        option_file.unlink
      end
    else
      system(mysql_command)
    end
  end
end
