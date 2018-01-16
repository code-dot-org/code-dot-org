require_relative './db'

module Metrics
  DEVINTERNAL_DB = CDO.devinternal_db_writer ?
    sequel_connect(CDO.devinternal_db_writer, CDO.devinternal_db_writer) : nil

  # Insert data into the metrics table.
  def self.write_metric(name, metadata, value, timestamp=nil)
    if DEVINTERNAL_DB
      dataset = DEVINTERNAL_DB[:metrics]
    else
      raise "devinternal_db_writer not defined"
    end
    data = {name: name, metadata: metadata, value: value}
    data[:created_at] = timestamp if timestamp
    dataset.insert(data)
  end
end
