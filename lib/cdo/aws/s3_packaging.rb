require 'aws-sdk'
require 'logger'

#
# In the past, we've committed build outputs into our git repo. This has various
# drawbacks. Instead, we'd like to store our build outputs in S3. This class
# helps us create zipped up packages that we can upload to/download from S3.
# As a part of the package, it includes a commit_hash file, whose contents
# contain the git commit hash of the build source used to create this package.
#
class S3Packaging
  BUCKET_NAME = 'cdo-build-package'

  # @param package_name [String] Friendly name of the package, used as part of our S3 key
  # @param source_location [String] Path to the location on the filesystem where the build input lives
  # @param target_location [String] Path to the location on the file system where the unzipped packaged contents should lvie
  def initialize(package_name, source_location, target_location)
    throw "Missing argument" if package_name.nil? || source_location.nil? || target_location.nil?
    @client = Aws::S3::Client.new
    @commit_hash = RakeUtils.git_latest_commit_hash source_location
    @package_name = package_name
    @source_location = source_location
    @target_location = target_location
    @logger = Logger.new(STDOUT)
  end

  def commit_hash
    @commit_hash
  end

  # Tries to get an up to date package without building
  # @return True if our package is now up to date
  def update_from_s3
    begin
      ensure_updated_package
    rescue Aws::S3::Errors::NoSuchKey
      @logger.info 'Package does not exist on S3. If you have made local changes to code-studio, you need to set build_code_studio and use_my_code_studio to true in locals.yml'
      return false
    rescue Exception => e
      @logger.info "update_from_s3 failed: #{e.message}"
      return false
    end
    return true
  end

  # creates a package from the given assets location and upload it to s3
  # @return tempfile object of package
  def upload_package_to_s3(sub_path)
    package = create_package(sub_path)
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
      RakeUtils.system "tar -zxf #{package.path}"
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
  # @return tempfile object of package
  def create_package(sub_path)
    package = Tempfile.new(@commit_hash)
    @logger.info "Creating #{package.path}"
    Dir.chdir(@source_location + '/' + sub_path) do
      # add a commit_hash file whose contents represent the key for this package
      IO.write('commit_hash', @commit_hash)
      RakeUtils.system "tar -zcf #{package.path} *"
    end
    @logger.info 'Created'
    package
  end

  private def ensure_updated_package
    if @commit_hash == target_commit_hash(@target_location)
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
      @client.put_object(bucket: BUCKET_NAME, key: s3_key, body: file)
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

  # Downloads package from S3, throws error if given package doesn't exist on s3
  # @return tempfile for the downloaded package
  private def download_package
    package = Tempfile.new(@commit_hash)

    @logger.info "Attempting to download: #{s3_key}\nto #{package.path}"
    File.open(package, 'wb') do |file|
      @client.get_object(bucket: BUCKET_NAME, key: s3_key) do |chunk|
        file.write(chunk)
      end
    end
    @logger.info "Downloaded"
    package
  end
end
