require_relative './db'

module Metrics
  def self.devinternal_db
    raise "devinternal_db_writer not defined" unless CDO.devinternal_db_writer

    # Connect to db. Third param sets frequency to check connection. Currently set
    # to check before each request to db.
    @@devinternal_db ||=
      sequel_connect(CDO.devinternal_db_writer, CDO.devinternal_db_writer, validation_frequency: -1)
  end

  # Values for DTT metrics.
  AUTOMATIC = 0
  MANUAL = 1

  # Insert new row into the metrics table.
  # @param name [String] The name of the metric.
  # @param metadata [String] Data relevant to the specific metric. For example, the commit hash for DTT metrics.
  # @param value [Float] Numerical value relevant to the specific metric. See constants above for examples.
  # @param timestamp [Datetime] Only used if we want to explicitly set the created_at value for a particular metric, otherwise it is automatically populated.
  def self.write_metric(name, metadata, value, timestamp = nil)
    return if rack_env == :production
    dataset = devinternal_db[:metrics]
    data = {name: name, metadata: metadata, value: value}
    data[:created_at] = timestamp if timestamp
    dataset.insert(data)
  end

  # Insert multiple new rows into the metrics table.
  # @param rows [Hash[]] The rows to insert
  # @param row[:name] [String] The name of the metric.
  # @param row[:metadata] [String] Data relevant to the specific metric. For example, the commit hash for DTT metrics.
  # @param row[:value] [Float] Numerical value relevant to the specific metric. See constants above for examples.
  # @param row[:timestamp] [Datetime] Only used if we want to explicitly set the created_at value for a particular metric, otherwise it is automatically populated.
  def self.write_batch_metric(rows)
    return if rack_env == :production
    dataset = devinternal_db[:metrics]
    dataset.multi_insert(rows)
  end
end

# Summary of the data currently being logged in the metrics table:
# -----------------------------------------------------------------------------
# |       name        |          metadata           |          value           |
# -----------------------------------------------------------------------------
# |    dtt_start      |        commit hash          |  0 - if automatic        |
# |                   |                             |  1 - if manual           |
# |----------------------------------------------------------------------------|
# |    dtt_green      |        commit hash          |  0 - if automatic        |
# |                   |                             |  1 - if manual           |
# |----------------------------------------------------------------------------|
# |    dtt_red        |        commit hash          |  1 - always manual       |
# |----------------------------------------------------------------------------|
# |    bundle_size    |        bundle filename      |  size in bytes           |
# |----------------------------------------------------------------------------|
