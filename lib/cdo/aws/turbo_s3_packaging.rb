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
# @param resolve_from_pointer [Boolean] When true, read the package key from the
#   pointer object on S3 instead of running turbo. Machines without node (our
#   production and levelbuilder frontends) must use this.
class TurboS3Packaging < S3Packaging
  def initialize(package_name, application_location, target_location, frontend_dir, turbo_filter, resolve_from_pointer: false)
    @frontend_dir = frontend_dir
    @turbo_filter = turbo_filter
    @resolve_from_pointer = resolve_from_pointer
    # source_locations is unused — hash comes from Turborepo, not git.
    super(package_name, application_location, [], target_location)
  end

  # Sets @commit_hash to the key of the package this checkout needs. Called once
  # during initialize and again inside create_package to detect mid-build changes.
  def regenerate_commit_hash
    @commit_hash = @resolve_from_pointer ? read_pointer : turbo_hash
  end

  # Records which package the current git tree needs, so machines without node
  # can find it without running turbo.
  def upload_pointer
    @logger.info "Uploading pointer #{pointer_key} -> #{@commit_hash}"
    client.put_object(bucket: BUCKET_NAME, key: pointer_key, body: @commit_hash, acl: 'public-read')
    @logger.info "Uploaded"
  end

  # Hash of the committed frontend/ tree. Deliberately wider than turbo's input
  # set: a frontend/ change that turbo ignores still gets its own pointer, so a
  # pointer is never missing for a deployable commit.
  def frontend_git_hash
    @frontend_git_hash ||= RakeUtils.git_folder_hash(@frontend_dir)
  end

  private def pointer_key
    "#{@package_name}/pointer-#{frontend_git_hash}"
  end

  # Reads the package key that the build environment recorded for this git tree.
  private def read_pointer
    File.read(download_object(pointer_key).path).strip
  rescue Aws::S3::Errors::NoSuchKey
    raise "No #{@package_name} package pointer at #{pointer_key}. " \
      "Build this commit on a build environment (test or staging) before deploying it here."
  end

  # Runs a Turborepo dry-run and extracts the hash of the '<turbo_filter>#build'
  # task. Needs node, so it only runs where the build can run.
  private def turbo_hash
    Dir.chdir(@frontend_dir) do
      RakeUtils.yarn_install
      output = `yarn turbo build --filter #{@turbo_filter} --dry-run=json 2>/dev/null`
      data = JSON.parse(output)
      task_id = "#{@turbo_filter}#build"
      task = data['tasks']&.find {|t| t['taskId'] == task_id}
      raise "Could not determine turbo hash for #{task_id}" unless task
      task['hash']
    end
  end
end
