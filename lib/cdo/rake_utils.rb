require 'os'
require 'open-uri'
require 'pathname'
require 'cdo/aws/s3'

module RakeUtils

  def self.system__(command)
    puts command
    Kernel::system "#{command} 2>&1"
    $?.exitstatus
  end

  def self.command_(*args)
    # BUGBUG: Should escape for shell here and verify no callers do that.
    args.map{|i|i.to_s}.join(' ')
  end

  def self.start_service(id)
    sudo 'service', id.to_s, 'start' if OS.linux?
  end
  def self.stop_service(id)
    sudo 'service', id.to_s, 'stop' if OS.linux?
  end

  def self.system_(*args)
    system__ command_ *args
  end

  def self.system(*args)
    command = command_ *args
    status = system__ command
    raise RuntimeError, "'#{command}' returned #{status}" unless status == 0
  end

  def self.bundle_exec(*args)
    system "RAILS_ENV=#{rack_env}", "RACK_ENV=#{rack_env}", 'bundle', 'exec', *args
  end

  def self.bundle_install(*args)
    without = CDO.rack_envs - [CDO.rack_env]
    if OS.linux?
      sudo 'bundle', '--without', *without, '--quiet', *args
    else
      system 'bundle', '--without', *without, '--quiet', *args
    end
  end

  def self.git_add(*args)
    system 'git', 'add', *args
  end

  def self.git_branch()
    `git branch | grep \\* | cut -f 2 -d \\ `.strip
  end

  def self.git_commit(message)
    `git commit -m \"#{message}\"`.strip
  end

  def self.git_fetch()
    system 'git', 'fetch'
  end

  def self.git_pull()
    system 'git', 'pull', 'origin', git_branch
  end

  def self.git_push()
    system 'git', 'push', 'origin', git_branch
  end

  def self.git_revision
    `git rev-parse HEAD`.strip
  end

  def self.git_update_count()
    count = `git rev-list ..@{u} | wc -l`.strip.to_i
    return 0 if $?.exitstatus != 0
    count
  end

  def self.git_updates_available?()
    `git remote show origin 2>&1 | grep \"local out of date\" | grep \"#{git_branch}\" | wc -l`.strip.to_i > 0
  end

  def self.npm_install(*args)
    commands = []
    commands << 'PKG_CONFIG_PATH=/usr/X11/lib/pkgconfig' if OS.mac?
    commands << 'sudo' if OS.linux?
    commands << 'npm'
    commands << 'install'
    commands << '--quiet'
    commands += args
    RakeUtils.system *commands
  end

  def self.npm_install_g(*args)
    RakeUtils.sudo 'npm', 'install', '--quiet', '-g', *args
  end

  def self.rake(*args)
    bundle_exec 'rake', *args
  end

  def self.sudo(*args)
    system 'sudo', *args
  end

  def self.sudo_ln_s(source, target)
    current = File.symlink?(target) ? File.readlink(target) : nil
    unless target == current
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

    s3_filename = AWS::S3.upload_to_bucket(params[:bucket], File.basename(local_file), open(local_file), access: :public_read)
    new_fetchable_url = AWS::S3::S3Object.url_for(s3_filename, params[:bucket], authenticated: false)

    destination_local_pathname = Pathname(destination_local_path)
    FileUtils.mkdir_p(File.dirname(destination_local_pathname))
    File.open(destination_local_pathname, 'w') {|f| f.write(new_fetchable_url) }
    new_fetchable_url
  end
end
