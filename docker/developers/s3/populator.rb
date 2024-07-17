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
    File.dirname(File.realpath(Object.const_source_location(base_class.name).first))
  end

  def base_class
    parent = self.class
    while parent != Object
      parent = parent.module_parent
      break if parent.const_defined?(:BUCKET)
    end
    parent
  end

  def bucket_name
    base_class.const_get(:BUCKET)
  rescue NameError => exception
    puts
    puts "ERROR: you must define BUCKET in root module for #{self.class}"
    puts
    raise exception
  end

  def local_path(path = nil)
    impl_class_path = File.realpath(Object.const_source_location(self.class.name).first)
    impl_class_dir = File.dirname(impl_class_path)
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
    puts " *** : Run the install-localstack command to create the S3 buckets"
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
      puts "Writing #{bucket_name}:#{relative_path}"
      data = response.body
      File.write(to, data)
    end

    # Ensure it exists in our bucket
    put(bucket_name, relative_path, data)

    data
  end
end
