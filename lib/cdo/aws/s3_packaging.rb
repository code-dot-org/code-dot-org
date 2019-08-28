require 'active_support/core_ext/string' # Get String#underscore
require 'aws-sdk-s3'
require 'logger'
require 'cdo/metrics_helper'

#
# In the past, we've committed build outputs into our git repo. This has various
# drawbacks. Instead, we'd like to store our build outputs in S3. This class
# helps us create zipped up packages that we can upload to/download from S3.
# As a part of the package, it includes a commit_hash file, whose contents
# contain the git commit hash of the build source used to create this package.
#
class S3Packaging
  BUCKET_NAME = 'cdo-build-package'.freeze

  attr_reader :commit_hash

  # @param package_name [String] Friendly name of the package, used as part of our S3 key
  # @param source_location [String] Path to the location on the filesystem where the build input lives
  # @param target_location [String] Path to the location on the file system where the unzipped packaged contents should lvie
  def initialize(package_name, source_location, target_location)
    throw "Missing argument" if package_name.nil? || source_location.nil? || target_location.nil?
    @package_name = package_name
    @source_location = source_location
    @target_location = target_location
    @logger = Logger.new(STDOUT)
    regenerate_commit_hash
  end

  def client
    @client ||= Aws::S3::Client.new
  end

  # Recreates our commit hash (for cases where we may have updated our git tree)
  def regenerate_commit_hash
    @commit_hash = RakeUtils.git_folder_hash @source_location
  end

  # Tries to get an up to date package without building
  # @return True if our package is now up to date
  def update_from_s3
    begin
      ensure_updated_package
    rescue Aws::S3::Errors::NoSuchKey
      @logger.info "Package does not exist on S3. If you have made local changes to #{@package_name}, you need to set build_#{@package_name.underscore} and use_my_#{@package_name.underscore} to true in locals.yml"
      return false
    rescue Exception => e
      @logger.info "update_from_s3 failed: #{e.message}"
      return false
    end
    return true
  end

  # Uploads the created package to s3
  # @return package
  def upload_package_to_s3(package)
    raise "Generated different package for same contents" unless package_matches_download(package)
    upload_package(package)
    package
  end

  # Unzips package into target location
  def decompress_package(package)
    @logger.info "Decompressing #{package.path}\nto #{@target_location}"
    FileUtils.mkdir_p(@target_location)
    Dir.chdir(@target_location) do
      # Clear out existing package
      FileUtils.rm_rf Dir.glob("#{@target_location}/*")
      RakeUtils.system "tar -zxmf #{package.path}"
    end
    @logger.info "Decompressed"
  end

  private def s3_key
    "#{@package_name}/#{@commit_hash}.tar.gz"
  end

  # The hash of the package at the given location (or nil if there is no package there)
  private def target_commit_hash(location)
    filename = "#{location}/commit_hash"
    return nil unless File.exist?(filename)
    IO.read(filename)
  end

  # Creates a zipped package of the provided assets folder
  # @param sub_path [String] Path to built assets, relative to source_location
  # @param expected_commit_hash [String] optional, when specified an error will be raised
  #        whenever the current commit hash doesn't match the expected one.
  #        Use this to detect file system changes during the build and fail package creation.
  # @return tempfile object of package
  def create_package(sub_path, expected_commit_hash: nil)
    # make sure commit hash is up to date
    regenerate_commit_hash

    if expected_commit_hash && expected_commit_hash != commit_hash
      raise "#{@package_name} contents changed unexpectedly. "\
        "Expected commit hash #{expected_commit_hash}, got #{commit_hash}"
    end

    package = Tempfile.new(@commit_hash)
    @logger.info "Creating #{package.path}"
    Dir.chdir(@source_location + '/' + sub_path) do
      # add a commit_hash file whose contents represent the key for this package
      IO.write('commit_hash', @commit_hash)
      RakeUtils.system "tar -cz --exclude='*.cache.json' --file #{package.path} *"
    end
    @logger.info 'Created'
    package
  end

  def log_bundle_size
    stats = JSON.parse(File.read(@source_location + '/build/package/js/stats.json'))
    Metrics.write_batch_metric(
      stats['assets'].map do |asset|
        next nil unless asset['name'].end_with? '.js'
        {
          name: 'bundle_size',
          metadata: asset['name'],
          value: asset['size'],
        }
      end.compact
    )
  rescue => e
    # Just log and continue
    warn 'Failed to log bundle size with error:'
    warn e
    warn 'Proceeding with build...'
  end

  private def ensure_updated_package
    if commit_hash == target_commit_hash(@target_location)
      @logger.info "Package is current: #{@commit_hash}"
    else
      decompress_package(download_package)
    end
  end

  # Uploads package to S3
  # @param package File object of local zipped up package.
  private def upload_package(package)
    @logger.info "Uploading: #{s3_key}"
    File.open(package, 'rb') do |file|
      client.put_object(bucket: BUCKET_NAME, key: s3_key, body: file, acl: 'public-read')
    end
    @logger.info "Uploaded"
  end

  # This is essentially an assert.
  # In general, before creating a package we'll check to see if we already have
  # one. However, it's possible that while creating one, someone else uploaded
  # a package (i.e. staging finished its build while test was doing a build of
  # its own). This validates that the one we created is identical to the one
  # that was uploaded.
  # @return [Boolean] True unless we have an existing package and it's different
  private def package_matches_download(package)
    begin
      old_package = download_package
    rescue Aws::S3::Errors::NoSuchKey
      # Nothing on S3, we dont have to worry about conflicting
      return true
    end

    @logger.info 'Existing package on s3. Validating equivalence'
    packages_equivalent(old_package, package)
  end

  # Checks to see if two packages are equivalent by unpacking them into tempfiles
  # and comparing the results. Simply comparing the packages themselves is not
  # sufficient, because they can contain metadata.
  private def packages_equivalent(package1, package2)
    diff = Dir.mktmpdir do |dir1|
      RakeUtils.system "tar -zxf #{package1.path} -C #{dir1}"
      Dir.mktmpdir do |dir2|
        RakeUtils.system "tar -zxf #{package2.path} -C #{dir2}"
        _, output = RakeUtils.system__ "diff -rq #{dir1} #{dir2}"
        output
      end
    end
    diff.empty?
  end

  # Downloads package from S3.
  # Throws a NoSuchKey error if given package doesn't exist on s3, or if the object is private.
  # @return tempfile for the downloaded package
  private def download_package
    package = Tempfile.new(@commit_hash)

    @logger.info "Attempting to download: #{s3_key}\nto #{package.path}"
    begin
      client.get_object({bucket: BUCKET_NAME, key: s3_key}, target: package)
    rescue Aws::Errors::MissingCredentialsError, Aws::S3::Errors::ServiceError
      # Fallback to public-URL download over HTTP if credentials are not provided or invalid.
      # TODO use aws-sdk to leverage aws-client optimizations once unsigned requests are supported:
      # https://github.com/aws/aws-sdk-ruby/issues/1149
      url = Aws::S3::Bucket.new(BUCKET_NAME, credentials: 0).object(s3_key).public_url
      File.open(package, 'wb') do |file|
        IO.copy_stream open(url), file
      rescue OpenURI::HTTPError
        raise Aws::S3::Errors::NoSuchKey.new(nil, file.path)
      end
    end
    @logger.info "Downloaded"
    package
  end
end
