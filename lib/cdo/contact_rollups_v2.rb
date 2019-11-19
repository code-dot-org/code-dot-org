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

  DAILY_TABLE = :crv2_daily
  MAIN_TABLE = :crv2_all

  def self.create_daily_table
    # Create daily table that contains daily changes from source tables
    if PEGASUS_DB_WRITER.table_exists?(DAILY_TABLE)
      puts "#{DAILY_TABLE} table already exists"
    else
      PEGASUS_DB_WRITER.create_table DAILY_TABLE do
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
      puts "Created #{DAILY_TABLE} table"
    end
  end

  def self.create_main_table
    # Create main table that contains latest data we have on emails
    if PEGASUS_DB_WRITER.table_exists?(MAIN_TABLE)
      puts "#{MAIN_TABLE} table already exists"
    else
      PEGASUS_DB_WRITER.create_table MAIN_TABLE do
        primary_key :id
        String :email, null: false
        column :data, 'json'
        column :data_to_sync, 'json'
        DateTime :data_date, null: false
        Integer :pardot_id
        DateTime :pardot_sync_at
        DateTime :created_at, null: false
        DateTime :updated_at, null: false
        # All the reason why we shouldn't try to sync an email externally.
        # opt_out is combination of multiple values such as opted_out and opt_in
        # Consideration: Combine them in 2 fields [not_sync], [reason]
        column :email_malformed, 'tinyint(1)'
        column :opt_out, 'tinyint(1)'

        unique :email
      end
      puts "created #{MAIN_TABLE} table"
    end
  end

  def self.create_tables
    create_daily_table
    create_main_table

    # TODO: Create tracker tables:
    # Job tracker: What runs, when, result
    # Data tracker: table, data_package, date added, date last updated, number of updates
  end

  def self.drop_tables
    PEGASUS_DB_WRITER.drop_table(DAILY_TABLE) if PEGASUS_DB_WRITER.table_exists?(DAILY_TABLE)
    PEGASUS_DB_WRITER.drop_table(MAIN_TABLE) if PEGASUS_DB_WRITER.table_exists?(MAIN_TABLE)
  end

  def self.empty_tables
    PEGASUS_DB_WRITER.run("delete from #{DAILY_TABLE}")
    PEGASUS_DB_WRITER.run("delete from #{MAIN_TABLE}")
  end

  def self.count_table_rows
    puts "#{DAILY_TABLE} total row count = #{PEGASUS_DB_WRITER[DAILY_TABLE].count}"
    puts "#{MAIN_TABLE} total row count = #{PEGASUS_DB_WRITER[MAIN_TABLE].count}"
  end

  def self.collect_data_to_daily_table
    # Insert daily changes to daily table
    #   Get emails from user_view table
    #   Get opted_out from pegasus.contacts
    #   Get opt_in from dashboard.email_preferences
    # collect_all_changes(DASHBOARD_DB_READER, DASHBOARD_DB_NAME, :users_view, [])
    collect_all_changes(PEGASUS_DB_READER, PEGASUS_DB_NAME, :contact_location, [:city, :state, :country])
    collect_all_changes(PEGASUS_DB_READER, PEGASUS_DB_NAME, :contact_multi, [:roles, :ages_taught, :grades_taught])
    collect_all_changes(PEGASUS_DB_READER, PEGASUS_DB_NAME, :contact_mixed, [:country, :roles, :hoc_organizer_years])
  end

  def self.collect_all_changes(db_connection, src_db, src_table, columns)
    updated_date_query = <<-SQL.squish
      select distinct DATE(updated_at) as updated_date
      from #{src_db}.#{src_table}
      order by updated_date
    SQL

    # TODO: get latest processed date from tracker table
    processed_date = Date.new(2019, 9, 15)
    puts "last processed_date = #{processed_date}"

    db_connection[updated_date_query].each do |row|
      date = row[:updated_date]
      next if date < processed_date

      collect_daily_changes(db_connection, src_db, src_table, columns, date)
      processed_date = date

      # TODO: update trackers
    end
  end

  def self.collect_daily_changes(db_connection, src_db, src_table, columns, date)
    logs = []
    logs << "src_db = #{src_db}, src_table = #{src_table}, columns = #{columns}, date = #{date}"

    # Find out how many rows we want to insert
    count_insertion_query = <<-SQL.squish
      select count(*) as row_count
      from #{src_table}
      where '#{date}' <= updated_at and updated_at < '#{date + 1.day}'
    SQL
    logs << "daily_changes_query = #{count_insertion_query}"

    rows_to_insert = db_connection[count_insertion_query].first[:row_count]
    logs << "number of rows to insert = #{rows_to_insert}"

    # Construct insertion query
    json_object_params = columns.map {|col| %W('#{col}' #{col})}.flatten.join(', ')
    insert_daily_changes_query = <<-SQL.squish
      insert into #{DAILY_TABLE} (email, source_table, data, data_date, created_at)
      select email, '#{src_db}.#{src_table}', JSON_OBJECT(#{json_object_params}), '#{date}', NOW()
      from #{src_db}.#{src_table}
      where '#{date}' <= updated_at and updated_at < '#{date + 1.day}'
    SQL
    logs << "insert_daily_changes_query = #{insert_daily_changes_query}"

    # Insert the changes into daily table
    before_count = PEGASUS_DB_WRITER[DAILY_TABLE].count
    logs << "#{DAILY_TABLE} row count before insert = #{before_count}"

    PEGASUS_DB_WRITER.run(insert_daily_changes_query)

    after_count = PEGASUS_DB_WRITER[DAILY_TABLE].count
    logs << "#{DAILY_TABLE} row count after insert = #{after_count}"

    # Check post condition
    logs << "Expect to insert #{rows_to_insert} rows. "\
      "Actual rows inserted = #{after_count - before_count}"
    if rows_to_insert != after_count - before_count
      raise "Mismatch number of rows inserted!"
    end
  rescue StandardError => e
    puts "Caught error: #{e.message}. Will save to tracker table with logs"
    raise e
  ensure
    puts "_____collect_daily_changes_____"
    logs.each {|log| puts log}
  end

  def self.delete_daily_changes(data_date)
    logs = []
    logs << "date = #{data_date}"

    count_deletion_query = <<-SQL.squish
      select count(*) as rowcount
      from #{DAILY_TABLE}
      where data_date = '#{data_date}'
    SQL
    logs << "count_rows_to_delete = #{count_deletion_query}"

    rows_to_delete = PEGASUS_DB_WRITER[count_deletion_query].first[:rowcount]
    logs << "number of rows to delete = #{rows_to_delete}"

    delete_query = <<-SQL.squish
      delete from #{DAILY_TABLE}
      where data_date = '#{data_date}'
    SQL
    logs << "delete_query = #{delete_query}"

    # Delete data from daily table
    before_count = PEGASUS_DB_WRITER[DAILY_TABLE].count
    logs << "#{DAILY_TABLE} row count before insert = #{before_count}"

    PEGASUS_DB_WRITER.run(delete_query)

    after_count = PEGASUS_DB_WRITER[DAILY_TABLE].count
    logs << "#{DAILY_TABLE} row count after insert = #{after_count}"

    # Check post condition
    logs << "Expect to delete #{rows_to_delete} rows. "\
      "Actual rows deleted = #{before_count - after_count}"
    if rows_to_delete != before_count - after_count
      raise "Mismatch number of rows deleted!"
    end
  ensure
    puts "_____delete_daily_changes_____"
    logs.each {|log| puts log}
  end

  def self.update_data_to_main_table
    # Pull 1-day data from daily table to main table
    # Ruby approach:
    #   Process 1 row in daily table at a time.
    #   Find the corresponding row in main table and update it or insert it
    # SQL approach:
    #   Condense daily changes to an email to 1 row.
    #   Join condensed table to main and update main table data
    # Optimization:
    #   Normalize email to id?

    if PEGASUS_DB_WRITER[DAILY_TABLE].empty?
      puts "#{DAILY_TABLE} is empty. stop processing"
      return
    end

    # Each data package is defined only by data_date
    daily_data_query = <<-SQL.squish
      select distinct data_date
      from #{DAILY_TABLE}
      order by data_date
    SQL

    PEGASUS_DB_WRITER[daily_data_query].each do |row|
      update_daily_data_to_main_table row[:data_date]
    end
  end

  def self.update_daily_data_to_main_table(data_date)
    puts "_____update_daily_data_to_main_table_____"
    puts "data_date = #{data_date}"

    # Count number of rows to update/insert to main table
    count_updates_query = <<-SQL.squish
      select count(distinct email) as email_count
      from #{DAILY_TABLE}
      where data_date = '#{data_date}'
    SQL
    rows_to_update = PEGASUS_DB_WRITER[count_updates_query].first[:email_count]
    puts "rows_to_update = #{rows_to_update}"

    # Collapse daily data
    data_to_update = <<-SQL.squish
      select email, json_objectagg(source_table, data) as data
      from #{DAILY_TABLE}
      where data_date = '#{data_date}'
      group by email
    SQL
    puts "#{data_to_update} = data_to_insert_query"

    # Update/insert data in main table
    insert_count = 0
    update_count = 0
    no_change_count = 0
    PEGASUS_DB_WRITER[data_to_update].each do |row|
      # All strings in main table are in lower case.
      # Always downcase strings before making comparison.
      email, data = row.values_at(:email, :data).map(&:downcase)
      current_time = Time.now

      dest = PEGASUS_DB_WRITER[MAIN_TABLE].where(email: email).first
      if dest
        old_data = JSON.parse(dest[:data].downcase)
        new_data = old_data.merge(JSON.parse(data))

        if old_data == new_data
          no_change_count += 1
          puts "No data change for #{email}"
        else
          update_values = {data: new_data.to_json, updated_at: current_time}
          PEGASUS_DB_WRITER[MAIN_TABLE].where(email: email).update(update_values)
          update_count += 1

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
        PEGASUS_DB_WRITER[MAIN_TABLE].insert(insert_values)
        insert_count += 1

        puts "Inserted #{email} into #{MAIN_TABLE}"
      end
    end

    puts "Expect to process #{rows_to_update} rows. "\
      "Actual rows processed = #{insert_count + update_count + no_change_count}. "\
      "insert_count = #{insert_count}, update_count = #{update_count}, no_change_count = #{no_change_count}."

    if rows_to_update != insert_count + update_count + no_change_count
      raise 'Mismatch number of rows processed'
    end
  end

  # Only this part is specific to Pardot. Everything else should be generic
  def self.sync_to_pardot
    # Get pardot id for new emails
    max_pardot_id = 80_999_343    # TODO: remove max_pardot_id in function signature
    Pardot.update_pardot_ids(MAIN_TABLE, max_pardot_id)

    sync_new_contacts_to_pardot
    sync_updated_contacts_to_pardot

    # Get pardot id for the new inserted emails
    Pardot.update_pardot_ids(MAIN_TABLE, max_pardot_id)
  end

  def self.sync_new_contacts_to_pardot
    # Sync data to pardot
    new_contact_conditions = <<-SQL.squish
      pardot_id is null and pardot_sync_at is null
      and not(email_malformed <=> 1)
      and not(opt_out <=> 1)
    SQL

    new_contact_config = {
      operation_name: "insert",
      table: MAIN_TABLE,
      where_clause: new_contact_conditions,
      create_prospect_func: :extract_prospect,  # a public class method in Pardot
      pardot_url: Pardot::PARDOT_BATCH_CREATE_URL
    }

    prepare_data_to_sync new_contact_config[:table], new_contact_config[:where_clause]
    Pardot.sync_contacts_with_pardot new_contact_config
  end

  def self.sync_updated_contacts_to_pardot
    updated_contact_conditions = <<-SQL.squish
      pardot_id is not null and pardot_sync_at < updated_at
      and not(email_malformed <=> 1)
      and not(opt_out <=> 1)
    SQL

    updated_contact_config = {
      operation_name: "update",
      table: MAIN_TABLE,
      where_clause: updated_contact_conditions,
      create_prospect_func: :extract_prospect,  # a public class method in Pardot
      pardot_url: Pardot::PARDOT_BATCH_UPDATE_URL
    }

    prepare_data_to_sync updated_contact_config[:table], updated_contact_config[:where_clause]
    Pardot.sync_contacts_with_pardot updated_contact_config
  end

  def self.prepare_data_to_sync(table, where_clause)
    PEGASUS_DB_WRITER[table].where(where_clause).each do |row|
      data_to_sync = convert_db_row_to_prospect row
      puts "data_to_sync = #{data_to_sync}"
      PEGASUS_DB_WRITER[MAIN_TABLE].where(email: row[:email]).update(data_to_sync: data_to_sync.to_json)
    end
  end

  def self.convert_db_row_to_prospect(row)
    metadata = JSON.parse row[:data]
    collapsed_metadata = collapse_metadata(metadata)
    deduplicated_metadata = deduplicate_metadata(collapsed_metadata)

    key_fields = row.slice(:email, :pardot_id)
    prospect_info = convert_metadata_to_prospect(deduplicated_metadata.merge(key_fields))

    Pardot.apply_special_fields(deduplicated_metadata, prospect_info)

    prospect_info
  end

  def self.collapse_metadata(metadata)
    # Merge values from all sources
    {}.tap do |collapsed_data|
      metadata.values.each do |data_from_src_table|
        # If a key appears in 2 or more source tables, merge its values from all tables into an array.
        # There is no logic to prefer data from one table over others.
        collapsed_data.merge!(data_from_src_table) do |key|
          ([] << collapsed_data[key] << data_from_src_table[key]).flatten
        end
      end
    end
  end

  def self.deduplicate_metadata(metadata)
    metadata.transform_values do |val|
      # val could be a single value (e.g. 1), a single string of multiple values (e.g. "1,2,3")
      # or an array of values (e.g. [1, 2] or ["1", "2,3"]).
      # We want to take out all the individual values and deduplicate them.
      # For example, if val = [1, "1,2", "2", "3,2,1"], we want to reduce it to ['1','2','3'].
      val_str = val.is_a?(Array) ? val.flatten.join(',') : val.to_s
      val_items = val_str.split(',')
      Set.new(val_items).to_a.join(',')
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
          value_items = value.split(',')
          value_items.each_with_index do |item, index|
            prospect["#{pardot_info[:field]}_#{index}"] = item
          end
        else
          prospect[pardot_info[:field]] = value
        end
      end
    end
  end

  PARDOT_LOOKUP_TABLE = :pardot_lookup

  def self.build_pardot_lookup_table
    # Create table
    # This table can be the seed for any new contact rollups table if we decide to rebuild it.
    if PEGASUS_DB_WRITER.table_exists?(PARDOT_LOOKUP_TABLE)
      puts "#{PARDOT_LOOKUP_TABLE} table already exists"
    else
      PEGASUS_DB_WRITER.create_table PARDOT_LOOKUP_TABLE do
        primary_key :id
        String :email, null: false
        Integer :pardot_id, null: false

        index :email
        unique [:email, :pardot_id]
      end
      puts "created #{PARDOT_LOOKUP_TABLE} table"
    end

    # Query Pardot to get data
    Pardot.download_pardot_ids PARDOT_LOOKUP_TABLE
  end

  def self.main
    create_tables
    collect_data_to_daily_table
    update_data_to_main_table
    sync_to_pardot
    count_table_rows
  end

  def self.test
    # drop_tables
    # create_tables
    # empty_tables
    # collect_data_to_daily_table
    # update_data_to_main_table
    # delete_daily_changes('2019-11-11')
    # sync_to_pardot
    # count_table_rows
    build_pardot_lookup_table
    nil
  end
end
