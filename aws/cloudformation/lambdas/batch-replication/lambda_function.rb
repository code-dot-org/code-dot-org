require 'aws-sdk-s3'
require 'aws-sdk-s3control'
require 'json'
require 'csv'
require 'zlib'
require 'time'
require 'logger'

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

  source_bucket = ENV.fetch('SOURCE_BUCKET', nil)
  destination_bucket = ENV.fetch('DESTINATION_BUCKET', nil)
  ENV.fetch('DESTINATION_ACCOUNT', nil)
  batch_role_arn = ENV.fetch('BATCH_ROLE_ARN', nil)
  inventory_bucket = ENV.fetch('INVENTORY_BUCKET', nil)

  now = Time.now.utc
  fifteen_minutes_ago = now - (15 * 60)

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

  begin
    # Step 1: Find all available inventory reports
    log(:info, 'step_1_start', {step: 1, action_detail: 'find_inventory_reports', inventory_bucket: inventory_bucket})

    all_inventory_reports = find_all_inventory_reports(s3_client, inventory_bucket, source_bucket)

    if all_inventory_reports.empty?
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

    log(:info, 'step_1_complete', {step: 1, status: 'success', total_reports: all_inventory_reports.length})

    # Step 2: Find unprocessed inventory reports
    log(:info, 'step_2_start', {step: 2, action_detail: 'find_unprocessed_reports'})

    unprocessed_reports = find_unprocessed_reports(s3_client, inventory_bucket, source_bucket, all_inventory_reports)

    if unprocessed_reports.empty?
      log(:info, 'step_2_complete', {step: 2, status: 'all_processed', message: 'All inventory reports already processed'})
      return success_response('All inventory reports already processed')
    end

    # Process the oldest unprocessed report (to maintain chronological order)
    inventory_report_to_process = unprocessed_reports.first

    log(
      :info,
      'step_2_complete',
      {
        step: 2,
        status: 'success',
        unprocessed_count: unprocessed_reports.length,
        processing: inventory_report_to_process
      }
    )

    # Step 3: Mark this report as in-progress to prevent concurrent processing
    log(:info, 'step_3_start', {step: 3, action_detail: 'mark_in_progress'})

    mark_report_in_progress(s3_client, inventory_bucket, source_bucket, inventory_report_to_process, execution_id, now)

    log(:info, 'step_3_complete', {step: 3, status: 'success'})

    # Step 4: Get list of inventory data files from manifest.json
    log(:info, 'step_4_start', {step: 4, action_detail: 'get_inventory_files'})

    inventory_files = get_inventory_files(s3_client, inventory_bucket, inventory_report_to_process)

    if inventory_files.empty?
      log(:warn, 'step_4_complete', {step: 4, status: 'no_manifest', message: 'manifest.json not found'})
      mark_report_failed(s3_client, inventory_bucket, source_bucket, inventory_report_to_process, 'no_manifest', execution_id, now)
      return success_response('No manifest.json found')
    end

    log(:info, 'step_4_complete', {step: 4, status: 'success', file_count: inventory_files.length})

    # Step 5: Process inventory files and collect objects for replication
    log(:info, 'step_5_start', {step: 5, action_detail: 'process_inventory_files'})

    # Extract the inventory timestamp from the report path
    # Format: inventory-reports/{bucket}/DailyInventory/{YYYY-MM-DDTHH-MM-SSZ}/
    inventory_timestamp = extract_inventory_timestamp(inventory_report_to_process)

    objects_to_replicate = process_inventory_files(
      s3_client,
      inventory_bucket,
      inventory_files,
      inventory_timestamp,
      fifteen_minutes_ago
    )

    log(:info, 'step_5_complete', {step: 5, status: 'success', objects_to_replicate: objects_to_replicate.length})

    if objects_to_replicate.empty?
      log(:info, 'early_exit', {reason: 'no_new_objects', message: 'No objects to replicate in this inventory'})
      # Mark as successfully processed even though no objects were replicated
      mark_report_completed(s3_client, inventory_bucket, source_bucket, inventory_report_to_process, nil, 0, execution_id, now)
      return success_response('No new objects to replicate in this inventory report')
    end

    # Step 6: Create batch replication manifest CSV
    log(:info, 'step_6_start', {step: 6, action_detail: 'create_manifest'})

    manifest_key = create_replication_manifest(s3_client, inventory_bucket, objects_to_replicate, inventory_report_to_process, now)

    log(:info, 'step_6_complete', {step: 6, status: 'success', manifest_key: manifest_key})

    # Step 7: Submit S3 Batch Operations job
    log(:info, 'step_7_start', {step: 7, action_detail: 'submit_batch_job', role: batch_role_arn})

    job_id = submit_batch_replication_job(
      s3control_client,
      account_id,
      destination_bucket,
      batch_role_arn,
      inventory_bucket,
      manifest_key,
      inventory_report_to_process,
      now
    )

    log(:info, 'step_7_complete', {step: 7, status: 'success', job_id: job_id})

    # Step 8: Mark inventory report as successfully processed
    log(:info, 'step_8_start', {step: 8, action_detail: 'mark_completed'})

    mark_report_completed(
      s3_client,
      inventory_bucket,
      source_bucket,
      inventory_report_to_process,
      job_id,
      objects_to_replicate.length,
      execution_id,
      now
    )

    log(:info, 'step_8_complete', {step: 8, status: 'success'})

    result = {
      statusCode: 200,
      body: {
        job_id: job_id,
        objects_replicated: objects_to_replicate.length,
        manifest_location: "s3://#{inventory_bucket}/#{manifest_key}",
        inventory_report: inventory_report_to_process
      }.to_json
    }

    log(
      :info,
      'lambda_success',
      {
        execution_id: execution_id,
        job_id: job_id,
        objects_count: objects_to_replicate.length,
        inventory_report: inventory_report_to_process
      }
    )

    result
  rescue => exception
    log(
      :error,
      'lambda_error',
      {
        execution_id: execution_id,
        error_class: exception.class.name,
        error_message: exception.message
      }
    )

    log(:debug, 'error_backtrace', {backtrace: exception.backtrace})

    # Try to mark the report as failed if we know which one we were processing
    if defined?(inventory_report_to_process) && inventory_report_to_process
      begin
        mark_report_failed(s3_client, inventory_bucket, source_bucket, inventory_report_to_process, exception.message, execution_id, now)
      rescue => mark_error
        log(:error, 'failed_to_mark_report', {error: mark_error.message})
      end
    end

    raise exception
  end
end

def find_all_inventory_reports(s3_client, inventory_bucket, source_bucket)
  inventory_prefix = "inventory-reports/#{source_bucket}/DailyInventory/"

  log(:debug, 'inventory_search', {prefix: inventory_prefix})

  response = s3_client.list_objects_v2(
    bucket: inventory_bucket,
    prefix: inventory_prefix,
    delimiter: '/'
  )

  return [] unless response.common_prefixes&.any?

  # Sort reports chronologically (oldest first)
  reports = response.common_prefixes.map(&:prefix).sort

  log(:debug, 'inventory_found', {total_reports: reports.size})

  reports
end

def find_unprocessed_reports(s3_client, inventory_bucket, source_bucket, all_reports)
  backup_reports_prefix = "backup-reports/#{source_bucket}/"

  log(:debug, 'checking_processed_reports', {prefix: backup_reports_prefix})

  # Get all completed backup reports
  completed_reports = []
  continuation_token = nil

  loop do
    response = s3_client.list_objects_v2(
      bucket: inventory_bucket,
      prefix: "#{backup_reports_prefix}completed/",
      continuation_token: continuation_token
    )

    response.contents&.each do |obj|
      # Extract the inventory report identifier from the backup report key
      # Format: backup-reports/{bucket}/completed/{inventory-timestamp}/report.json
      if match = obj.key.match(/completed\/([^\/]+)\//)
        completed_reports << match[1]
      end
    end

    break unless response.is_truncated
    continuation_token = response.next_continuation_token
  end

  # Get all in-progress reports (to avoid concurrent processing)
  in_progress_reports = []
  continuation_token = nil

  loop do
    response = s3_client.list_objects_v2(
      bucket: inventory_bucket,
      prefix: "#{backup_reports_prefix}in-progress/",
      continuation_token: continuation_token
    )

    response.contents&.each do |obj|
      if match = obj.key.match(/in-progress\/([^\/]+)\//)
        in_progress_reports << match[1]
      end
    end

    break unless response.is_truncated
    continuation_token = response.next_continuation_token
  end

  processed_reports = (completed_reports + in_progress_reports).uniq

  log(
    :debug,
    'processed_reports_found',
    {
      completed: completed_reports.size,
      in_progress: in_progress_reports.size,
      total_processed: processed_reports.size
    }
  )

  # Find unprocessed reports
  unprocessed = all_reports.reject do |report|
    timestamp = extract_inventory_timestamp(report)
    processed_reports.include?(timestamp)
  end

  log(:info, 'unprocessed_reports', {count: unprocessed.size})

  unprocessed
end

def extract_inventory_timestamp(inventory_report_path)
  # Extract timestamp from path like: inventory-reports/{bucket}/DailyInventory/2024-01-15T00-00-00Z/
  if match = inventory_report_path.match(/DailyInventory\/([^\/]+)\//)
    match[1]
  else
    nil
  end
end

def mark_report_in_progress(s3_client, inventory_bucket, source_bucket, inventory_report, execution_id, now)
  timestamp = extract_inventory_timestamp(inventory_report)
  key = "backup-reports/#{source_bucket}/in-progress/#{timestamp}/#{execution_id}.json"

  metadata = {
    inventory_report: inventory_report,
    started_at: now.iso8601,
    execution_id: execution_id
  }

  s3_client.put_object(
    bucket: inventory_bucket,
    key: key,
    body: metadata.to_json,
    content_type: 'application/json'
  )

  log(:debug, 'marked_in_progress', {key: key})
end

def mark_report_completed(s3_client, inventory_bucket, source_bucket, inventory_report, job_id, objects_count, execution_id, now)
  timestamp = extract_inventory_timestamp(inventory_report)

  # Remove in-progress marker
  in_progress_key = "backup-reports/#{source_bucket}/in-progress/#{timestamp}/#{execution_id}.json"
  begin
    s3_client.delete_object(bucket: inventory_bucket, key: in_progress_key)
  rescue => exception
    log(:warn, 'failed_to_remove_in_progress', {error: exception.message})
  end

  # Create completed marker
  completed_key = "backup-reports/#{source_bucket}/completed/#{timestamp}/report.json"

  metadata = {
    inventory_report: inventory_report,
    completed_at: now.iso8601,
    execution_id: execution_id,
    batch_job_id: job_id,
    objects_replicated: objects_count
  }

  s3_client.put_object(
    bucket: inventory_bucket,
    key: completed_key,
    body: metadata.to_json,
    content_type: 'application/json'
  )

  log(:debug, 'marked_completed', {key: completed_key})
end

def mark_report_failed(s3_client, inventory_bucket, source_bucket, inventory_report, error_message, execution_id, now)
  timestamp = extract_inventory_timestamp(inventory_report)

  # Remove in-progress marker
  in_progress_key = "backup-reports/#{source_bucket}/in-progress/#{timestamp}/#{execution_id}.json"
  begin
    s3_client.delete_object(bucket: inventory_bucket, key: in_progress_key)
  rescue => exception
    log(:warn, 'failed_to_remove_in_progress', {error: exception.message})
  end

  # Create failed marker
  failed_key = "backup-reports/#{source_bucket}/failed/#{timestamp}/#{execution_id}.json"

  metadata = {
    inventory_report: inventory_report,
    failed_at: now.iso8601,
    execution_id: execution_id,
    error: error_message
  }

  s3_client.put_object(
    bucket: inventory_bucket,
    key: failed_key,
    body: metadata.to_json,
    content_type: 'application/json'
  )

  log(:debug, 'marked_failed', {key: failed_key})
end

def get_inventory_files(s3_client, inventory_bucket, inventory_report)
  log(:debug, 'manifest_search', {prefix: inventory_report})

  response = s3_client.list_objects_v2(
    bucket: inventory_bucket,
    prefix: inventory_report,
    max_keys: 100
  )

  manifest_key = response.contents&.find {|obj| obj.key.end_with?('manifest.json')}&.key
  unless manifest_key
    log(:warn, 'manifest_not_found', {searched_prefix: inventory_report})
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

def process_inventory_files(s3_client, inventory_bucket, inventory_files, inventory_timestamp, fifteen_minutes_ago)
  objects_to_replicate = []
  total_checked = 0
  files_processed = 0

  # Parse the inventory timestamp to get the date this inventory was taken
  inventory_date = Time.parse(inventory_timestamp.tr('T', ' ').tr('-', ':'))

  log(
    :info,
    'processing_inventory',
    {
      inventory_date: inventory_date.iso8601,
      cutoff_time: fifteen_minutes_ago.iso8601
    }
  )

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

    # Parse CSV and collect all objects that need replication
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

      # Include all objects modified up to 15 minutes before current time
      # This ensures we don't miss objects that might still be replicating
      if last_modified <= fifteen_minutes_ago
        objects_to_replicate << {
          bucket: bucket_name,
          key: object_key,
          version_id: version_id
        }
        matches_in_file += 1
      end

      # Stop processing if we hit our limit to avoid Lambda timeout
      break if total_checked >= 10_000_000
    end

    log(:debug, 'inventory_file_complete', {
          file: File.basename(inventory_key),
      rows: rows_in_file,
      matches: matches_in_file
        }
)

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

def create_replication_manifest(s3_client, inventory_bucket, objects_to_replicate, inventory_report, now)
  timestamp = extract_inventory_timestamp(inventory_report)
  manifest_key = "batch-manifests/#{timestamp}-#{now.strftime('%Y%m%d-%H%M%S')}.csv"

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

def submit_batch_replication_job(s3control_client, account_id, dest_bucket, batch_role_arn, inventory_bucket, manifest_key, inventory_report, now)
  log(:debug, 'batch_job_prep', {manifest: manifest_key, dest: dest_bucket})

  # Get ETag for manifest file
  manifest_head = Aws::S3::Client.new.head_object(bucket: inventory_bucket, key: manifest_key)

  timestamp = extract_inventory_timestamp(inventory_report)

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
    client_request_token: "inventory-replication-#{timestamp}-#{now.strftime('%Y%m%d-%H%M%S')}",
    report: {
      bucket: "arn:aws:s3:::#{inventory_bucket}",
      format: 'Report_CSV_20180820',
      enabled: true,
      prefix: "batch-reports/#{timestamp}/",
      report_scope: 'AllTasks'
    },
    description: "Inventory-based batch replication for #{timestamp}"
  )

  log(:debug, 'batch_job_created', {job_id: response.job_id})

  response.job_id
end

def success_response(message)
  log(:info, 'success_response', {message: message})

  {
    statusCode: 200,
    body: {message: message}.to_json
  }
end
