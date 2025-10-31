require 'json'
require 'aws-sdk-glue'
require 'aws-sdk-s3'
require 'uri'
require 'logger'

def handler(event:, context:)
  logger = Logger.new($stdout)
  logger.info("Processing event: #{JSON.pretty_generate(event)}")

  glue_client = Aws::Glue::Client.new
  s3_client = Aws::S3::Client.new

  database_name = ENV.fetch('GLUE_DATABASE', nil)
  table_name = NV.fetch('GLUE_TABLE', nil)

  results = []

  # Parse S3 event
  event['Records'].each do |record|
    bucket = record['s3']['bucket']['name']
    key = record['s3']['object']['key']

    logger.info("Processing object: s3://#{bucket}/#{key}")

    # Check if this is a manifest.json file
    next unless key.end_with?('manifest.json')

    # Extract bucket name and report timestamp from the key
    # Pattern: project_backup_tracking/source_bucket_inventory_reports/[bucket_name]/InventoryForBackups/[timestamp]/manifest.json
    path_parts = key.split('/')

    # Find the source bucket name and timestamp
    inventory_index = path_parts.index('InventoryForBackups')

    if inventory_index && inventory_index > 0
      source_bucket = path_parts[inventory_index - 1]
      report_timestamp = path_parts[inventory_index + 1]

      logger.info("Source bucket: #{source_bucket}, Report timestamp: #{report_timestamp}")

      # Read the manifest file
      manifest_obj = s3_client.get_object(bucket: bucket, key: key)
      manifest_data = JSON.parse(manifest_obj.body.read)

      logger.info("Manifest format: #{manifest_data['fileFormat']}")
      logger.info("Number of data files: #{manifest_data['files'].length}")

      # Get the data file locations from manifest
      data_files = manifest_data['files'].map {|file| file['key']}

      # Determine the data location - the directory containing the data files
      data_location = if data_files.any?
                        first_data_file = data_files.first
                        data_dir = File.dirname(first_data_file)
                        "s3://#{bucket}/#{data_dir}/"
                      else
                        # Fallback to manifest directory + data/
                        manifest_dir = File.dirname(key)
                        "s3://#{bucket}/#{manifest_dir}/data/"
                      end

      logger.info("Partition location: #{data_location}")

      # Create partition for this inventory report
      begin
        partition_input = {
          values: [source_bucket, report_timestamp],
          storage_descriptor: {
            location: data_location,
            input_format: 'org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat',
            output_format: 'org.apache.hadoop.hive.ql.io.parquet.MapredParquetOutputFormat',
            serde_info: {
              serialization_library: 'org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe'
            },
            columns: [] # Inherit from table definition
          }
        }

        glue_client.create_partition(
          database_name: database_name,
          table_name: table_name,
          partition_input: partition_input
        )

        logger.info("Successfully created partition for bucket: #{source_bucket}, timestamp: #{report_timestamp}")
        results << {
          status: 'created',
          source_bucket: source_bucket,
          report_timestamp: report_timestamp
        }
      rescue Aws::Glue::Errors::AlreadyExistsException
        logger.info("Partition already exists for bucket: #{source_bucket}, timestamp: #{report_timestamp}")
        results << {
          status: 'already_exists',
          source_bucket: source_bucket,
          report_timestamp: report_timestamp
        }
      rescue => exception
        logger.error("Error creating partition: #{exception.message}")
        logger.error(exception.backtrace.join("\n"))
        raise exception
      end
    else
      logger.warn("Could not extract bucket and timestamp from key: #{key}")
    end
  rescue => exception
    logger.error("Error processing record: #{exception.message}")
    logger.error(exception.backtrace.join("\n"))
    # Continue processing other records
  end

  {
    statusCode: 200,
    body: JSON.generate({
                          message: 'Partitions processed successfully',
      results: results
                        }
)
  }
end
