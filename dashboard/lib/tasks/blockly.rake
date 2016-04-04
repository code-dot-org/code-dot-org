require 'fileutils'

namespace :blockly do

  def dist_project
    'blockly-mooc'
  end

  def dist_root
    "https://s3.amazonaws.com/cdo-dist/#{dist_project}"
  end

  def dist_version
    "#{dist_root}/VERSION"
  end

  def dist_file(version)
    "#{dist_root}/#{dist_project}-v#{version}.tgz"
  end

  def dest
    'public/blockly'
  end

  def clean!
    if File.symlink?(dest)
      File.unlink(dest)
    else
      FileUtils.rm_rf(dest)
    end
  end

  task latest: :environment do
    puts "Asking #{dist_version} for latest version number"
    latest = `curl --silent --insecure #{dist_version}`.strip
    puts "Latest version: #{latest}"
    Rake::Task['blockly:get'].invoke(latest)
  end

  task :get, [:version] => :environment do |_t, args|
    clean!
    filepath = dist_file(args[:version])
    puts "Downloading and extracting #{filepath}"
    curl_cmd = "curl --silent --insecure #{filepath}"
    dirname = File.dirname(dest)
    tar_cmd = "tar -xz -C #{dirname}"
    `#{curl_cmd} | #{tar_cmd}`
    FileUtils.mv("#{dirname}/package", dest)
  end

  task :dev, [:src] => :environment do |_t, args|
    src = args[:src] || '../apps'
    fullsrc = "#{File.absolute_path(src)}/build/package"
    unless File.directory?(fullsrc)
      raise "No such directory: #{fullsrc}\n(Specify a different location with 'blockly:dev[/path/to/blockly]')"
    end
    clean!
    File.symlink(fullsrc, dest)
  end

end
