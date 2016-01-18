require 'aws-sdk' # TODO - should we be using the S3.rb in CDO?

# TODO - figure out what should be public vs. private

class S3Packaging
  # Determine the commit_hash given a directory containing source code
  def self.commit_hash(source_location)
    RakeUtils.git_latest_commit_hash source_location
  end

  def self.s3_key(package_name, commit_hash)
    "#{package_name}/#{commit_hash}.tar.gz"
  end

  def self.ensure_updated_package(package_name, target_location, commit_hash)
    if commit_hash == self.built_commit_hash(target_location)
      puts "Package is current: #{commit_hash}"
      return
    end

    self.unpack_from_s3(package_name, target_location, commit_hash)
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
    output_path = self.download_package(package_name, commit_hash)
    self.decompress_package(output_path, target_location)
  end

  # Unzips package into target location
  def self.decompress_package(package_path, target_location)
    puts "Decompressing #{package_path} to #{target_location}"
    Dir.chdir(target_location) do
      # Clear out existing package
      FileUtils.rm_rf Dir.glob("#{target_location}/*")
      `tar -zxf #{package_path}`
    end
  end

  # Uploads package to S3
  # @param package_name Name of the package, used in the S3 key
  # @param package_path Path to local zipped up package.
  # @param commit_hash Hash used to generate name of package on S3
  def self.upload_package(package_name, package_path, commit_hash)
    client = Aws::S3::Client.new
    key = s3_key(package_name, commit_hash)

    # TODO (this yet unbuilt logic belongs elsewhere)
    # try to get a package
    # if we get one compare to our own and fail if different
    # ^ this step is essentially an assert

    # result = client.get_object(bucket: BUCKET_NAME, key: key).body.rea

    puts "Uploading: #{key}"
    File.open(package_path) do |file|
      client.put_object(bucket: BUCKET_NAME, key: key, body: file)
    end
  end

  # Downloads package from S3
  # @param packge_name Name of the package, used in the s3 key
  # @param commit_hash
  # @return path to the downloaded package
  def self.download_package(package_name, commit_hash)
    # TODO - pass client in?
    client = Aws::S3::Client.new
    key = s3_key(package_name, commit_hash)
    output_path = Tempfile.new(commit_hash).path

    puts "Downloading: #{key}"
    puts "Writing to #{output_path}"
    File.open(output_path, 'w') do |file|
      client.get_object(bucket: BUCKET_NAME, key: key) do |chunk|
        file.write(chunk)
      end
    end
    output_path
  end

  # package is the zip consisting of source + file stating signature

  # needs_package_update (returns bool)
  # look for signature file. does it match commit_hash? if so, we're done

  # get_package (returns zip file or nil)
  # try to download BUCKET_NAME/package_name/commit_hash.zip from S3
  # if it fails, we'll have to build ourselves (or fail depending on environment)
  # if it succeeds, caller should unzip into target

  # upload_package (..., package)
  # call get_package
  # if it gives us a package, compare it to our own. if they're different, fail
  # if we didnt get one, upload ours

  # create_package (source, name, commit_hash)
end
