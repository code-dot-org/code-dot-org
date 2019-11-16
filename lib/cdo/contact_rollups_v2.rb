# Test in rails console:
# load "../lib/cdo/contact_rollups_v2.rb"; load "../lib/cdo/pardot.rb"; ContactRollupsV2.test
# load "../lib/cdo/contact_rollups_v2.rb"; ContactRollupsV2.main

require File.expand_path('../../../pegasus/src/env', __FILE__)
require src_dir 'database'
require_relative '../../deployment'
require 'cdo/pegasus'
require 'cdo/pardot'

class ContactRollupsV2
  # Database names
  PEGASUS_ENV = (Rails.env.production? ? "" : "_#{Rails.env}").freeze
  PEGASUS_DB_NAME = "pegasus#{PEGASUS_ENV}".freeze
  DASHBOARD_DB_NAME = "dashboard_#{Rails.env}".freeze

  # Connection to read from Pegasus production database.
  MAX_EXECUTION_TIME_SEC = 1800.seconds
  PEGASUS_DB_READER ||= sequel_connect(
    CDO.pegasus_db_reader,
    CDO.pegasus_db_reader,
    query_timeout: MAX_EXECUTION_TIME_SEC
  )

  # Connection to write to Pegasus production database.
  PEGASUS_DB_WRITER ||= sequel_connect(
    CDO.pegasus_db_writer,
    CDO.pegasus_db_reader,
    query_timeout: MAX_EXECUTION_TIME_SEC
  )

  # Connection to read from Dashboard reporting database.
  DASHBOARD_DB_READER ||= sequel_connect(
    CDO.dashboard_db_reader,
    CDO.dashboard_db_reader,
    query_timeout: MAX_EXECUTION_TIME_SEC
  )

  def self.create_tables
    # Create crv2_daily table that partition by (date + source table). Index on (email + source + date)
    if PEGASUS_DB_WRITER.table_exists?(:crv2_daily)
      puts "crv2_daily table already exists"
    else
      PEGASUS_DB_WRITER.create_table :crv2_daily do
        primary_key :id
        String :email, null: false
        String :source_table, null: false
        column :data, 'json'
        Date :data_date, null: false
        DateTime :created_at, null: false

        index :email
        index :data_date
        unique [:email, :source_table, :data_date]
      end
      puts "created crv2_daily table"
    end

    # Create crv2_all table, index on email. (optimization: index/partition by data_date)
    if PEGASUS_DB_WRITER.table_exists?(:crv2_all)
      puts "crv2_all table already exists"
    else
      PEGASUS_DB_WRITER.create_table :crv2_all do
        primary_key :id
        String :email, null: false
        column :data, 'json'
        column :data_to_sync, 'json'
        DateTime :data_date, null: false
        Integer :pardot_id
        DateTime :pardot_sync_at
        DateTime :created_at, null: false
        DateTime :updated_at, null: false

        # all the reason why we shouldn't sync an email to externally
        # opt_out is combination of multiple values such as opted_out and opt_in
        # Consideration: Combine them in 2 fields [not_sync], [reason]
        column :email_malformed, 'tinyint(1)'
        column :opt_out, 'tinyint(1)'

        unique :email
      end
      puts "created crv2_all table"
    end

    # TODO: Create tracker tables:
    # Job tracker: What runs, when, result
    # Data tracker: table, data_package, date added, date last updated, number of updates
  end

  def self.drop_tables
    PEGASUS_DB_WRITER.drop_table(:crv2_daily)
    PEGASUS_DB_WRITER.drop_table(:crv2_all)
  end

  def self.empty_tables
    PEGASUS_DB_WRITER.run("delete from crv2_daily")
    PEGASUS_DB_WRITER.run("delete from crv2_all")
  end

  def self.count_table_rows
    puts "crv2_daily total row count = #{PEGASUS_DB_WRITER[:crv2_daily].count}"
    puts "crv2_all total row count = #{PEGASUS_DB_WRITER[:crv2_all].count}"
  end

  def self.collect_data_to_crv2_daily
    # Insert daily changes to crv2_daily
    #   Get emails from user_view table
    #   Get opted_out from pegasus.contacts
    #   Get opt_in from dashboard.email_preferences
    collect_changes_in_users
  end

  # TODO: generalize this function to collect_changes_in_table(table_name)
  def self.collect_changes_in_users
    updated_date_query = <<-SQL.squish
      select distinct DATE(updated_at) as updated_date
      from users_view
      order by updated_date
    SQL

    # get latest processed date. save it to tracker table to retrieve later
    processed_date = Date.new(2019, 9, 15)
    puts "last processed_date = #{processed_date}"

    DASHBOARD_DB_READER[updated_date_query].each do |row|
      date = row[:updated_date]
      next if date < processed_date

      collect_daily_changes_in_users(date)
      processed_date = date
      # update trackers
    end
  end

  # TODO: generalize this to collect_daily_changes_in_table(table_name)
  def self.collect_daily_changes_in_users(date)
    logs = []
    src_table = "#{DASHBOARD_DB_NAME}.users_view"
    logs << "date = #{date}"

    # select daily data from users table. Can use temporary table
    daily_changes_query = <<-SQL.squish
      select email, user_type, school
      from #{src_table}
      where '#{date}' <= updated_at and updated_at < '#{date + 1.day}'
    SQL
    logs << "daily_changes_query = #{daily_changes_query}"
    rows_to_insert = DASHBOARD_DB_READER[daily_changes_query].count
    logs << "number of rows to insert = #{rows_to_insert}"

    # insert daily changes into crv2_daily
    insert_daily_changes_query = <<-SQL.squish
      insert into crv2_daily (email, source_table, data, data_date, created_at)
      select email, '#{src_table}', JSON_OBJECT('user_type', user_type, 'school', school), '#{date}', NOW()
      from #{src_table}
      where '#{date}' <= updated_at and updated_at < '#{date + 1.day}'
    SQL
    logs << "insert_daily_changes_query = #{insert_daily_changes_query}"

    before_count = PEGASUS_DB_WRITER[:crv2_daily].count
    logs << "crv2_daily row count before insert = #{before_count}"

    PEGASUS_DB_WRITER.run(insert_daily_changes_query)

    after_count = PEGASUS_DB_WRITER[:crv2_daily].count
    logs << "crv2_daily row count after insert = #{after_count}"
    logs << "Expect to insert #{rows_to_insert} rows. Actual rows inserted = #{after_count - before_count}"

    if rows_to_insert != after_count - before_count
      raise "Mismatch number of rows inserted!"
    end
  rescue StandardError => e
    puts "Caught error: #{e.message}. Will save to tracker table with logs"
  ensure
    puts "_____collect_daily_changes_in_users_____"
    logs.each {|log| puts log}
  end

  # TODO: generalize to delete_daily_changes_from_table(table_name)
  def self.delete_daily_changes_from_users(date)
    logs = []
    logs << "date = #{date}"
    src_table = "#{DASHBOARD_DB_NAME}.users_view"

    count_rows_to_delete = <<-SQL.squish
      select count(*)
      from crv2_daily
      where source_table = '#{src_table}' and data_date = '#{date}'
    SQL
    logs << "count_rows_to_delete = #{count_rows_to_delete}"

    delete_query = <<-SQL.squish
      delete from crv2_daily
      where source_table = '#{src_table}' and data_date = '#{date}'
    SQL
    logs << "delete_query = #{delete_query}"

    logs << "row count before delete = #{PEGASUS_DB_WRITER[count_rows_to_delete].first.values}"

    PEGASUS_DB_WRITER.run(delete_query)

    logs << "row count after delete = #{PEGASUS_DB_WRITER[count_rows_to_delete].first.values}"

    # TODO: add assertion/raise
    # raise "Mismatch number of rows deleted" if row count after delete > 0, or it deletes more than it shoul
  ensure
    puts "_____delete_daily_changes_from_users_____"
    logs.each {|log| puts log}
  end

  def self.update_data_to_crv2_all
    # Pull 1-day data from crv2_daily to crv2_all
    # Ruby approach:
    #   Process 1 row in daily table at a time.
    #   Find the corresponding row in crv2_all and update it or insert it
    # SQL approach:
    #   Condense daily changes to an email to 1 row.
    #   Join condensed table to crv2_all and update crv2_all data
    # Optimization:
    #   Normalize email to id?

    if PEGASUS_DB_WRITER[:crv2_daily].empty?
      puts "crv2_daily is empty. stop processing"
      return
    end

    # Each data package is defined only by data_date
    daily_data_query = <<-SQL.squish
      select distinct data_date
      from crv2_daily
      order by data_date
    SQL

    PEGASUS_DB_WRITER[daily_data_query].each do |row|
      update_daily_data_to_crv2_all row[:data_date]
    end
  end

  def self.update_daily_data_to_crv2_all(data_date)
    puts "_____update_daily_data_to_crv2_all_____"
    puts "data_date = #{data_date}"

    # Collapse daily data
    data_to_insert_query = <<-SQL.squish
      select email, json_objectagg(source_table, data) as data
      from crv2_daily
      where data_date = '#{data_date}'
      group by email
    SQL
    p data_to_insert_query

    data_to_insert = PEGASUS_DB_WRITER[data_to_insert_query]
    puts "Inserting/updating #{data_to_insert.count} rows to crv2_all"

    # TODO: add counters for post-condition/assertion
    data_to_insert.each do |row|
      email, data = row.values_at(:email, :data)
      current_time = Time.now

      dest = PEGASUS_DB_WRITER[:crv2_all].where(email: email).first
      if dest
        old_data = JSON.parse(dest[:data])
        new_data = old_data.merge(JSON.parse(data))

        if old_data == new_data
          puts "No data change for #{email}"
        else
          update_values = {data: new_data.to_json, updated_at: current_time}
          PEGASUS_DB_WRITER[:crv2_all].where(email: email).update(update_values)

          puts "Updated data for #{email}. Old data: #{dest[:data]}. New data: #{new_data.to_json}"
        end
      else
        insert_values = {
          email: email,
          data: data,
          data_date: data_date,
          created_at: current_time,
          updated_at: current_time
        }
        PEGASUS_DB_WRITER[:crv2_all].insert(insert_values)

        puts "Inserted #{email} into crv2_all"
      end
    end

    # Consider SQL approach:
    # crv2_daily left outer join to crv2_all on email
    # merge crv2_daily.data & crv2_all.data
    # update crv2_all.data
  end

  # Only this part is specific to Pardot. Everything else should be generic
  def self.sync_to_pardot
    # Get pardot id for new emails
    max_pardot_id = 80_999_343    # TODO: remove max_pardot_id in function signature
    Pardot.update_pardot_ids(:crv2_all, max_pardot_id)

    # Sync data to pardot
    new_contact_conditions = <<-SQL.squish
      pardot_id is null and pardot_sync_at is null
      and not(email_malformed <=> 1)
      and not(opt_out <=> 1)
    SQL

    new_contact_config = {
      operation_name: "insert",
      table: :crv2_all,
      where_clause: new_contact_conditions,
      create_prospect_func: :extract_prospect,  # a public class method in Pardot
      pardot_url: Pardot::PARDOT_BATCH_CREATE_URL
    }

    prepare_data_to_sync new_contact_config[:table], new_contact_config[:where_clause]
    Pardot.sync_contacts_with_pardot new_contact_config

    # Get pardot id for the new inserted emails
    Pardot.update_pardot_ids(:crv2_all, max_pardot_id)
  end

  def self.prepare_data_to_sync(table, where_clause)
    PEGASUS_DB_WRITER[table].where(where_clause).each do |row|
      data_to_sync = convert_db_row_to_prospect row
      PEGASUS_DB_WRITER[:crv2_all].where(email: row[:email]).update(data_to_sync: data_to_sync.to_json)
    end
  end

  def self.convert_db_row_to_prospect(row)
    metadata = JSON.parse row[:data]
    collapsed_metadata = collapse_metadata(metadata)
    key_fields = row.slice(:email, :pardot_id)
    prospect_info = convert_metadata_to_prospect(collapsed_metadata.merge(key_fields))

    Pardot.apply_special_fields(collapsed_metadata, prospect_info)

    prospect_info
  end

  def self.collapse_metadata(metadata)
    # Merge values from all sources
    {}.tap do |collapsed_data|
      metadata.values.each do |val|
        collapsed_data.merge!(val) {|subkey| ([] << collapsed_data[subkey] << val[subkey]).flatten}
      end
    end
  end

  def self.convert_metadata_to_prospect(metadata)
    # Translate keys and values to Pardot API format
    {}.tap do |prospect|
      metadata.each_pair do |key, value|
        pardot_info = Pardot::MYSQL_TO_PARDOT_MAP[key.to_sym]
        next unless pardot_info

        # For single data fields, set [field_name] = value.
        # For multi data fields (e.g. multi-select), set keys as [field_name]_0, [field_name]_1, etc.
        if pardot_info[:multi]
          value_array = [value].flatten
          value_array.each_with_index do |item, index|
            prospect["#{pardot_info[:field]}_#{index}"] = item
          end
        else
          prospect[pardot_info[:field]] = value
        end
      end
    end
  end

  def self.main
    create_tables
    collect_data_to_crv2_daily
    update_data_to_crv2_all
    sync_to_pardot
    count_table_rows
  end

  def self.test
    # drop_tables
    # create_tables
    # empty_tables
    # collect_data_to_crv2_daily
    # update_data_to_crv2_all
    sync_to_pardot
    # count_table_rows
    nil
  end
end
