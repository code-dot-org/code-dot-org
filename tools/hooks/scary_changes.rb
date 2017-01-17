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
    changes = @added.grep(/^dashboard\/app\/models/)
    return if changes.empty?

    puts "Looks like you are adding dashboard model(s)."
    puts changes.join("\n")
    puts "If you are adding new descendents of Level, there will be a deploy glitch that affects any students with progress in the scripts that contain this level. To avoid this you can deploy this model code before deploying the code that adds it to scripts."
    puts "Does this data belong in AWS Redshift or Tableau? Please CC asher on the PR if it might."
  end

  def detect_db_changes
    changes = @all.grep(/^dashboard\/db\/migrate/)
    return if changes.empty?

    unless changes.empty?
      puts "Looks like you are adding a migration:"
      puts changes.join("\n")
      puts "How long will it take to run in production, and if more than a couple minutes, is it possible to run it outside of the deployment?"
      puts "Does this impact AWS DataPipeline or AWS Redshift? Please CC asher on the PR."
    end
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

  public

  def detect_scary_changes
    detect_db_changes
    detect_new_models
    detect_missing_yarn_lock
  end
end

ScaryChangeDetector.new.detect_scary_changes
