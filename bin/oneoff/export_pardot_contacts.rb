#!/usr/bin/env ruby

# Export Pardot contacts from the main contact_rollups table to CSV files
# to manually upload them to Pardot.
#
# This is a workaround for when we can not upload all the changes to Pardot due to
# daily API limit of 25k queries/day.
#
# Output files are pardot_new_contacts.csv and pardot_updated_contacts.csv.
# Maximum number of rows for each file is 1 million. If there are more than 1m rows,
# it will write to additional files, e.g. pardot_updated_contacts_1.csv.

require_relative '../../deployment'
require 'cdo/pegasus'
require 'cdo/pardot'
require 'set'

PEGASUS_DB_READER = sequel_connect(
  CDO.pegasus_db_reader,
  CDO.pegasus_db_reader,
  query_timeout: 1800.seconds
)

def all_prospect_fields
  pardot_fields = Pardot::MYSQL_TO_PARDOT_MAP.values.pluck(:field)
  special_fields = %w(opted_out is_do_not_email db_Opt_In db_Has_Teacher_Account db_Imported)
  pardot_fields + special_fields
end

# The logic in this function comes directly from Pardot.sync_contacts_with_pardot
# Example input hash:
#   {:email=>"test@email.com", :roles=>"Form Submitter", :opt_in=>nil}
# Example output hash:
#   {"email"=>"test@email.com", "db_Roles_0"=>"Form Submitter", :db_Opt_In=>"No", :db_Imported=>"true"}"
# The keys in output hash can change depends on values of multi-select fields in the input.
def convert_row_to_prospect(row)
  prospect = {}
  Pardot::MYSQL_TO_PARDOT_MAP.each do |mysql_key, pardot_info|
    db_value = row[mysql_key]
    next unless db_value.present?

    if pardot_info[:multi]
      # For multi data fields (multi-select,etc.), we set value names as
      # [field_name]_0, [field_name]_1, etc.
      values = db_value.split(",")
      values.each_with_index do |value, index|
        prospect["#{pardot_info[:field]}_#{index}"] = value
      end
    else
      # For single data fields, just set [field_name] = value.
      prospect[pardot_info[:field]] = db_value
    end
  end

  # Do special handling of a few fields
  Pardot.apply_special_fields(row, prospect)

  prospect.transform_keys(&:to_s)
end

# @return [Array<String>] sorted array of column names
def get_csv_columns(query)
  dataset = PEGASUS_DB_READER[query]

  columns = Set.new
  dataset.stream.each do |row|
    next if row[:email_malformed]
    prospect = convert_row_to_prospect(row)
    columns.merge prospect.keys
  end

  columns.to_a.sort
end

def export_table_to_csv(query, file_path, columns, max_row_count = nil)
  p "Query = #{query}"
  p "Output CSV file = #{file_path}"
  p "Output CSV columns = #{columns}"

  dataset = PEGASUS_DB_READER[query]
  csv = CSV.open(file_path, 'w')
  csv << columns
  row_written = 0
  file_created = 1

  dataset.stream.each do |row|
    next if row[:email_malformed]

    # Create a new csv file if we have reached the maximum row count per file
    if max_row_count && (row_written > 0) && (row_written % max_row_count == 0)
      csv.close

      file_name = file_path[0, file_path.rindex(".csv")]
      suffix = row_written / max_row_count
      csv = CSV.open("#{file_name}_#{suffix}.csv", 'w')
      csv << columns
      file_created += 1
    end

    prospect = convert_row_to_prospect(row)
    csv << prospect.values_at(*columns)
    row_written += 1
  end

  csv.close
  p "Done! #{row_written} row(s) written to #{file_created} file(s)."
end

def main
  new_contact_query = <<-SQL.squish
    select * from contact_rollups
    where pardot_sync_at IS NULL AND pardot_id IS NULL AND opted_out IS NULL
  SQL

  new_contact_columns = get_csv_columns(new_contact_query)
  export_table_to_csv(new_contact_query, "pardot_new_contacts.csv", new_contact_columns, 1_000_000)

  updated_contact_query = <<-SQL.squish
    select * from contact_rollups
    where pardot_id IS NOT NULL AND pardot_sync_at < updated_at
  SQL

  updated_contact_columns = get_csv_columns(updated_contact_query)
  export_table_to_csv(updated_contact_query, "pardot_updated_contacts.csv", updated_contact_columns, 1_000_000)
end

def test
  test_query = <<-SQL.squish
    select * from contact_rollups order by id desc limit 10
  SQL

  csv_columns = get_csv_columns(test_query)
  export_table_to_csv(test_query, "pardot_testa.csv", csv_columns)
  export_table_to_csv(test_query, "pardot_testb.csv", csv_columns, 2)
end

# test
main
