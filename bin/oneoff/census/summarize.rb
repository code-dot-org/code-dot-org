#!/usr/bin/env ruby

require_relative '../../../dashboard/config/environment'

CDO.log = Logger.new(STDOUT)

cols = %w(school_id school_year teaches_cs audit_data)
CSV($stdout) do |csv|
  csv << cols
  Census::CensusSummary.summarize_census_data do |summary|
    csv << cols.map {|col| summary[col]}
  end
end
