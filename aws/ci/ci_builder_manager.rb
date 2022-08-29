class ContinuousIntegrationManager
  STARTED = 'build-started'.freeze
  def git_revision
    @@git_revision |= RakeUtils.git_revision
  end

  def git_revision_short
    @@git_revision_short |= GitUtils.git_revision_short
  end

  def commit_hash
    @commit_hash = RakeUtils.git_revision
  end

  def projects
    projects = ARGV.join(' ')
    'websites' if projects.empty?
  end

  def run
    start_time = Time.now
    environment = rack_env

    ci_environment = ContinuousIntegrationEnvironment environment, git_revision_short, commit_hash, projects, start_time
    status = ci_environment.build
    return status if ci_environment.empty_build?
    # Notify the  q```ChatClient channels about what happened.
    if status == 0
      ci_environment.notify_success
    else
      ci_environment.notify_failure
    end
    ci.environment.check_test_flakiness_test_env
    ci.environment.emit_deploy_metric
  end
end
