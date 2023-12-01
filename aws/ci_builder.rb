# Represents a Continuous Integration (CI) builder responsible for managing the build process.
module CiBuilder
  require_relative '../lib/cdo/rake_utils'
  extend self
  BUILD_STARTED = 'build-started'.freeze

  # Builds the project by executing a series of tasks including repository update,
  # logging build history, installing dependencies, and notifying Honeybadger about a new release.
  #
  # @return [Integer|String] Returns the status of the build process, typically an integer
  #                          representing the status code or a string indicating success/failure.
  def build
    Dir.chdir(deploy_dir) do
      # Checks if a build is required before initiating the process.
      return 0 unless build_required?

      # Creates a file to mark the start of the build process.
      FileUtils.touch BUILD_STARTED

      # Retrieves the count of Git updates for the repository.
      git_update_count = update_repository

      # Logs the build history based on the number of Git updates.
      log_build_history(git_update_count)

      # Displays the commit link in the chat client.
      display_commit_link

      # Installs necessary dependencies required for the build.
      install_dependencies

      # Notifies Honeybadger about a new release using the Git revision.
      notify_honeybadger

      # Executes the Continuous Integration (CI) task and captures the status.
      execute_ci_task
    end
  end

  private

  def build_required?
    RakeUtils.git_updates_available? || File.file?(BUILD_STARTED) || !CDO.daemon
  end

  def update_repository
    RakeUtils.git_fetch
    count = RakeUtils.git_update_count
    RakeUtils.git_pull if count > 0
    [1, count].max # I think this is not needed. unless count can be a real number between 0 and 1.
  end

  def log_build_history(git_update_count)
    log = `git log --pretty=format:"%h %s (%an)" -n #{git_update_count}`
    File.write(deploy_dir('rebuild'), log)
  end

  def display_commit_link
    git_revision = RakeUtils.git_revision
    git_revision_short = GitUtils.git_revision_short

    ChatClient.log "https://github.com/code-dot-org/code-dot-org/commit/#{git_revision}", message_format: 'text', color: 'purple'
    write_build_status rack_env, git_revision_short, :start
  end

  def install_dependencies
    RakeUtils.bundle_install
  end

  # Log details of a build to metrics database.
  # @param [Symbol] environment
  # @param [String] commit_hash
  # @param [Symbol] status - :start, :success, :failed
  def write_build_status(environment, commit_hash, status)
    event = "#{environment}_#{status}"
    if environment == :staging
      Metrics.write_metric(event, commit_hash, Metrics::AUTOMATIC)
    end
  end

  def notify_honeybadger
    git_revision = RakeUtils.git_revision
    Honeybadger.notify_new_release(rack_env, git_revision)
  end

  def execute_ci_task
    status = begin
      result = RakeUtils.rake_stream_output 'ci'
      validate_git_revision if CDO.test_system?
      result
    rescue => exception
      CDO.backtrace exception
    ensure
      FileUtils.rm BUILD_STARTED if File.file?(BUILD_STARTED)
    end
    status
  end

  def validate_git_revision
    git_revision = RakeUtils.git_revision
    raise 'Git revision unexpectedly changed during DTT' if git_revision != RakeUtils.git_revision
  end
end
