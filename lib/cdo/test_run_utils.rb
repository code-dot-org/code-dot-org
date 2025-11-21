require_relative './rake_utils'
require_relative '../../deployment'
require 'cdo/chat_client'

module TestRunUtils
  # Creates a temporary MySQL option file with restricted permissions if a password is provided.
  # Returns the --defaults-extra-file argument and the option file object.
  # The caller is responsible for cleaning up the temp file (use ensure block).
  def self.create_mysql_option_file(db)
    db = URI.parse(db) unless db.is_a?(URI)

    if db.password
      require 'tempfile'
      require 'fileutils'
      option_file = Tempfile.new(['mysql', '.cnf'])
      option_file.write("[client]\n")
      option_file.write("password=#{db.password}\n")
      option_file.close
      FileUtils.chmod(0o600, option_file.path)
      ["--defaults-extra-file=#{option_file.path} ", option_file]
    else
      ['', nil]
    end
  end

  # Executes mysqldump via CLI. Uses shell instead of Ruby MySQL client because:
  # - No Ruby equivalent - mysqldump is CLI-only tool
  # Execution environment: CI containers (Drone), test servers
  # Temp file risk: High - same user runs multiple CI processes, can enumerate `/tmp` and read each other's temp files
  # Not susceptible to temp directory sniffing from other users (mode 600 protects), but same-user processes can access
  def self.mysqldump_secure(db, database, additional_opts = '')
    db = URI.parse(db) unless db.is_a?(URI)
    opts = MysqlConsoleHelper.options(db)
    mysql_opt_arg, option_file = create_mysql_option_file(db)

    begin
      command = "#{mysql_opt_arg}mysqldump #{opts} --skip-comments --set-gtid-purged=OFF #{additional_opts} #{database}".strip
      yield command
    ensure
      # Always clean up the temporary file, even if the command fails
      option_file&.unlink
    end
  end

  # Executes mysql via CLI. Uses shell instead of Ruby MySQL client because:
  # - Used in shell pipes (e.g., `tee <file >(cmd1) >(cmd2)`) which require shell syntax
  # - Simpler to reuse same pattern as mysqldump_secure
  # Execution environment: CI containers (Drone), test servers
  # Temp file risk: High - same user runs multiple CI processes, can enumerate `/tmp` and read each other's temp files
  # Not susceptible to temp directory sniffing from other users (mode 600 protects), but same-user processes can access
  def self.mysql_secure(db, command_template)
    db = URI.parse(db) unless db.is_a?(URI)
    mysql_opt_arg, option_file = create_mysql_option_file(db)

    begin
      # Insert --defaults-extra-file right after 'mysql' in the command
      command = command_template.sub(/mysql /, "#{mysql_opt_arg}mysql ")
      yield command
    ensure
      # Always clean up the temporary file, even if the command fails
      option_file&.unlink
    end
  end

  # Returns the mysql command prefix (with --defaults-extra-file if password exists) for use in shell command construction.
  # The returned option_file must be kept in scope and cleaned up by the caller.
  # Use mysqldump_secure or mysql_secure instead if possible, as they handle cleanup automatically.
  def self.mysql_opt_file_arg(db)
    db = URI.parse(db) unless db.is_a?(URI)
    mysql_opt_arg, option_file = create_mysql_option_file(db)
    [mysql_opt_arg, option_file]
  end

  def self.run_apps_tests
    Dir.chdir(apps_dir) do
      ChatClient.wrap('apps tests') do
        RakeUtils.system_stream_output 'DEV=1 npm run test'
      end
    end
  end

  def self.run_local_ui_test
    feature_path = File.expand_path(ENV.fetch('feature', nil))
    Dir.chdir(dashboard_dir('test/ui/')) do
      RakeUtils.system "./runner.rb --verbose --pegasus=localhost.code.org:3000 --dashboard=localhost-studio.code.org:3000 --local --headed --feature=#{feature_path}"
    end
  end

  def self.run_blockly_core_tests
    Dir.chdir(blockly_core_dir) do
      ChatClient.wrap('blockly core tests') do
        RakeUtils.system './test.sh'
      end
    end
  end

  # Setup method to prepare test databases for parallel dashboard tests,
  # which can be called from the QA pass (on the chef-managed test system) or CI (Drone).
  def self.setup_dashboard_tests_parallel(upload_seed_data: false)
    # Parallel tests don't seem to run more quickly over 16 processes.
    ENV['PARALLEL_TEST_PROCESSORS'] = '16' if RakeUtils.nproc > 16

    # Hash of all seed-data and -config content
    #
    # Data:
    # - All fixture files
    # - CSV data (only videos right now, may want to add more; cdo-languages.csv particularly)
    #
    # Config:
    # - schema.rb
    # - seed.rake
    fixture_path = "#{dashboard_dir}/test/fixtures/"
    fixture_hash = Digest::MD5.hexdigest(
      Dir["#{fixture_path}/{**,*}/*.yml"].
        push(dashboard_dir('db/schema.rb')).
        push(dashboard_dir('config/videos.csv')).
        push("#{fixture_path}/schools.tsv").
        push(dashboard_dir('lib/tasks/seed.rake')).
        select {|filename| File.file?(filename)}.
        sort.
        map {|filename| Digest::MD5.file(filename)}.
        join
    )
    CDO.log.info "Fixture hash: #{fixture_hash}"

    # Try to fetch seed data from S3
    bucket_name = 'cdo-build-package'
    s3_key = "test_db/#{fixture_hash}.gz"
    s3_client = Aws::S3::Client.new
    require 'zlib'
    require 'stringio'

    seed_data = begin
      response = s3_client.get_object(bucket: bucket_name, key: s3_key)
      Zlib::GzipReader.new(response.body).read
    rescue Aws::Errors::MissingCredentialsError, Aws::S3::Errors::ServiceError
      CDO.log.info "Seed data not found on S3 at #{s3_key}"
      nil
    end

    seed_file = Tempfile.new(['db_seed', '.sql'])
    auto_inc = 's/ AUTO_INCREMENT=[0-9]*\b//'
    writer = URI.parse(CDO.dashboard_db_writer || 'mysql://root@localhost/dashboard_test')
    database = writer.path[1..]
    writer.path = ''

    if seed_data
      File.write(seed_file, seed_data)
    else
      # Generate new DB contents
      ENV['TEST_ENV_NUMBER'] = '1'
      RakeUtils.rake_stream_output 'db:create db:test:prepare'
      ENV.delete 'TEST_ENV_NUMBER'
      # Store new DB contents
      # SECURITY: mysqldump_secure handles temp file creation/cleanup to avoid password exposure
      mysqldump_secure(writer, "#{database}1") do |mysqldump_cmd|
        `#{mysqldump_cmd} | sed '#{auto_inc}' > #{seed_file.path}`
      end

      if upload_seed_data
        gzip_data = Zlib::GzipWriter.wrap(StringIO.new) {|gz| IO.copy_stream(seed_file.path, gz); gz.finish}.tap(&:rewind)

        s3_client.put_object(
          bucket: bucket_name,
          key: s3_key,
          body: gzip_data,
          acl: 'public-read'
        )
        CDO.log.info "Uploaded seed data to #{s3_key}"
      else
        CDO.log.info 'Not uploading seed data to S3'
      end
    end

    # SECURITY: mysqldump_secure handles temp file creation/cleanup to avoid password exposure
    cloned_data = mysqldump_secure(writer, "#{database}2") do |mysqldump_cmd|
      `#{mysqldump_cmd} | sed '#{auto_inc}'`
    end

    if seed_data.equal?(cloned_data)
      CDO.log.info 'Test data not modified'
    else
      seed_2_file = Tempfile.new(['db_seed', '.sql'])
      File.write(seed_2_file, cloned_data)

      # Clone single DB across all databases
      require 'parallel_tests'
      procs = ParallelTests.determine_number_of_processes(nil)
      CDO.log.info "Test data modified, cloning across #{procs} databases..."
      databases = (2..procs).map {|i| "#{database}#{i}"}
      # For the pipes command, we need to keep the option file alive for the entire command.
      # Uses shell instead of Ruby MySQL client because shell pipe syntax `>(cmd1) >(cmd2)` requires CLI.
      # Execution environment: CI containers (Drone), test servers
      # Temp file risk: High - same user runs multiple CI processes, can enumerate `/tmp` and read each other's temp files
      # SECURITY: Create option file once and reuse for all mysql commands in the pipes
      mysql_opt_arg, option_file = mysql_opt_file_arg(writer)
      opts = MysqlConsoleHelper.options(writer)
      begin
        # Uses shell instead of Ruby MySQL client (Sequel) because:
        # - Same execution context as pipes command below (which requires shell syntax)
        # - Simpler to reuse same temp file pattern
        # - Could use Sequel, but would require separate connection handling
        databases.each do |db|
          recreate_db = "DROP DATABASE IF EXISTS #{db}; CREATE DATABASE IF NOT EXISTS #{db};"
          RakeUtils.system_stream_output "echo '#{recreate_db}' | #{mysql_opt_arg}mysql #{opts}"
        end
        pipes = databases.map {|db| ">(#{mysql_opt_arg}mysql #{opts} #{db})"}.join(' ')
        RakeUtils.system_stream_output "/bin/bash -c 'tee <#{seed_file.path} #{pipes} >/dev/null'"
      ensure
        # Always clean up the temporary file, even if commands fail
        option_file&.unlink
      end
    end
  end

  def self.run_dashboard_tests(parallel: false, upload_seed_data: false)
    Dir.chdir(dashboard_dir) do
      ChatClient.wrap('dashboard tests') do
        if parallel
          ENV['PARALLEL_TEST_FIRST_IS_1'] = '1'
          TestRunUtils.setup_dashboard_tests_parallel(upload_seed_data: upload_seed_data)
          RakeUtils.rake_stream_output 'parallel:test'
        else
          RakeUtils.system_stream_output "RAILS_ENV=#{rack_env}", "RACK_ENV=#{rack_env}", 'bundle', 'exec', 'rails', 'test'
        end
      end
    end
  end

  def self.run_dashboard_legacy_tests
    Dir.chdir(dashboard_legacy_dir) do
      ChatClient.wrap('dashboard legacy tests') do
        RakeUtils.rake_stream_output 'test'
      end
    end
  end

  def self.run_dashboard_cdo_contentful_engine_tests
    Dir.chdir(dashboard_engines_dir('cdo_contentful')) do
      ChatClient.wrap('dashboard cdo_contentful engine tests') do
        RakeUtils.rake_stream_output 'test', env: {'BUNDLE_GEMFILE' => dashboard_dir('Gemfile')}
      end
    end
  end

  def self.run_dashboard_hoc_legacy_engine_tests
    Dir.chdir(dashboard_dir) do
      ChatClient.wrap('dashboard hoc_legacy engine tests') do
        RakeUtils.system_stream_output "RAILS_ENV=#{rack_env}", "RACK_ENV=#{rack_env}", 'bundle', 'exec', 'rails', 'test', dashboard_engines_dir('hoc_legacy', 'test')
      end
    end
  end

  def self.run_pegasus_tests
    Dir.chdir(pegasus_dir) do
      ChatClient.wrap('pegasus tests') do
        # Make sure the pegasus database is created before running pegasus
        # tests. This might be pegasus_test (on development machines) or
        # pegasus_unittest (during ci on the test machine).
        #
        # This does not enforce that all migrations have been applied.
        # Strangely, during our CI process, this is taken care of by the
        # prepare_dbs step in shared/rake/test.rake which works because shared
        # tests run before pegasus tests.
        with_rack_env(:test) do
          RakeUtils.rake_stream_output 'db:ensure_created'
        end
        RakeUtils.rake_stream_output 'test'
      end
    end
  end

  def self.run_shared_tests
    Dir.chdir(shared_dir) do
      ChatClient.wrap('shared tests') do
        RakeUtils.rake_stream_output 'test'
      end
    end
  end

  def self.run_lib_tests
    Dir.chdir(lib_dir) do
      ChatClient.wrap('lib tests') do
        RakeUtils.rake_stream_output 'test'
      end
    end
  end

  def self.run_python_tests
    ChatClient.wrap('python tests') do
      # Run pytest on every sub-dir in python/ that has a pyproject.toml
      Dir.glob('python/**/pyproject.toml').map {|file| File.dirname(file)}.each do |dir|
        PythonVenv.pytest dir
      end
    end
  end

  def self.run_bin_tests
    Dir.chdir(bin_dir) do
      ChatClient.wrap('bin tests') do
        RakeUtils.rake_stream_output 'test'
      end
    end
  end

  def self.run_frontend_tests
    Dir.chdir(frontend_dir) do
      ChatClient.wrap('frontend tests') do
        # Only run frontend tests that are relevant to `code-dot-org/apps`
        RakeUtils.system_stream_output 'yarn test --filter @code-dot-org/component-library'
      end
    end
  end
end
