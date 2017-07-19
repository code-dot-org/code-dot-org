#!/usr/bin/env bundle exec ruby
REPO_DIR = File.expand_path('../../../', __FILE__)
require_relative "#{REPO_DIR}/lib/cdo/cdo_cli"

class ScaryChangeDetector
  include CdoCli

  def initialize
    @added = []
    @deleted = []
    @modified = []
    Dir.chdir REPO_DIR do
      `git diff --cached --name-status`.split("\n").each do |change|
        type, filename = change.split("\t")
        case type
        when 'A'
          @added << filename
        when 'M'
          @modified << filename
        when 'D'
          @deleted << filename
        end
      end
    end
    @all = @added + @deleted + @modified
  end

  private

  def detect_new_models
    changes = @added.grep(/^dashboard\/app\/models\/levels\//)
    return if changes.empty?

    puts "Looks like you are adding new level type(s)."
    puts changes.join("\n")
    puts "There will be a deploy glitch that affects any students with progress in the scripts " \
      "that contain this level. To avoid this you can deploy this model code before deploying " \
      "the code that adds it to scripts."
  end

  def detect_missing_yarn_lock
    changed_package_json = @all.include? 'apps/package.json'
    changed_yarn_lock = @all.include? 'apps/yarn.lock'
    if changed_package_json && !changed_yarn_lock
      puts "You changed #{bold 'apps/package.json'} but didn't also change #{bold 'apps/yarn.lock'}:"
      puts "  You should run #{bold 'yarn'} and commit the updated yarn.lock file along"
      puts "  with your changes to package.json."
      puts dim "  If you are legitimately making a change to package.json that does not"
      puts dim "  affect yarn.lock, you can bypass this message with the --no-verify flag."
      raise "Commit blocked."
    end
  end

  def verify_yarn_lock_versions
    changed_yarn_lock = @all.include? 'apps/yarn.lock'
    yarn_version = '0.27.5'
    node_version = '6.9.0'
    if changed_yarn_lock
      if `head apps/yarn.lock | grep '# yarn v#{yarn_version}'`.empty?
        puts "You changed yarn.lock, but it does not have the right yarn version:"
        puts `head apps/yarn.lock | grep '# yarn v'`
        puts "Please make sure you are using yarn version #{yarn_version} and that"
        puts "`yarn config get yarn-enable-lockfile-versions` returns `true`."
        raise "Commit blocked."
      end
      if `head apps/yarn.lock | grep '# node v#{node_version}'`.empty?
        puts "You changed yarn.lock, but it does not have the right node version:"
        puts `head apps/yarn.lock | grep '# node v'`
        puts "Please make sure you are using node version #{node_version} and that"
        puts "`yarn config get yarn-enable-lockfile-versions` returns `true`."
        raise "Commit blocked."
      end
    end
  end

  def detect_special_files
    changes = @all.grep(/locals.yml$/)
    unless changes.empty?
      puts red <<-EOS

        Looks like you are changing locals.yml. This is probably a mistake.
        If this change is intentional, you can bypass this message with the
          --no-verify
        flag.

      EOS
      raise "Commit blocked."
    end
  end

  public

  def detect_scary_changes
    detect_new_models
    detect_missing_yarn_lock
    verify_yarn_lock_versions
    detect_special_files
  end
end

ScaryChangeDetector.new.detect_scary_changes
