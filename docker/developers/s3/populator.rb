# Common utilities for local s3 population
require 'httparty'
require_relative '../../../deployment'
require_relative '../../../lib/cdo/aws/s3'

class Populator
  SOURCE_DOMAIN = "https://studio.code.org"

  attr_reader :api_path

  class << self
    def api_path(path)
      @@api_path = path
    end
  end

  def base_path
    File.join(__dir__, bucket_name)
  end

  def bucket_name
    local_path.split('/s3/').last.split('/').first
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
  rescue Aws::S3::Errors::NoSuchBucket => e
    puts
    puts "ERROR: The #{bucket} bucket does not exist!"
    puts " *** : Run the install-localstack command to create the S3 buckets"
    puts
    raise e
  end

  def download(path)
    raise "Must define api_path" unless defined?(@@api_path)

    url = "#{SOURCE_DOMAIN}#{@@api_path}/#{path}"
    to = local_path(path)
    relative_path = File.path(Pathname.new(to).relative_path_from(base_path))
    unless File.exist?(to)
      response = HTTParty.get(url)
      if response.code != 200
        puts "ERROR: Cannot find the given file"
        exit 1
      end

      # Write out file
      puts "Writing #{bucket_name}:#{relative_path}"
      data = response.body
      File.write(to, data)
    else
      data = File.read(to)
    end

    # Ensure it exists in our bucket
    put(bucket_name, relative_path, data)

    data
  end
end
