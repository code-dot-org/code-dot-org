require 'aws-sdk-s3'
require 'aws-sdk-s3control'
require 'aws-sdk-dynamodb'
require 'json'
require 'csv'
require 'zlib'
require 'time'
require 'logger'
require 'set'

LOGGER = begin
  logger = Logger.new($stdout)

  log_level = ENV['LOG_LEVEL']&.upcase || 'INFO'
  logger.level = case log_level
                 when 'DEBUG' then Logger::DEBUG
                 when 'INFO' then Logger::INFO
                 when 'WARN' then Logger::WARN
                 when 'ERROR' then Logger::ERROR
                 when 'FATAL' then Logger::FATAL
                 else Logger::INFO
                 end

  # JSON structured format for optimal CloudWatch Logs Insights querying
  logger.formatter = proc do |severity, datetime, _progname, msg|
    log_entry = if msg.is_a?(Hash)
                  msg.merge(
                    level: severity,
                    timestamp: datetime.iso8601,
                    component: 'batch-replication'
                  )
                else
                  {
                    level: severity,
                    timestamp: datetime.iso8601,
                    component: 'batch-replication',
                    message: msg
                  }
                end
    "#{log_entry.to_json}\n"
  end

  logger
end

def log(level, action, data = {})
  log_data = {
    action: action
  }.merge(data)

  case level
  when :debug then LOGGER.debug(log_data)
  when :info then LOGGER.info(log_data)
  when :warn then LOGGER.warn(log_data)
  when :error then LOGGER.error(log_data)
  when :fatal then LOGGER.fatal(log_data)
  end
end

def lambda_handler(event:, context:)
  log(:info, 'start_handler', {event: event, context: context})
  s3_client = Aws::S3::Client.new
  s3control_client = Aws::S3Control::Client.new
  dynamodb_client = Aws::DynamoDB::Client.new

  source_bucket = ENV.fetch('SOURCE_BUCKET', nil)
  destination_bucket = ENV.fetch('DESTINATION_BUCKET', nil)
  ENV.fetch('DESTINATION_ACCOUNT', nil)
  batch_role_arn = ENV.fetch('BATCH_ROLE_ARN', nil)
  inventory_bucket = ENV.fetch('INVENTORY_BUCKET', nil)
  tracking_table = ENV.fetch('TRACKING_TABLE', nil)

  now = Time.now.utc
  fifteen_minutes_ago = now - (15 * 60)
  yesterday = now - (24 * 60 * 60)
  log(:info, 'arn_debug', {arn_value: context.invoked_function_arn, arn_class: context.invoked_function_arn.class.name})
  account_id = Aws::ARNParser.parse(context.invoked_function_arn).account_id
  execution_id = context.aws_request_id

  log(
    :info,
    'lambda_start',
    {
      execution_id: execution_id,
      source_bucket: source_bucket,
      dest_bucket: destination_bucket
    }
  )

  log(
    :info,
    'time_window',
    {
      window_start: yesterday.iso8601,
      window_end: fifteen_minutes_ago.iso8601,
      duration_hours: ((fifteen_minutes_ago - yesterday) / 3600).round(2)
    }
  )

  begin
    # Step 1: Find the latest S3 Inventory report
    log(:info, 'step_1_start', {step: 1, action_detail: 'find_latest_inventory', inventory_bucket: inventory_bucket})

    latest_inventory = find_latest_inventory_report(s3_client, inventory_bucket, source_bucket)

    unless latest_inventory
      log(
        :warn,
        'step_1_complete',
        {
          step: 1, status: 'no_inventory_found',
          message: 'Inventory reports not available yet'
        }
      )
      return success_response('No inventory reports available yet')
    end

    log(:info, 'step_1_complete', {step: 1, status: 'success', inventory_path: latest_inventory})

    # Step 2: Get list of inventory data files from manifest.json
    log(:info, 'step_2_start', {step: 2, action_detail: 'get_inventory_files'})

    inventory_files = get_inventory_files(s3_client, inventory_bucket, latest_inventory)

    if inventory_files.empty?
      log(:warn, 'step_2_complete', {step: 2, status: 'no_manifest', message: 'manifest.json not found'})
      return success_response('No manifest.json found')
    end

    log(:info, 'step_2_complete', {step: 2, status: 'success', file_count: inventory_files.length})

    # Step 3: Get previously processed objects to avoid duplicates
    log(:info, 'step_3_start', {step: 3, action_detail: 'get_processed_objects', table: tracking_table})

    previously_processed = get_previously_processed_objects(dynamodb_client, tracking_table, source_bucket, yesterday)

    log(:info, 'step_3_complete', {step: 3, status: 'success', processed_count: previously_processed.size})

    # Step 4: Process inventory files and filter objects for replication
    log(:info, 'step_4_start', {step: 4, action_detail: 'process_inventory_files'})

    objects_to_replicate = process_inventory_files(
      s3_client,
      inventory_bucket,
      inventory_files,
      yesterday,
      fifteen_minutes_ago,
      previously_processed
    )

    log(:info, 'step_4_complete', {step: 4, status: 'success', objects_to_replicate: objects_to_replicate.length})

    if objects_to_replicate.empty?
      log(:info, 'early_exit', {reason: 'no_new_objects', message: 'No objects to replicate in time window'})
      return success_response('No new objects to replicate')
    end

    # Step 5: Create batch replication manifest CSV
    log(:info, 'step_5_start', {step: 5, action_detail: 'create_manifest'})

    manifest_key = create_replication_manifest(s3_client, inventory_bucket, objects_to_replicate, now)

    log(:info, 'step_5_complete', {step: 5, status: 'success', manifest_key: manifest_key})

    # Step 6: Submit S3 Batch Operations job
    log(:info, 'step_6_start', {step: 6, action_detail: 'submit_batch_job', role: batch_role_arn})

    job_id = submit_batch_replication_job(
      s3control_client,
      account_id,
      destination_bucket,
      batch_role_arn,
      inventory_bucket,
      manifest_key,
      now
    )

    log(:info, 'step_6_complete', {step: 6, status: 'success', job_id: job_id})

    # Step 7: Update tracking table
    log(:info, 'step_7_start', {step: 7, action_detail: 'update_tracking'})

    update_tracking_table(
      dynamodb_client,
      tracking_table,
      source_bucket,
      objects_to_replicate,
      previously_processed,
      job_id,
      now
    )

    log(:info, 'step_7_complete', {step: 7, status: 'success'})

    result = {
      statusCode: 200,
      body: {
        job_id: job_id,
        objects_replicated: objects_to_replicate.length,
        manifest_location: "s3://#{inventory_bucket}/#{manifest_key}"
      }.to_json
    }

    log(:info, 'lambda_success', {
          execution_id: execution_id,
      job_id: job_id,
      objects_count: objects_to_replicate.length
        }
)

    result
  rescue => exception
    log(:error, 'lambda_error', {
          execution_id: execution_id,
      error_class: exception.class.name,
      error_message: exception.message
        }
)

    log(:debug, 'error_backtrace', {backtrace: exception.backtrace})

    raise exception
  end
end

def find_latest_inventory_report(s3_client, inventory_bucket, source_bucket)
  inventory_prefix = "inventory-reports/#{source_bucket}/DailyInventory/"

  log(:debug, 'inventory_search', {prefix: inventory_prefix})

  response = s3_client.list_objects_v2(
    bucket: inventory_bucket,
    prefix: inventory_prefix,
    delimiter: '/'
  )

  return nil unless response.common_prefixes&.any?

  latest_prefix = response.common_prefixes.map(&:prefix).max

  log(:debug, 'inventory_found', {latest_prefix: latest_prefix, total_reports: response.common_prefixes.size})

  latest_prefix
end

def get_inventory_files(s3_client, inventory_bucket, latest_report_prefix)
  log(:debug, 'manifest_search', {prefix: latest_report_prefix})

  response = s3_client.list_objects_v2(
    bucket: inventory_bucket,
    prefix: latest_report_prefix,
    max_keys: 100
  )

  manifest_key = response.contents&.find {|obj| obj.key.end_with?('manifest.json')}&.key
  unless manifest_key
    log(:warn, 'manifest_not_found', {searched_prefix: latest_report_prefix})
    return []
  end

  log(:debug, 'manifest_read', {manifest_key: manifest_key})

  # Read and parse manifest.json
  manifest_obj = s3_client.get_object(bucket: inventory_bucket, key: manifest_key)
  manifest_data = JSON.parse(manifest_obj.body.read)

  files = manifest_data['files'] || []

  log(:debug, 'manifest_parsed', {data_files: files.length})

  files
end

def get_previously_processed_objects(dynamodb_client, tracking_table, source_bucket, yesterday)
  date_key = yesterday.strftime('%Y-%m-%d')

  log(:debug, 'tracking_query', {table: tracking_table, bucket: source_bucket, date: date_key})

  response = dynamodb_client.get_item(
    table_name: tracking_table,
    key: {
      'bucket_name' => {s: source_bucket},
      'date_key' => {s: date_key}
    }
  )

  if response.item&.dig('processed_objects', 'ss')
    processed_set = Set.new(response.item['processed_objects']['ss'])

    log(:debug, 'tracking_found', {processed_objects: processed_set.size})

    processed_set
  else
    log(:debug, 'tracking_empty', {no_previous_data: true})

    Set.new
  end
rescue => exception
  log(:warn, 'tracking_error', {error: exception.message})

  Set.new
end

def process_inventory_files(s3_client, inventory_bucket, inventory_files, yesterday, fifteen_minutes_ago, previously_processed)
  objects_to_replicate = []
  total_checked = 0
  files_processed = 0

  inventory_files.each do |file_info|
    inventory_key = file_info['key']
    files_processed += 1

    log(
      :debug,
      'inventory_file_start',
      {
        file: File.basename(inventory_key),
        progress: "#{files_processed}/#{inventory_files.length}"
      }
    )

    # Download inventory file (handle gzip compression)
    inventory_obj = s3_client.get_object(bucket: inventory_bucket, key: inventory_key)
    content = if inventory_key.end_with?('.gz')
                Zlib::GzipReader.new(inventory_obj.body).read
              else
                inventory_obj.body.read
              end

    rows_in_file = 0
    matches_in_file = 0

    # Parse CSV and filter objects
    CSV.parse(content, headers: false) do |row|
      total_checked += 1
      rows_in_file += 1
      next if row.length < 4  # Skip malformed rows

      bucket_name = row[0]
      object_key = row[1]
      version_id = row[2] && row[2].empty? ? nil : row[2]
      last_modified_str = row[3]

      next unless last_modified_str

      # Parse last modified timestamp
      begin
        last_modified = Time.parse(last_modified_str)
      rescue
        next  # Skip if we can't parse the timestamp
      end

      # Create unique identifier for this object version
      object_id = "#{object_key}##{version_id || 'null'}"

      # Check if object meets our replication criteria
      if last_modified >= yesterday &&
          last_modified <= fifteen_minutes_ago &&
          !previously_processed.include?(object_id)

        objects_to_replicate << {
          bucket: bucket_name,
          key: object_key,
          version_id: version_id,
          object_id: object_id
        }
        matches_in_file += 1
      end

      # Stop processing if we hit our limit to avoid Lambda timeout
      break if total_checked >= 10_000_000
    end

    log(:debug, 'inventory_file_complete', {file: File.basename(inventory_key), rows: rows_in_file, matches: matches_in_file})

    break if total_checked >= 10_000_000
  end

  log(
    :info,
    'inventory_processing_complete',
    {
      files_processed: files_processed,
      total_rows: total_checked,
      objects_to_replicate: objects_to_replicate.length
    }
  )

  objects_to_replicate
end

def create_replication_manifest(s3_client, inventory_bucket, objects_to_replicate, now)
  manifest_key = "batch-manifests/replication-#{now.strftime('%Y%m%d-%H%M%S')}.csv"

  log(:debug, 'manifest_create', {key: manifest_key, object_count: objects_to_replicate.length})

  csv_content = CSV.generate do |csv|
    objects_to_replicate.each do |obj|
      csv << if obj[:version_id]
               [obj[:bucket], obj[:key], obj[:version_id]]
             else
               [obj[:bucket], obj[:key]]
             end
    end
  end

  s3_client.put_object(
    bucket: inventory_bucket,
    key: manifest_key,
    body: csv_content
  )

  log(:debug, 'manifest_uploaded', {size_bytes: csv_content.bytesize})

  manifest_key
end

def submit_batch_replication_job(s3control_client, account_id, dest_bucket, batch_role_arn, inventory_bucket, manifest_key, now)
  log(:debug, 'batch_job_prep', {manifest: manifest_key, dest: dest_bucket})

  # Get ETag for manifest file
  manifest_head = Aws::S3::Client.new.head_object(bucket: inventory_bucket, key: manifest_key)

  response = s3control_client.create_job(
    account_id: account_id,
    confirmation_required: false,
    operation: {
      s3_replicate_object: {
        target_resource: "arn:aws:s3:::#{dest_bucket}",
        canned_access_control_list: 'private',
        metadata_directive: 'COPY'
      }
    },
    manifest: {
      spec: {
        format: 'S3BatchOperations_CSV_20180820',
        fields: ['Bucket', 'Key', 'VersionId']
      },
      location: {
        object_arn: "arn:aws:s3:::#{inventory_bucket}/#{manifest_key}",
        etag: manifest_head.etag
      }
    },
    priority: 10,
    role_arn: batch_role_arn,
    client_request_token: "inventory-replication-#{now.strftime('%Y%m%d-%H%M%S')}",
    report: {
      bucket: "arn:aws:s3:::#{inventory_bucket}",
      format: 'Report_CSV_20180820',
      enabled: true,
      prefix: 'batch-reports/',
      report_scope: 'AllTasks'
    },
    description: "Daily inventory-based batch replication - #{now.strftime('%Y-%m-%d')}"
  )

  log(:debug, 'batch_job_created', {job_id: response.job_id})

  response.job_id
end

def update_tracking_table(dynamodb_client, tracking_table, source_bucket, objects_to_replicate, previously_processed, job_id, now)
  new_object_ids = objects_to_replicate.map {|obj| obj[:object_id]}
  all_processed_objects = (previously_processed.to_a + new_object_ids).last(10_000)  # Keep last 10k

  log(:debug, 'tracking_update', {new_objects: new_object_ids.length, total_tracked: all_processed_objects.length})

  dynamodb_client.put_item(
    table_name: tracking_table,
    item: {
      'bucket_name' => {s: source_bucket},
      'date_key' => {s: now.strftime('%Y-%m-%d')},
      'last_run' => {s: now.iso8601},
      'job_id' => {s: job_id},
      'objects_replicated' => {n: objects_to_replicate.length.to_s},
      'processed_objects' => {ss: all_processed_objects}
    }
  )

  log(:debug, 'tracking_saved', {table: tracking_table})
end

def success_response(message)
  log(:info, 'success_response', {message: message})

  {
    statusCode: 200,
    body: {message: message}.to_json
  }
end
