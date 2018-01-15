require_relative './db'

module Metrics
  DEVINTERNAL_DB = sequel_connect(CDO.devinternal_db_writer, CDO.devinternal_db_writer)

  # Values for DTT metrics.
  AUTOMATIC = 0
  MANUAL = 1

  # Insert data into the metrics table.
  def self.write_metric(name, metadata, value, timestamp=nil)
    dataset = DEVINTERNAL_DB[:metrics]
    data = {name: name, metadata: metadata, value: value}
    data[:created_at] = timestamp if timestamp
    dataset.insert(data)
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
