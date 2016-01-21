require 'aws-sdk'

class S3Packaging
  BUCKET_NAME = 'cdo-build-package'

  def initialize(package_name, source_location, target_location)
    @client = Aws::S3::Client.new
    @commit_hash = RakeUtils.git_latest_commit_hash source_location
    @package_name = package_name
    @source_location = source_location
    @target_location = target_location
  end

  # Tries to get an up to date package without building
  # @return True if our package is now up to date
  def update_from_s3
    begin
      ensure_updated_package
    rescue Aws::S3::Errors::NoSuchKey
      puts 'Package does not exist on S3'
      return false
    rescue Exception => e
      puts "update_from_s3 failed: #{e.message}"
      return false
    end
    return true
  end

  # creates a package from the given assets location and upload it to s3
  # @return tempfile object of package
  def upload_as_package(sub_path)
    package = create_package(sub_path)
    raise "Generated different package for same contents" unless package_matches_download(package)
    upload_package(package)
    package
  end

  private def s3_key
    "#{@package_name}/#{@commit_hash}.tar.gz"
  end

  # The hash of the package at target_location (or nil if there is not one)
  private def target_commit_hash
    filename = "#{@target_location}/commit_hash"
    return nil unless File.exist?(filename)
    IO.read(filename)
  end

  # Creates a zipped package of the provided assets folder
  # @param sub_path [String] Path to built assets, relative to source_location
  # @return tempfile object of package
  private def create_package(sub_path)
    package = Tempfile.new(@commit_hash)
    # TODO - better recommendation for logging that puts?
    puts "Creating #{package.path}"
    Dir.chdir(@source_location + '/' + sub_path) do
      # add a commit_hash file whose contents represent the key for this package
      IO.write('commit_hash', @commit_hash)
      # TODO - should i be using RakeUtils.system instead in these places?
      `tar -zcf #{package.path} *`
    end
    puts 'Created'
    package
  end

  # Unzips package into target location
  private def decompress_package(package)
    puts "Decompressing #{package.path}\nto #{@target_location}"
    FileUtils.mkdir_p(@target_location)
    Dir.chdir(@target_location) do
      # Clear out existing package
      FileUtils.rm_rf Dir.glob("#{@target_location}/*")
      `tar -zxf #{package.path}`
    end
    puts "Decompressed"
  end

  private def ensure_updated_package
    if @commit_hash == target_commit_hash
      puts "Package is current: #{@commit_hash}"
    else
      decompress_package(download_package)
    end
  end

  # Uploads package to S3
  # @param package File object of local zipped up package.
  private def upload_package(package)
    puts "Uploading: #{s3_key}"
    File.open(package, 'rb') do |file|
      @client.put_object(bucket: BUCKET_NAME, key: s3_key, body: file)
    end
    puts "Uploaded"
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

    puts 'Existing package on s3. Validating equivalence'
    packages_equivalent(old_package, package)
  end

  # Checks to see if two packages are equivalent by unpacking them into tempfiles
  # and comparing the results. Simply comparing the packages themselves is not
  # sufficient, because they can contain metadata.
  private def packages_equivalent(package1, package2)
    diff = Dir.mktmpdir do |dir1|
      `tar -zxf #{package1.path} -C #{dir1}`
      Dir.mktmpdir do |dir2|
        `tar -zxf #{package2.path} -C #{dir2}`
        `diff -rq #{dir1} #{dir2}`
      end
    end
    diff.empty?
  end

  # Downloads package from S3, throws error if given package doesnt exist on s3
  # @return tempfile for the downloaded package
  private def download_package
    package = Tempfile.new(@commit_hash)

    puts "Attempting to download: #{s3_key}\nto #{package.path}"
    File.open(package, 'wb') do |file|
      @client.get_object(bucket: BUCKET_NAME, key: s3_key) do |chunk|
        file.write(chunk)
      end
    end
    puts "Downloaded"
    package
  end
end
