# Add Glue partition metadata when an S3 object is created.
# Invoked by a S3 bucket notification configuration for `s3:ObjectCreated:*` events.
# This function is made redundant by Athena Partition Projection, but
# adding partitions manually is still currently necessary for Redshift Spectrum.

require 'aws-sdk-glue'
GLUE = Aws::Glue::Client.new

DATABASE = ENV['DATABASE']
TABLE = ENV['TABLE']
PREFIX = ENV['PREFIX']

STORAGE_DESCRIPTOR = GLUE.get_table(
  database_name: DATABASE,
  name: TABLE
).table.storage_descriptor

# Track already-created partitions to avoid unnecessary calls to GetPartition.
CREATED_PARTITIONS = {}

def handler(event:, context:)
  partition = event['Records'][0].dig('s3', 'object', 'key').
    delete_prefix(PREFIX).split('/').tap(&:pop).join('/')

  CREATED_PARTITIONS[partition] ||=
    begin
      GLUE.get_partition(
        database_name: DATABASE,
        table_name: TABLE,
        partition_values: [partition]
      ).partition
      true
    rescue Aws::Glue::Errors::EntityNotFoundException
      GLUE.create_partition(
        database_name: DATABASE,
        table_name: TABLE,
        partition_input: {
          values: [partition],
          storage_descriptor: STORAGE_DESCRIPTOR.dup.tap do |storage|
            storage.location += partition + '/'
          end
        }
      )
    end
end
