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
      @changed_lines = `git diff --cached --unified=0`
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

  def detect_changed_feature_files
    changes = @all.grep(/^dashboard\/test\/ui\/features\//)
    return if changes.empty?

    puts red <<-EOS

        Looks like you added or edited UI tests:

        #{changes.join("\n")}

        If you'd like Drone to test your changes across all browsers
        (instead of only in Chrome, the default),
        amend your commit message to include the tag [test all browsers] if you haven't already.

        Note that (as of January 2021) Drone will not successfully run all tests across all browsers,
        so you may need another commit without the [test all browsers] tag
        if you'd like to see all tests (in Chrome) passing in Drone without manual inspection.
    EOS
  end

  def detect_new_table_or_new_column
    changes = @all.grep(/^dashboard\/db\/migrate\//)
    return if changes.empty? || !(@changed_lines.include?("add_column") || @changed_lines.include?("create_table"))

    puts red <<-EOS

        Looks like you are creating a table or adding a column in this migration:
        #{changes.join("\n")}
        Do you have all the indexes needed for this change?

    EOS
  end

  def detect_column_rename
    changes = @all.grep(/^dashboard\/db\/migrate\//)
    return if changes.empty? || !@changed_lines.include?("rename_column")

    puts red <<-EOS

        Looks like you are renaming a column in this migration:
        #{changes.join("\n")}
        In production, database migrations may be applied much earlier than when application servers are upgraded.
        Have you verified that the updated database schema works with the previously deployed application version?
        For more information on this issue see https://docs.google.com/document/d/1QHCjUdLz7D7fE-Cy4HrrtJ5FOSnSth7sNHfSemwNSfw.

    EOS
  end

  def detect_migration_causing_db_performance_risk
    changes = @all.grep(/^dashboard\/db\/migrate\//)
    return if changes.empty? || !(@changed_lines.include?("add_column") || @changed_lines.include?("add_index") || @changed_lines.include?("change_column"))

    puts red <<-EOS

        Looks like you are adding a column, changing a column or adding an index in this migration:
        #{changes.join("\n")}
        Making these types of changes on a large table (>10M rows) needs to be reviewed and
        tested with the Infrastructure cabal to avoid negatively impacting production database performance.
        The may cause MySQL to rebuild the entire table.
        For more information see https://dev.mysql.com/doc/refman/5.7/en/innodb-online-ddl-operations.html#online-ddl-column-operations.

    EOS
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
    detect_new_table_or_new_column
    detect_column_rename
    detect_migration_causing_db_performance_risk
    detect_missing_yarn_lock
    detect_special_files
    detect_dropbox_conflicts
    detect_changed_feature_files
  end
end

ScaryChangeDetector.new.detect_scary_changes
