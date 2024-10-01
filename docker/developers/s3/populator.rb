# Common utilities for local s3 population
require 'httparty'
require_relative '../../../deployment'
require_relative '../../../lib/cdo/aws/s3'

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
    unless AWS::S3.exists_in_bucket(bucket, path)
      data = data.call if data.is_a? Proc
      AWS::S3.upload_to_bucket(bucket, path, data, no_random: true)
    end
  rescue Aws::S3::Errors::NoSuchBucket => exception
    puts
    puts "ERROR: The #{bucket} bucket does not exist!"
    puts " *** : Run the minio-install command to create the S3 buckets"
    puts
    raise exception
  end

  def download(path)
    raise "Must define API_PATH" if api_path == ""

    url = "#{SOURCE_DOMAIN}#{api_path}/#{path}"
    to = local_path(path)
    relative_path = File.path(Pathname.new(to).relative_path_from(base_path))
    if File.exist?(to)
      data = File.read(to)
    else
      response = HTTParty.get(url)
      if response.code != 200
        puts "ERROR: Cannot find the given file"
        exit 1
      end

      # Write out file
      data = response.body
      File.open(to, 'w+') do |f|
        f.binmode
        f.write(data)
      end
    end

    # Ensure it exists in our bucket
    put(bucket_name, relative_path, data)

    data
  end

  def self.find_populator(bucket, key)
    # Determine the Populator class that can generate files for this bucket, if it
    # exists. We allow subdirectories to have their own populators, so this will find
    # them, in that case, or ascend up the hierarchy instead.
    path_parts = [bucket, *key.split('/')]
    class_parts = path_parts.map do |part|
      part.tr('-', '_').camelize
    end

    # The 'base' will be the most specific populator found for the path within the
    # bucket.
    base = nil
    relative_path = []
    until class_parts.empty?
      begin
        base = [*class_parts, 'Populate'].join('::').constantize
        relative_path << path_parts.pop
        break if base
      rescue NameError
        class_parts.pop
      end
    end

    [base, relative_path]
  end
end
