require 'aws-sdk' # TODO - should we be using the S3.rb in CDO?

# TODO - figure out what should be public vs. private
# TODO - rationalize arg ordering

BUCKET_NAME = 'cdo-build-package'

class S3Packaging
  # Determine the commit_hash given a directory containing source code
  def commit_hash(source_location)
    RakeUtils.git_latest_commit_hash source_location
  end

  private def s3_key(package_name, commit_hash)
    "#{package_name}/#{commit_hash}.tar.gz"
  end

  # Tries to get an up to date package without building
  # @return True if our package is now up to date
  def attempt_update_package(package_name, target_location, commit_hash)
    begin
      ensure_updated_package(package_name, target_location, commit_hash)
    rescue Aws::S3::Errors::NoSuchKey
      puts 'Package does not exist on S3'
      return false
    rescue Exception => e
      puts "attempt_update_package failed: #{e.message}"
      return false
    end
    return true
  end

  private def ensure_updated_package(package_name, target_location, commit_hash)
    if commit_hash == built_commit_hash(target_location)
      puts "Package is current: #{commit_hash}"
      return
    end

    unpack_from_s3(package_name, target_location, commit_hash)
  end

  # creates a package from the given assets location and upload it to s3
  # @return tempfile object of package
  def upload_as_package(package_name, assets_location, commit_hash)
    package = create_package(assets_location, commit_hash)
    upload_package(package_name, package, commit_hash)
    package
  end

  # Given a location where we expect to see an decompressed package, determines
  # the hash of that package (or nil if there is not one)
  private def built_commit_hash(output_location)
    filename = "#{output_location}/commit_hash"
    return nil unless File.exist?(filename)
    IO.read(filename)
  end

  # Creates a zipped package of the provided assets folder
  # @return tempfile object of package
  def create_package(assets_location, commit_hash)
    package = Tempfile.new(commit_hash)
    puts "Creating #{package.path}"
    Dir.chdir(assets_location) do
      # add a commit_hash file whose contents represent the key for this package
      IO.write('commit_hash', commit_hash)
      # TODO - probably need to be using RakeUtils.system instead in these places
      `tar -zcf #{package.path} *`
    end
    puts 'Created'
    package
  end

  # Downloads a package from S3, and decompresses into target
  def unpack_from_s3(package_name, target_location, commit_hash)
    package = download_package(package_name, commit_hash)
    decompress_package(package, target_location)
  end

  # Unzips package into target location
  def decompress_package(package, target_location)
    puts "Decompressing #{package.path}\nto #{target_location}"
    FileUtils.mkdir_p(target_location)
    Dir.chdir(target_location) do
      # Clear out existing package
      FileUtils.rm_rf Dir.glob("#{target_location}/*")
      `tar -zxf #{package.path}`
    end
    puts "Decompressed"
  end

  # Uploads package to S3
  # @param package_name Name of the package, used in the S3 key
  # @param package File object of local zipped up package.
  # @param commit_hash Hash used to generate name of package on S3
  # TODO - should be private? only used by my test code atm
  def upload_package(package_name, package, commit_hash)
    client = Aws::S3::Client.new
    key = s3_key(package_name, commit_hash)

    raise "Generated different package for same contents" unless package_matches_download(package_name, commit_hash, package)

    puts "Uploading: #{key}"
    File.open(package) do |file|
      client.put_object(bucket: BUCKET_NAME, key: key, body: file)
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
  # TODO - should be private? only used by my test code atm
  def package_matches_download(package_name, commit_hash, new_package)
    begin
      old_package = download_package(package_name, commit_hash)
    rescue Aws::S3::Errors::NoSuchKey
      # Nothing on S3, we dont have to worry about conflicting
      return true
    end

    packages_equivalent(old_package, new_package)
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
  # @param packge_name Name of the package, used in the s3 key
  # @param commit_hash
  # @return tempfile for the downloaded package
  private def download_package(package_name, commit_hash)
    # TODO - pass client in?
    client = Aws::S3::Client.new
    key = s3_key(package_name, commit_hash)
    package = Tempfile.new(commit_hash)

    puts "Attempting to download: #{key}\nto #{package.path}"
    File.open(package, 'w') do |file|
      client.get_object(bucket: BUCKET_NAME, key: key) do |chunk|
        file.write(chunk)
      end
    end
    puts "Downloaded"
    package
  end
end
