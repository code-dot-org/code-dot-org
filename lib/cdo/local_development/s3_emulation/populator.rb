require 'httparty'
require 'cdo/aws/s3'

# Common utilities for local s3 population, intended to be included by the
# Populate classes invoked by `LocalDevelopment#populate_local_s3_bucket`.
#
# See `lib/cdo/local_development.rb`
module Populator
  SOURCE_DOMAIN = "https://studio.code.org"
  API_PATH = ""

  def api_path
    self.class::API_PATH
  end

  def base_path
    root_path = File.realpath(__dir__)
    File.join(root_path, base_class.name.underscore)
  end

  def base_class
    parent = self.class
    while parent != Object
      break if parent.const_defined?(:BUCKET)
      break if parent.module_parent == Object
      parent = parent.module_parent
    end
    parent
  end

  def bucket_name
    # Allow an override for the bucket name
    base_class.const_get(:BUCKET)
  rescue NameError
    # By default, derive the bucket name from the name of the class
    base_class.name.underscore.tr('_', '-')
  end

  def local_path(path = nil)
    root_path = File.realpath(__dir__)
    impl_class_dir = File.join(root_path, File.dirname(self.class.name.underscore))
    return impl_class_dir unless path

    Pathname.new(File.join(impl_class_dir, path)).cleanpath
  end

  def populate(path = nil)
    return populate_all if path.nil?

    download(path)
  end

  def populate_all
    # Do nothing if we do not know how to collect everything from the bucket
  end

  def put(bucket, path, data)
    return unless CDO.aws_s3_emulated
    return if AWS::S3.exists_in_bucket(bucket, path)

    data = data.call if data.is_a? Proc
    AWS::S3.upload_to_bucket(bucket, path, data, no_random: true)
  rescue Aws::S3::Errors::NoSuchBucket => exception
    puts
    puts "ERROR: The #{bucket} bucket does not exist!"
    puts " *** : Run the minio-install command to create the S3 buckets"
    puts
    raise exception
  end

  def download(path)
    raise "Must define API_PATH" if api_path == ""

    # Fetch data for this path from studio.code.org.
    url = "#{SOURCE_DOMAIN}#{api_path}/#{path}"
    response = HTTParty.get(url)
    if response.code != 200
      raise "ERROR: Cannot find the given file"
    end
    data = response.body

    # Persist downloaded data to bucket, so we don't have to download it again.
    to = local_path(path)
    relative_path = File.path(Pathname.new(to).relative_path_from(base_path))
    put(bucket_name, relative_path, data)

    data
  end
end
