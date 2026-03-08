require_relative 's3_packaging'
require 'json'

# Subclass of S3Packaging that derives the commit hash from Turborepo's
# task graph rather than from a git tree hash. This allows skipping
# builds when an S3 package already exists for the same turbo-computed
# inputs hash.
#
# @param package_name [String] Friendly name, used as part of the S3 key.
# @param application_location [String] Filesystem path to the app root.
# @param target_location [String] Filesystem path where the decompressed
#   package should live (e.g. dashboard/public/studio-package).
# @param frontend_dir [String] Path to the frontend/ workspace root where
#   the `yarn turbo` command is executed.
# @param turbo_filter [String] Turbo package filter, e.g. '@code-dot-org/studio'.
#   The task hash is read from the '<filter>#build' task in the dry-run output.
class TurboS3Packaging < S3Packaging
  def initialize(package_name, application_location, target_location, frontend_dir, turbo_filter)
    @frontend_dir = frontend_dir
    @turbo_filter = turbo_filter
    # source_locations is unused — hash comes from Turborepo, not git.
    super(package_name, application_location, [], target_location)
  end

  # Computes @commit_hash by running a Turborepo dry-run and extracting
  # the hash for the '<turbo_filter>#build' task. Called once during
  # initialize and again inside create_package to detect mid-build changes.
  def regenerate_commit_hash
    Dir.chdir(@frontend_dir) do
      output = `yarn turbo build --filter #{@turbo_filter} --dry-run=json 2>/dev/null`
      data = JSON.parse(output)
      task_id = "#{@turbo_filter}#build"
      task = data['tasks']&.find {|t| t['taskId'] == task_id}
      raise "Could not determine turbo hash for #{task_id}" unless task
      @commit_hash = task['hash']
    end
  end
end
