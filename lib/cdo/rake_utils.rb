require 'os'
require 'open-uri'
require 'pathname'
require 'cdo/aws/s3'
require 'cdo/hip_chat'
require 'digest'
require 'sprockets-derailleur'

module RakeUtils
  def self.system__(command)
    CDO.log.info command
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
    sudo 'service', id.to_s, 'start' if OS.linux? && CDO.chef_managed
  end

  def self.stop_service(id)
    sudo 'service', id.to_s, 'stop' if OS.linux? && CDO.chef_managed
  end

  def self.system_(*args)
    status, _ = system__(command_(*args))
    status
  end

  def self.system_with_hipchat_logging(*args)
    command = command_(*args)
    HipChat.log "#{ENV['USER']}@#{CDO.rack_env}:#{Dir.pwd}$ #{command}"
    system_ command
  end

  def self.system(*args)
    command = command_(*args)
    status, output = system__ command
    unless status == 0
      error = RuntimeError.new("'#{command}' returned #{status}")
      raise error, error.message, CDO.filter_backtrace([output])
    end
    status
  end

  # Alternate version of RakeUtils.rake which always streams STDOUT to the shell
  # during execution.
  def self.rake_stream_output(*args)
    system_stream_output "RAILS_ENV=#{rack_env}", "RACK_ENV=#{rack_env}", 'bundle', 'exec', 'rake', *args
  end

  # Alternate version of RakeUtils.system which always streams STDOUT to the
  # shell during execution.
  def self.system_stream_output(*args)
    command = command_(*args)
    CDO.log.info command
    Kernel.system(command)
    unless $?.success?
      error = RuntimeError.new("'#{command}' returned #{$?.exitstatus}")
      raise error, error.message
    end
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
    # Using `with_clean_env` is necessary when shelling out to a different bundle.
    # Ref: http://bundler.io/man/bundle-exec.1.html#Shelling-out
    Bundler.with_clean_env do
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
    SprocketsDerailleur.worker_count
  end

  def self.bundle_install(*args)
    without = CDO.rack_envs - [CDO.rack_env]
    if CDO.bundler_use_sudo
      sudo 'bundle', '--without', *without, '--quiet', '--jobs', nproc, *args
    else
      system 'bundle', '--without', *without, '--quiet', '--jobs', nproc, *args
    end
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

  def self.git_update_count
    count = `git rev-list ..@{u} | wc -l`.strip.to_i
    return 0 if $?.exitstatus != 0
    count
  end

  def self.git_updates_available?
    `git remote show origin 2>&1 | grep \"local out of date\" | grep \"#{git_branch}\" | wc -l`.strip.to_i > 0
  end

  def self.git_staged_changes?(path="")
    `git status --porcelain #{path} 2>/dev/null | egrep \"^\s*(M|A|D)\" | wc -l`.strip.to_i > 0
  end

  # Gets a stable hash of the given directory's git-committed files.
  # Uses a hash of the `git ls-tree` contents because a shallow-clone may not have the
  # full revision history needed to find the original commit SHA.
  def self.git_folder_hash(dir)
    Dir.chdir(File.expand_path(dir)) do
      Digest::SHA2.hexdigest(`git ls-tree -r HEAD`)
    end
  end

  def self.ln_s(source, target)
    current = File.symlink?(target) ? File.readlink(target) : nil
    unless source == current
      system 'rm', '-f', target if(current || File.file?(target))
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

  def self.npm_install(*args)
    commands = []
    commands << 'PKG_CONFIG_PATH=/usr/X11/lib/pkgconfig' if OS.mac?
    commands << 'sudo' if CDO.npm_use_sudo
    commands << 'npm'
    commands << 'install'
    commands << '--quiet'
    commands += args
    RakeUtils.system *commands
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
    elsif OS.mac?
      RakeUtils.system 'brew install node'
      RakeUtils.system 'npm', 'update', '-g', 'npm'
      RakeUtils.system 'npm', 'install', '-g', 'grunt-cli'
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
      sudo 'rm', '-f', target if(current || File.file?(target))
      sudo 'ln', '-s', source, target
    end
  end

  # Uploads local file to S3, leaving a .fetch file pointing to it at the given path, and removes original file
  def self.replace_file_with_s3_backed_fetch_file(local_file, destination_local_path, params={})
    new_fetchable_url = self.upload_file_to_s3_bucket_and_create_fetch_file(local_file, destination_local_path, params)
    FileUtils.remove_file(local_file)
    new_fetchable_url
  end

  # Uploads local file to S3, leaving a corresponding .fetch file pointing to the remote copy
  def self.upload_file_to_s3_bucket_and_create_fetch_file(local_file, destination_local_path, params={})
    raise 'Need to specify bucket' unless params[:bucket]

    s3_filename = AWS::S3.upload_to_bucket(params[:bucket], File.basename(local_file), open(local_file), acl: 'public-read')
    new_fetchable_url = AWS::S3.public_url(params[:bucket], s3_filename)

    destination_local_pathname = Pathname(destination_local_path)
    FileUtils.mkdir_p(File.dirname(destination_local_pathname))
    File.open(destination_local_pathname, 'w') {|f| f.write(new_fetchable_url) }
    new_fetchable_url
  end

  # Whether this is a local or adhoc environment where we should install npm and create
  # a local database.
  def self.local_environment?
    (rack_env?(:development, :test) && !CDO.chef_managed) || rack_env?(:adhoc)
  end

  def self.wait_for_url(url)
    system_ "until $(curl --output /dev/null --silent --head --fail #{url}); do sleep 5; done"
  end

  def self.format_duration(total_seconds)
    total_seconds = total_seconds.to_i
    minutes = (total_seconds / 60).to_i
    seconds = total_seconds - (minutes * 60)
    "%.1d:%.2d minutes" % [minutes, seconds]
  end
end
