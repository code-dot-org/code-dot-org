require_relative './db'

module Metrics
  DEVINTERNAL_DB = sequel_connect(CDO.devinternal_db_writer, CDO.devinternal_db_writer)

  # Insert data into the metrics table.
  def self.write_metric(name, metadata, value, timestamp=nil)
    dataset = DEVINTERNAL_DB[:metrics]
    data = {name: name, metadata: metadata, value: value}
    data[:created_at] = timestamp if timestamp
    dataset.insert(data)
  end
end
