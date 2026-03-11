require "cdo/aws/s3"
require "redis"

class ServerStatus
  S3_BUCKET = "cdo-v3-sources".freeze
  S3_KEY = "sources_development/k8s-dashboard-mimic.deteleme".freeze

  def db_connection
    db_health_check[:message]
  end

  def db_health_check
    connection = ActiveRecord::Base.connection
    connection.active?
    {ok: true, message: "connected"}
  rescue StandardError
    {ok: false, message: "not connected"}
  end

  def read_data_docs_sql_table
    name = DataDoc.where(key: "100-birds").pick(:name)
    name == "100 Birds of the World"
  rescue StandardError
    false
  end

  def redis_connection
    Redis.new(url: CDO.redis_url).ping == "PONG" ? "connected" : "not connected"
  rescue StandardError
    "not connected"
  end

  def s3_status
    client = AWS::S3.create_client
    status = {
      connected: false,
      read: false,
      write: false
    }

    client.list_buckets
    status[:connected] = true

    client.list_objects_v2(bucket: S3_BUCKET, max_keys: 1)
    status[:read] = true
    status
  rescue StandardError
    status || {
      connected: false,
      read: false,
      write: false
    }
  end
end
