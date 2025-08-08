require 'os'
require 'open-uri'
require 'pathname'
require 'cdo/aws/s3'
require 'cdo/chat_client'
require 'digest'
require 'parallel'
require 'cdo/python_venv'

module RakeUtils
  def self.system__(command)
    CDO.log.info command unless ENV['QUIET']
    system_status_output__ "#{command} 2>&1"
  end

  def self.system_status_output__(command)
    output = `#{command}`
    status = $?.exitstatus
    [status, output]
  end

  def self.command_(*args)
    # BUGBUG: Should escape for shell here and verify no callers do that.
    args.map(&:to_s).join(' ')
  end

  def self.start_service(id)
    sudo 'systemctl', 'start', id.to_s if OS.linux? && CDO.chef_managed
  end

  def self.stop_service(id)
    sudo 'systemctl', 'stop', id.to_s if OS.linux? && CDO.chef_managed
  end

  def self.restart_service(id)
    return unless OS.linux? && CDO.chef_managed
    sudo 'systemctl', 'daemon-reload'
    sudo 'systemctl', 'restart', id.to_s
  end

  def self.system_(*args)
    status, _ = system__(command_(*args))
    status
  end

  def self.system_with_chat_logging(*args)
    command = command_(*args)
    ChatClient.log "#{ENV.fetch('USER', nil)}@#{CDO.rack_env}:#{Dir.pwd}$ #{command}"
    system_ command
  end

  def self.system(*args)
    return system_stream_output(*args) if ENV['RAKE_VERBOSE']

    command = command_(*args)
    status, output = system__ command
    unless status == 0
      error = RuntimeError.new("'#{command}' returned #{status}")
      raise error, error.message, CDO.filter_backtrace([output])
    end
    status
  end

  # Alternate version of RakeUtils.rake which always streams $stdout to the shell
  # during execution.
  def self.rake_stream_output(*args, &block)
    system_stream_output "RAILS_ENV=#{rack_env}", "RACK_ENV=#{rack_env}", 'bundle', 'exec', 'rake', *args, &block
  end

  # Alternate version of RakeUtils.system which always streams $stdout to the
  # shell during execution.
  def self.system_stream_output(*args, &block)
    command = command_(*args)
    CDO.log.info command
    if block
      IO.popen(command, &block)
    else
      Kernel.system(command)
    end
    unless $?.success?
      error = RuntimeError.new("'#{command}' returned #{$?.exitstatus}")
      raise error, error.message
    end
    0
  end

  def self.exec_in_background(command)
    puts "Running `#{command}` in background"
    fork do
      exec command
    end
  end

  # Changes the Bundler environment to the specified directory for the specified block.
  # Runs bundle_install ensuring dependencies are up to date.
  def self.with_bundle_dir(dir)
    # Using `with_clean_env` is recommended when shelling out to a different bundle (ref:
    # http://bundler.io/man/bundle-exec.1.html#Shelling-out), but `with_clean_env` is
    # deprecated in favor of `with_unbundled_env` (ref:
    # https://bundler.io/v2.1/whats_new.html#helper-deprecations) so use that instead.
    Bundler.with_unbundled_env do
      ENV['AWS_DEFAULT_REGION'] ||= CDO.aws_region
      Dir.chdir(dir) do
        bundle_install
        yield
      end
    end
  end

  def self.bundle_exec(*args)
    system "RAILS_ENV=#{rack_env}", "RACK_ENV=#{rack_env}", 'bundle', 'exec', *args
  end

  def self.nproc
    count = ENV['PARALLEL_TEST_PROCESSORS'] ||
      (File.executable?('/usr/bin/nproc') && `/usr/bin/nproc`) ||
      Parallel.processor_count
    count.to_i
  end

  def self.bundle_install(*args)
    without = CDO.rack_envs - [CDO.rack_env]
    run_bundle_command('config set --local without', *without)
    run_bundle_command('install --quiet --jobs', nproc, *args)
  end

  def self.run_bundle_command(*args)
    if CDO.bundler_use_sudo
      sudo('bundle', *args)
    else
      system('bundle', *args)
    end
  end

  def self.python_venv_install
    PythonVenv.install
  end

  def self.git_add(*args)
    system 'git', 'add', *args
  end

  def self.git_branch
    `git branch | grep \\* | cut -f 2 -d \\ `.strip
  end

  def self.git_commit(message)
    `git commit -m \"#{message}\"`.strip
  end

  def self.git_fetch
    system 'git', 'fetch'
  end

  def self.git_pull
    system 'git', 'pull', '--ff-only', 'origin', git_branch
  end

  def self.git_push
    system 'git', 'push', 'origin', git_branch
  end

  def self.git_revision
    `git rev-parse HEAD`.strip
  end

  def self.git_latest_stash
    `git stash list --date=local`.lines.first.strip
  end

  def self.git_update_count
    count = `git rev-list ..@{u} | wc -l`.strip.to_i
    return 0 if $?.exitstatus != 0
    count
  end

  def self.git_updates_available?
    `git remote show origin 2>&1 | grep \"local out of date\" | grep --extended-regexp \"#{git_branch} +pushes to #{git_branch}\" | wc -l`.strip.to_i > 0
  end

  def self.git_staged_changes?(*paths)
    `git status --porcelain #{paths.join(' ')} 2>/dev/null | egrep \"^\s*(M|A|D)\" | wc -l`.strip.to_i > 0
  end

  # Gets a stable hash of the given paths' git-committed files.
  # Uses a hash of the `git ls-tree` contents because a shallow-clone may not have the
  # full revision history needed to find the original commit SHA.
  def self.git_folder_hash(*paths)
    Digest::SHA2.hexdigest(`git ls-tree -r HEAD #{paths.join(' ')} 2>/dev/null`)
  end

  def self.ln_s(source, target)
    current = File.symlink?(target) ? File.readlink(target) : nil
    unless source == current
      system 'rm', '-f', target if current || File.file?(target)
      system 'ln', '-s', source, target
    end
  end

  def self.glob_matches_file_path?(glob, file_path)
    File.fnmatch?(glob, file_path, File::FNM_PATHNAME | File::FNM_DOTMATCH)
  end

  # Updates list of global npm packages if outdated
  def self.npm_update_g(*args)
    output = `npm outdated --global --parseable --long --depth=0 #{args.join ' '}`.strip
    RakeUtils.sudo 'npm', 'update', '--quiet', '-g', *args unless output.empty?
  end

  def self.run_packages_with(command, *args)
    commands = []

    commands << 'PKG_CONFIG_PATH=/usr/X11/lib/pkgconfig' if OS.mac?
    commands << command
    commands += args

    RakeUtils.system(*commands)
  end

  def self.npm_install(*args)
    run_packages_with('npm install', ENV.fetch('CI', nil) && '--frozen-lockfile', *args)
  end

  def self.yarn_install(*args)
    run_packages_with('yarn', ENV.fetch('CI', nil) && '--frozen-lockfile', *args)
  end

  def self.npm_rebuild(*args)
    run_packages_with('npm rebuild', *args)
  end

  # Installs list of global npm packages if not already installed
  def self.npm_install_g(*args)
    output = `npm list --global --parseable --long --depth=0 #{args.join ' '}`.strip
    RakeUtils.sudo 'npm', 'install', '--quiet', '-g', *args if output.empty?
  end

  def self.install_npm
    # Temporary workaround to play nice with nvm-managed npm installation.
    # See discussion of a better approach at https://github.com/code-dot-org/code-dot-org/pull/4946
    return if RakeUtils.system_('which npm') == 0

    if OS.linux?
      RakeUtils.system 'sudo apt-get install -y nodejs npm'
      RakeUtils.system 'sudo ln -s -f /usr/bin/nodejs /usr/bin/node'
      RakeUtils.system 'sudo npm install -g npm@2.9.1'
      RakeUtils.npm_install_g 'grunt-cli'
      RakeUtils.npm_install_g 'yarn'
    elsif OS.mac?
      RakeUtils.system 'brew install node'
      RakeUtils.system 'npm', 'update', '-g', 'npm'
      RakeUtils.system 'npm', 'install', '-g', 'grunt-cli'
      RakeUtils.system 'npm', 'install', '-g', 'yarn'
    end
  end

  def self.rake(*args)
    bundle_exec 'rake', *args
  end

  def self.sudo(*args)
    system 'sudo', *args
  end

  def self.sudo_ln_s(source, target)
    current = File.symlink?(target) ? File.readlink(target) : nil
    unless source == current
      sudo 'rm', '-f', target if current || File.file?(target)
      sudo 'ln', '-s', source, target
    end
  end

  # Uploads local file to S3, leaving a .fetch file pointing to it at the given path, and removes original file
  def self.replace_file_with_s3_backed_fetch_file(local_file, destination_local_path, params = {})
    new_fetchable_url = upload_file_to_s3_bucket_and_create_fetch_file(local_file, destination_local_path, params)
    FileUtils.remove_file(local_file)
    new_fetchable_url
  end

  # Uploads local file to S3, leaving a corresponding .fetch file pointing to the remote copy
  def self.upload_file_to_s3_bucket_and_create_fetch_file(local_file, destination_local_path, params = {})
    raise 'Need to specify bucket' unless params[:bucket]

    s3_filename = AWS::S3.upload_to_bucket(params[:bucket], File.basename(local_file), File.open(local_file), acl: 'public-read')
    new_fetchable_url = AWS::S3.public_url(params[:bucket], s3_filename)

    destination_local_pathname = Pathname(destination_local_path)
    FileUtils.mkdir_p(File.dirname(destination_local_pathname))
    File.write(destination_local_pathname, new_fetchable_url)
    new_fetchable_url
  end

  # Whether this is a local or adhoc environment where we should install npm and create
  # a local database.
  def self.local_environment?
    (rack_env?(:development, :test) && !CDO.chef_managed) || rack_env?(:adhoc)
  end

  # Wait for 3 minutes by default
  def self.wait_for_url(url, tries: 36, sleep_secs: 5)
    Retryable.retryable(tries: tries, sleep: sleep_secs) do
      Net::HTTP.get(URI(url))
    end
  end

  def self.format_duration(total_seconds)
    total_seconds = total_seconds.to_i
    minutes = (total_seconds / 60).to_i
    seconds = total_seconds - (minutes * 60)
    format("%.1d:%.2d minutes", minutes, seconds)
  end

  # Captures all stdout and stderr within a block, including subprocesses:
  # - redirect $stdout and $stderr streams to a pipe
  # - have a background thread read from the pipe
  # - store data in a StringIO
  # - execute the block
  # - revert streams to original pipes and return output
  def self.capture(&block)
    old_stdout = $stdout.clone
    old_stderr = $stderr.clone
    pipe_r, pipe_w = IO.pipe
    pipe_r.sync = true
    output = StringIO.new('', 'w')
    reader = Thread.new do
      loop do
        output << pipe_r.readpartial(1024)
      end
    rescue EOFError
      # Do nothing.
    end
    $stdout.reopen(pipe_w)
    $stderr.reopen(pipe_w)
    yield
  ensure
    $stdout.reopen(old_stdout)
    $stderr.reopen(old_stderr)
    pipe_w.close
    reader.join
    pipe_r.close
    return output.string # rubocop:disable Lint/EnsureReturn
  end

  #
  # threaded_each provide a simple way to process an array of elements using multiple threads.
  # create_threads is a helper for threaded_each.
  #
  def self.create_threads(count, &block)
    [].tap do |threads|
      count.times do
        threads << Thread.new(&block)
      end
    end
  end

  def self.threaded_each(array, thread_count = 2)
    # NOTE: Queue is used here because it is threadsafe - it is the ONLY threadsafe datatype in base ruby!
    #   Without Queue, the array would need to be protected using a Mutex.
    queue = Queue.new.tap do |q|
      array.each do |i|
        q << i
      end
    end

    threads = create_threads(thread_count) do
      until queue.empty?
        next unless item = begin
          queue.pop(true)
        rescue
          nil
        end
        yield item if block_given?
      end
    end

    threads.each(&:join)
  end
end
