
module Cdo
  module Metrics
    def self.put(namespace, metric_name, metric_value, dimensions)
      # Stub
    end

    def self.flush!
      # Stub
    end
  end

  class Secrets
    # Constructor
    def initialize(n)
      # Stub
    end

    def required(n = nil)
      # Stub
      print "SECRETS(STUB) required #{n}\n"
    end

    def get!(n)
      # Stub
      print "SECRETS(STUB) get! #{n}\n"
    end
  end
end

module Metrics
  module Events
    class << self
      def log_event(user: nil, event_name:, event_value: nil, metadata: {}, get_enabled_experiments: false)
        # Stub
      end
      def log_event_with_session(session:, event_name:, event_value: nil, metadata: {})
        # Stub
      end
    end
  end
end

class String
  # Returns true if the string ends with the string passed
  def ends_with?(s)
    self[-s.length..] == s
  end

  # Returns true if the string contains any one of the strings passed
  def include_one_of?(*items)
    items.flatten.each do |item|
      return true if include?(item)
    end
    false
  end
end

class Object
  # Returns true if nil or empty (string, array, hash)
  def nil_or_empty?
    nil? || empty?
  end

  # Return the value to use in a querystring/form.
  unless method_defined?(:to_param)  # May be provided by Rails
    def to_param
      to_s
    end
  end

  # Return the value encoded as a querystring/form property (key=value)
  unless method_defined?(:to_query)  # May be provided by Rails
    def to_query(key)
      "#{Rack::Utils.escape(key.to_param)}=#{Rack::Utils.escape(to_param.to_s)}"
    end
  end
end


module Harness
  def error_notify(e, data = {})
    # Stub
  end
end

require 'singleton'

class FirehoseClient
  include Singleton

  def put_record(record,deets)
    # Stub
  end
end

class BucketHelper
  def self.s3_get_object(key, if_modified_since, version)
    # Stub
  end

  # Emulate S3 get object by reading from the local file system
  def get(encrypted_channel_id, filename, if_modified_since = nil, version = nil)
    # Decrypt the channel ID to get the owner_id and storage_app_id
    owner_id, storage_app_id = storage_decrypt_channel_id(encrypted_channel_id)
    
    # Construct the file path based on the owner_id, storage_app_id, and filename
    path = File.join("/student-data/channels", owner_id, storage_app_id, filename)
    
    if File.exist?(path)
      # Return a hash to simulate the S3 object response
      {
        status: 'FOUND',
        body: File.read(path),
        version_id: nil, # No versioning in the local file system
        last_modified: File.mtime(path),
        metadata: {} # You could add metadata if needed
      }
    else
      { status: 'NOT_FOUND' }
    end
  rescue ArgumentError, OpenSSL::Cipher::CipherError
    { status: 'NOT_FOUND' }
  end

  # Emulate S3 put object by writing to the local file system
  def create_or_replace(encrypted_channel_id, filename, body, version = nil, abuse_score = 0)
    # Decrypt the channel ID to get the owner_id and storage_app_id
    owner_id, storage_app_id = storage_decrypt_channel_id(encrypted_channel_id)
    
    # Construct the file path based on the owner_id, storage_app_id, and filename
    path = File.join("/student-data/channels", owner_id, storage_app_id, filename)
    
    # Create the directory structure if it doesn't exist
    dir = File.dirname(path)
    FileUtils.mkdir_p(dir) unless Dir.exist?(dir)
    
    # Write the data to the file
    File.write(path, body)
    
    # Since there's no versioning in the local file system, just return a mock response
    { status: 'SUCCESS', path: path }
  end
end

# Debugger outputting what parts of the code are running on slow non-outputting scripts
last_report_time = Process.clock_gettime(Process::CLOCK_REALTIME)

set_trace_func proc { |event, file, line, id, binding, classname|
  if event == "line"
    current_time = Process.clock_gettime(Process::CLOCK_REALTIME)
    if current_time - last_report_time >= 15 # Report every 15 seconds
      puts "HARNESS TRACE: Still running: #{file}:#{line} in method #{id}"
 
      # Start by looking at the current file/line
      filtered_file = file
      filtered_line = line
      filtered_id = id

      # Walk up the stack
      caller_locations.each do |location|
        path = location.path
        if !path.start_with?("/usr/local") && !path.include?("/vendor/")
          filtered_file = path
          filtered_line = location.lineno
          filtered_id = location.label
          break
        end
      end

      # if this isn't the same line/file as the last report, print it
      if filtered_file != file || filtered_line != line
        puts "  --> under: #{filtered_file}:#{filtered_line} in method #{filtered_id}"
      end
      
      last_report_time = current_time
    end
  end
}