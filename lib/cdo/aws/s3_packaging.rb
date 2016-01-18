require 'aws-sdk' # TODO - should we be using the S3.rb in CDO?

# TODO - figure out what should be public vs. private

BUCKET_NAME = 'cdo-build-package'

class S3Packaging
  # Determine the commit_hash given a directory containing source code
  def self.commit_hash(source_location)
    RakeUtils.git_latest_commit_hash source_location
  end

  def self.s3_key(package_name, commit_hash)
    "#{package_name}/#{commit_hash}.tar.gz"
  end

  # Tries to get an up to date package without building
  # @return True if our package is now up to date
  def self.attempt_update_package(package_name, target_location, commit_hash)
    begin
      self.ensure_updated_package(package_name, target_location, commit_hash)
    rescue Aws::S3::Errors::NoSuchKey
      puts 'Package does not exist on S3'
      return false
    rescue Exception => e
      puts "attempt_update_package failed: #{e.message}"
      return false
    end
    return true
  end

  def self.ensure_updated_package(package_name, target_location, commit_hash)
    if commit_hash == self.built_commit_hash(target_location)
      puts "Package is current: #{commit_hash}"
      return
    end

    self.unpack_from_s3(package_name, target_location, commit_hash)
  end

  # creates a package from the given assets location and upload it to s3
  # @return tempfile object of package
  def self.upload_as_package(package_name, assets_location, commit_hash)
    package = self.create_package(assets_location, commit_hash)
    self.upload_package(package_name, package, commit_hash)
    package
  end

  # Given a location where we expect to see an decompressed package, determines
  # the hash of that package (or nil if there is not one)
  def self.built_commit_hash(output_location)
    filename = "#{output_location}/commit_hash"
    return nil unless File.exist?(filename)
    IO.read(filename)
  end

  # Creates a zipped package of the provided assets folder
  # @return tempfile object of package
  def self.create_package(assets_location, commit_hash)
    package = Tempfile.new(commit_hash)
    puts "Creating #{package.path}"
    Dir.chdir(assets_location) do
      # add a commit_hash file whose contents represent the key for this package
      IO.write('commit_hash', commit_hash)
      # TODO - probably need to be using RakeUtils.system instead in these places
      `tar -zcf #{package.path} *`
    end
    package
  end

  # Downloads a package from S3, and decompresses into target
  def self.unpack_from_s3(package_name, target_location, commit_hash)
    package = self.download_package(package_name, commit_hash)
    self.decompress_package(package, target_location)
  end

  # Unzips package into target location
  def self.decompress_package(package, target_location)
    puts "Decompressing #{package.path}\nto #{target_location}"
    FileUtils.mkdir_p(target_location)
    Dir.chdir(target_location) do
      # Clear out existing package
      FileUtils.rm_rf Dir.glob("#{target_location}/*")
      `tar -zxf #{package.path}`
    end
  end

  # Uploads package to S3
  # @param package_name Name of the package, used in the S3 key
  # @param package File object of local zipped up package.
  # @param commit_hash Hash used to generate name of package on S3
  def self.upload_package(package_name, package, commit_hash)
    client = Aws::S3::Client.new
    key = s3_key(package_name, commit_hash)

    # TODO (this yet unbuilt logic belongs elsewhere)
    # try to get a package
    # if we get one compare to our own and fail if different
    # ^ this step is essentially an assert

    # result = client.get_object(bucket: BUCKET_NAME, key: key).body.rea

    puts "Uploading: #{key}"
    File.open(package) do |file|
      client.put_object(bucket: BUCKET_NAME, key: key, body: file)
    end
  end

  # Downloads package from S3, throws error if given package doesnt exist on s3
  # @param packge_name Name of the package, used in the s3 key
  # @param commit_hash
  # @return path to the downloaded package
  def self.download_package(package_name, commit_hash)
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
    package
  end
end
