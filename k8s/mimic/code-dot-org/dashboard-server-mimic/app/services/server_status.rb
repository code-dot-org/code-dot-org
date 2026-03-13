require "cdo/aws/s3"
require "mysql2"
require "redis"

class ServerStatus
  S3_BUCKET = "cdo-v3-sources".freeze
  S3_KEY = "sources_development/k8s-dashboard-mimic.deteleme".freeze

  def mysql_status
    config = ActiveRecord::Base.configurations.configs_for(env_name: Rails.env, name: "primary").configuration_hash
    db_name = config[:database]
    client = Mysql2::Client.new(
      host: config[:host],
      port: config[:port],
      username: config[:username],
      password: config[:password]
    )
    db_found = client.query("SHOW DATABASES LIKE '#{db_name}'").any?
    populated = db_found && client.query("SELECT 1 FROM `#{db_name}`.data_docs LIMIT 1").any?

    {
      connected: true,
      db_name: db_name,
      db_found: db_found,
      populated: populated
    }
  rescue StandardError
    {
      connected: false,
      db_name: config&.dig(:database),
      db_found: false,
      populated: false
    }
  end

  def redis_status
    {connected: Redis.new(url: CDO.redis_url).ping == "PONG"}
  rescue StandardError
    {connected: false}
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
