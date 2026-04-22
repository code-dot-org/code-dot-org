require_relative './rake_utils'
require_relative '../../deployment'
require 'cdo/chat_client'

module TestRunUtils
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
    opts = MysqlConsoleHelper.options(writer)
    mysqldump_opts = "mysqldump #{opts} --skip-comments --set-gtid-purged=OFF"

    if seed_data
      File.write(seed_file, seed_data)
    else
      # Generate new DB contents
      ENV['TEST_ENV_NUMBER'] = '1'
      RakeUtils.rake_stream_output 'db:create db:test:prepare'
      ENV.delete 'TEST_ENV_NUMBER'
      # Store new DB contents
      `#{mysqldump_opts} #{database}1 | sed '#{auto_inc}' > #{seed_file.path}`

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

    cloned_data = `#{mysqldump_opts} #{database}2 | sed '#{auto_inc}'`
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
      databases.each do |db|
        recreate_db = "DROP DATABASE IF EXISTS #{db}; CREATE DATABASE IF NOT EXISTS #{db};"
        RakeUtils.system_stream_output "echo '#{recreate_db}' | mysql #{opts}"
      end
      pipes = databases.map {|db| ">(mysql #{opts} #{db})"}.join(' ')
      RakeUtils.system_stream_output "/bin/bash -c 'tee <#{seed_file.path} #{pipes} >/dev/null'"
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
