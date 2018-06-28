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

  def detect_dropbox_conflicts
    changes = @added.grep(/'s conflicted copy/)
    unless changes.empty?
      puts red <<-EOS

        Looks like you are adding dropbox conflicted copy files.
        This is probably a mistake.

#{changes.join("\n")}

        Dropbox creates these files typically when 2 people change the same file at the same time.
        See https://www.dropbox.com/help/syncing-uploads/conflicted-copy

        Compare the file with its root (same filename minus the conflicted copy part). If they're identical,
        it's safe to delete the copy.
        Otherwise follow-up with the content editor mentioned in the copy and resolve the diff.

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
    detect_special_files
    detect_dropbox_conflicts
  end
end

ScaryChangeDetector.new.detect_scary_changes
