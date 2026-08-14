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
  # Where the per-package file lists live, relative to the target location.
  GENERATIONS_DIR = '.generations'.freeze

  # How many unpacked packages stay readable at once. Two lets a browser that
  # already holds the previous HTML finish loading its assets after a deploy.
  GENERATIONS_KEPT = 2

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

  # Unpacks over the existing package instead of replacing it. Asset filenames
  # carry a content hash, so two packages share a directory without colliding;
  # only commit_hash and the Vite manifest are overwritten, and the newest of
  # those is the one we want. Files last seen more than GENERATIONS_KEPT
  # packages ago are then deleted, so the directory does not grow forever.
  def decompress_package(package)
    @logger.info "Decompressing #{package.path}\nto #{@target_location}"
    FileUtils.mkdir_p(@target_location)
    record_bootstrap_generation
    Dir.chdir(@target_location) do
      RakeUtils.system "tar -zxmf #{package.path} --exclude=commit_hash"
    end
    record_generation(@commit_hash, package_file_list(package))
    prune_old_generations
    # Write the marker only once the package is whole. A deploy that dies part
    # way through leaves the old marker, so the next run unpacks again instead
    # of reading the directory as current and serving a half-written package.
    File.write(File.join(@target_location, 'commit_hash'), @commit_hash)
    @logger.info "Decompressed"
  end

  private def pointer_key
    "#{@package_name}/pointer-#{frontend_git_hash}"
  end

  # Reads the package key that the build environment recorded for this git tree.
  private def read_pointer
    # Hold the tempfile while we read it. Its finalizer deletes the file as soon
    # as the object is collected.
    pointer = download_object(pointer_key)
    File.read(pointer.path).strip
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

  private def generations_dir
    File.join(@target_location, GENERATIONS_DIR)
  end

  private def generations_index_path
    File.join(generations_dir, 'index')
  end

  # Hashes of the recorded generations, oldest first.
  private def generations
    return [] unless File.exist?(generations_index_path)
    read_list(generations_index_path)
  end

  private def generation_files(hash)
    path = File.join(generations_dir, "#{hash}.list")
    File.exist?(path) ? read_list(path) : []
  end

  private def read_list(path)
    File.readlines(path, chomp: true).reject(&:empty?)
  end

  # Writes a generation's file list and moves it to the newest position.
  private def record_generation(hash, files)
    FileUtils.mkdir_p(generations_dir)
    write_list(File.join(generations_dir, "#{hash}.list"), files)
    write_list(generations_index_path, (generations - [hash]) + [hash])
  end

  private def write_list(path, entries)
    File.write(path, entries.map {|entry| "#{entry}\n"}.join)
  end

  # Treats a directory unpacked before we kept generations as the previous
  # generation, so the first deploy under this scheme does not delete the
  # package that is currently being served.
  private def record_bootstrap_generation
    return if File.exist?(generations_index_path)
    files = existing_files
    return if files.empty?
    record_generation(target_commit_hash(@target_location) || 'bootstrap', files)
  end

  # Paths of the files already in the target location, relative to it, with our
  # own bookkeeping left out.
  private def existing_files
    Dir.glob('**/*', File::FNM_DOTMATCH, base: @target_location).
      reject {|path| path == GENERATIONS_DIR || path.start_with?("#{GENERATIONS_DIR}/")}.
      reject {|path| File.directory?(File.join(@target_location, path))}
  end

  # Paths of the files in the tarball, relative to the target location.
  private def package_file_list(package)
    `tar -tzf #{package.path}`.split("\n").
      reject {|entry| entry.empty? || entry.end_with?('/')}.
      map {|entry| entry.delete_prefix('./')}
  end

  # Deletes files that no generation in the newest GENERATIONS_KEPT still uses.
  private def prune_old_generations
    kept = generations.last(GENERATIONS_KEPT)
    dropped = generations - kept
    return if dropped.empty?

    in_use = kept.flat_map {|hash| generation_files(hash)}.uniq
    stale = dropped.flat_map {|hash| generation_files(hash)}.uniq - in_use
    @logger.info "Pruning #{stale.size} file(s) from #{dropped.size} old generation(s)"
    stale.each {|path| FileUtils.rm_f(File.join(@target_location, path))}
    dropped.each {|hash| FileUtils.rm_f(File.join(generations_dir, "#{hash}.list"))}
    write_list(generations_index_path, kept)
  end
end
