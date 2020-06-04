require 'aws-sdk-glue'
require 'aws-sdk-s3'
require 'concurrent'

module Cdo
  # AWS Glue Data Catalog table/schema utility functions.
  module Glue
    class << self
      attr_accessor :s3_client
      attr_accessor :glue_client
    end

    EXECUTOR = Concurrent::FixedThreadPool.new(100)

    @@calls = 0

    # Returns all S3 subfolders with the specified depth in an S3 object hierarchy.
    # @param [String] bucket
    # @param [Enumerable<String>] folders
    # @param [Integer] depth
    # @return [Array<String>]
    def self.s3_subfolders(bucket, folders, depth, delimiter: '/')
      $stdout.sync = true
      return folders if depth.zero?
      self.s3_client ||= Aws::S3::Client.new
      subfolders = folders.map do |folder|
        Concurrent::Future.execute(executor: EXECUTOR) do
          puts "Call #{@@calls += 1}"
          s3_client.list_objects_v2(
            bucket: bucket,
            prefix: folder,
            delimiter: delimiter
          ).flat_map {|page| puts "Page #{@@calls += 1}"; page.common_prefixes.map(&:prefix)}
        end
      end.flat_map(&:value!)
      puts "Found #{subfolders.count} subfolders at depth #{depth}."
      s3_subfolders(bucket, subfolders, depth - 1, delimiter: delimiter)
    end

    # GetPartitions allows a max of 10 'segments' for multiple parallel requests.
    # Ref: https://docs.aws.amazon.com/glue/latest/webapi/API_Segment.html
    GET_PARTITION_SEGMENTS = 10

    # Get all existing partitions in a Glue table.
    # @param [String] database
    # @param [String] table
    # @return [Array<Aws::Glue::Types::Partition>]
    def self.get_partitions(database, table)
      self.glue_client ||= Aws::Glue::Client.new
      GET_PARTITION_SEGMENTS.times.map do |i|
        Concurrent::Future.execute do
          glue_client.get_partitions(
            database_name: database,
            table_name: table,
            segment: {
              segment_number: i,
              total_segments: GET_PARTITION_SEGMENTS
            }
          ).to_a.flat_map(&:partitions)
        end
      end.flat_map(&:value!)
    end

    # Creates all missing partitions in a Glue table using subfolders within its S3 location.
    # @param [String] database
    # @param [String] table
    def self.update_partitions(database, table)
      self.glue_client ||= Aws::Glue::Client.new
      glue_table = glue_client.get_table(
        database_name: database,
        name: table
      ).table
      num_partitions = glue_table.partition_keys.length
      storage_descriptor = glue_table.storage_descriptor
      location = storage_descriptor.location
      raise 'Invalid S3 location in Glue table' unless location.slice!('s3://')
      bucket, *path = location.split('/')

      folders = s3_subfolders(bucket, [[*path, ''].join('/')], num_partitions)
      puts "Found #{folders.count} S3 subfolders."

      partitions = folders.map {|folder| folder.split('/').pop(num_partitions)}
      partition_value_map = partitions.map {|partition| [partition.map {|part| part.split('=').last}, partition]}.to_h
      existing_partitions = get_partitions(database, table).map(&:values)
      puts "Found #{existing_partitions.count} existing partitions."

      new_partitions = (partition_value_map.slice(*(partition_value_map.keys - existing_partitions))).map do |values, paths|
        {
          values: values,
          storage_descriptor: {
            location: "s3://#{[bucket, *path, *paths, ''].join('/')}",
            input_format: storage_descriptor.input_format,
            output_format: storage_descriptor.output_format,
            serde_info: storage_descriptor.serde_info
          }
        }
      end
      puts "Creating #{new_partitions.count} new partitions..."

      # Glue-BatchCreatePartition-PartitionInputList has a max of 100 items:
      # https://docs.aws.amazon.com/glue/latest/webapi/API_BatchCreatePartition.html#Glue-BatchCreatePartition-request-PartitionInputList
      new_partitions.each_slice(100).map do |partition_input|
        glue_client.batch_create_partition(
          database_name: database,
          table_name: table,
          partition_input_list: partition_input
        )
      end
      puts "Finished updating partitions!"
    end
  end
end
