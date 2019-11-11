#load "../lib/cdo/cr_new.rb"
#CRNew.test
#CRNew.main

require_relative '../../deployment'
require 'cdo/pegasus'
require 'cdo/pardot'
require 'set'

class CRNew
  PEGASUS_ENV = (Rails.env.production? ? "" : "_#{Rails.env}").freeze
  PEGASUS_DB_NAME = "pegasus#{PEGASUS_ENV}".freeze
  DASHBOARD_DB_NAME = "dashboard_#{Rails.env}".freeze

  MAX_EXECUTION_TIME_SEC = 1800.seconds

  # Connection to read from Pegasus production database.
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
    # Create cr_daily_raw table that partition by (date + source table). Index on (email + source + date)

    # PEGASUS_DB_WRITER.table_exists?(:cr_daily)
    # PEGASUS_DB_WRITER[:cr_daily].count
    # PEGASUS_DB_WRITER[:cr_daily].all
    # PEGASUS_DB_WRITER.drop_table(:cr_daily)
    # PEGASUS_DB_WRITER.schema(:cr_daily)
    if PEGASUS_DB_WRITER.table_exists?(:cr_daily)
      p "cr_daily table already exists"
    else
      PEGASUS_DB_WRITER.create_table :cr_daily do
        primary_key :id
        String :email, null: false
        String :source_table, null: false
        String :data
        Date :data_date, null: false
        DateTime :created_at, null: false

        index :email
        index [:source_table, :data_date]
        unique [:email, :source_table, :data_date]
      end
      p "created cr_daily table"
    end

    # Create cr_all table, index on email. (optimization: index/partition by data_date)
    # PEGASUS_DB_WRITER.drop_table(:cr_all)
    # PEGASUS_DB_WRITER.schema(:cr_all)
    if PEGASUS_DB_WRITER.table_exists?(:cr_all)
      p "cr_all table already exists"
    else
      PEGASUS_DB_WRITER.create_table :cr_all do
        primary_key :id
        String :email, null: false
        String :data_final
        String :data
        DateTime :data_date, null: false
        Integer :pardot_id
        DateTime :pardot_sync_at
        DateTime :created_at, null: false
        DateTime :updated_at, null: false

        unique :email
      end
      p "created cr_all table"
    end

    # Create tracker tables:
    # Job tracker: What runs, when, result
    # Data tracker: table, data_package, date added, date last updated, number of updates
  end

  def self.collect_data_to_cr_daily
    collect_changes_in_users
  end

  def self.collect_changes_in_users
    # get latest processed date. save it to tracker table to retrieve later
    processed_date = Date.new(2019, 9, 15)
    p "last processed_date = #{processed_date}"

    # get max date
    # DASHBOARD_DB_READER[:users_view].where{updated_at < t}

    updated_date_query = <<-SQL.squish
      select distinct DATE(updated_at) as updated_date
      from users_view
      order by updated_date
    SQL

    DASHBOARD_DB_READER[updated_date_query].each do |row|
      date = row[:updated_date]
      next if date < processed_date

      collect_daily_changes_in_users(date)
      processed_date = date
    end

    # what date(s) to process. (use max date and last successfully processed date as range)
    # process one date at a time
    # update trackers
  end

  #load "../lib/cdo/cr_new.rb"; CRNew.test
  def self.collect_daily_changes_in_users(date)
    # Can be generalize to extract daily changes from any table and insert data to cr_daily
    # The logic is the same

    # select from users with date filter, insert into cr_daily_raw
    logs = []
    logs << "date = #{date}"
    src_table = "#{DASHBOARD_DB_NAME}.users_view"

    daily_changes_query = <<-SQL.squish
      select email, user_type, school
      from #{src_table}
      where '#{date}' <= updated_at and updated_at < '#{date + 1.day}'
    SQL
    logs << "daily_changes_query = #{daily_changes_query}"
    rows_to_insert = DASHBOARD_DB_READER[daily_changes_query].count
    logs << "number of rows to insert = #{rows_to_insert}"

    insert_daily_changes_query = <<-SQL.squish
      insert into cr_daily (email, source_table, data, data_date, created_at)
      select email, '#{src_table}', JSON_OBJECT('user_type', user_type, 'school', school), '#{date}', NOW()
      from #{src_table}
      where '#{date}' <= updated_at and updated_at < '#{date + 1.day}'
    SQL
    logs << "insert_daily_changes_query = #{insert_daily_changes_query}"

    before_count = PEGASUS_DB_WRITER[:cr_daily].count
    logs << "cr_daily row count before insert = #{before_count}"

    PEGASUS_DB_WRITER.run(insert_daily_changes_query)

    after_count = PEGASUS_DB_WRITER[:cr_daily].count
    logs << "cr_daily row count after insert = #{after_count}"
    logs << "Expect to insert #{rows_to_insert} rows. Actual rows inserted = #{after_count - before_count}"

    if rows_to_insert != after_count - before_count
      raise "Mismatch number of rows inserted!"
    end
  rescue StandardError => e
    p "Caught error: #{e.message}. Will save to tracker table with logs"
  ensure
    p "+++++collect_daily_changes_in_users++++"
    logs.each {|log| p log}
  end

  def self.delete_daily_changes_in_users(date)
    # Can be generalize to delete any daily changes, not just changes from users_view table
    logs = []
    logs << "date = #{date}"
    src_table = "#{DASHBOARD_DB_NAME}.users_view"

    count_rows_to_delete = <<-SQL.squish
      select count(*)
      from cr_daily
      where source_table = '#{src_table}' and data_date = '#{date}'
    SQL
    logs << "count_rows_to_delete = #{count_rows_to_delete}"

    delete_query = <<-SQL.squish
      delete from cr_daily
      where source_table = '#{src_table}' and data_date = '#{date}'
    SQL
    logs << "delete_query = #{delete_query}"

    logs << "row count before delete = #{PEGASUS_DB_WRITER[count_rows_to_delete].first.values}"

    PEGASUS_DB_WRITER.run(delete_query)

    logs << "row count after delete = #{PEGASUS_DB_WRITER[count_rows_to_delete].first.values}"
    # TODO: add assertion/raise
  ensure
    p "+++++delete_daily_changes_in_users++++"
    logs.each {|log| p log}
  end

  def self.clean_tables
    PEGASUS_DB_WRITER.run("delete from cr_daily")
    PEGASUS_DB_WRITER.run("delete from cr_all")
  end

  def self.count_table_rows
    p "cr_daily total row count = #{PEGASUS_DB_WRITER[:cr_daily].count}"
    p "cr_all total row count = #{PEGASUS_DB_WRITER[:cr_all].count}"
  end

  #load "../lib/cdo/cr_new.rb"; CRNew.test
  def self.update_data_to_cr_all
    unless PEGASUS_DB_WRITER[:cr_daily].first
      p "cr_daily is empty. stop processing"
      return
    end

    # find all packages to insert. Each daily package is defined by source_table and data_date
    package_query = <<-SQL.squish
      select distinct source_table, data_date
      from cr_daily
      order by data_date, source_table
    SQL

    PEGASUS_DB_WRITER[package_query].each do |row|
      source_table, data_date = row.values_at(:source_table, :data_date)
      update_daily_data_to_cr_all source_table, data_date
    end
  end

  def self.update_daily_data_to_cr_all(source_table, data_date)
    p "+++++update_daily_data_to_cr_all+++++"

    data_to_insert_query = <<-SQL.squish
      select * from cr_daily
      where source_table = '#{source_table}' and data_date = '#{data_date}'
    SQL
    p data_to_insert_query
    # p "source_table = #{source_table}; data_date = #{data_date}"

    # merge_query = <<-SQL.squish
    #   select * from cr_daily
    #   where source_table = '#{source_table}' and data_date = '#{data_date}'
    # SQL

    # cr_daily left outer join to cr_all on email
    # merge cr_daily.data & cr_all.data
    # update cr_all.data

    # join_query = <<-SQL.squish
    #   select cr_daily.email, cr_daily.data, cr_all.data as cr_all_data
    #   from cr_daily
    #   left outer join cr_all
    #   on cr_daily.email = cr_all.email
    # SQL
    #
    # PEGASUS_DB_WRITER[join_query].to_a
    # PEGASUS_DB_WRITER[:cr_daily].left_outer_join(:cr_all, email: :email).sql
    # PEGASUS_DB_WRITER[:cr_daily].join(:cr_all, email: :email).sql
  end

  def self.sync_to_pardot
  end

  def self.main
    create_tables

    # Step 1: insert new data to cr_daily_raw table
    # Get emails from user_view table
    # Get opt_in from dashboard.email_preferences
    # Get opted_out from pegasus.contacts
    collect_data_to_cr_daily

    # (optimization: Normalize email to id?)
    # (optimization: Condense daily changes to an email to 1 row)

    # Step 2: pull 1-day data from cr_daily_raw table into cr_all
    # Process 1 row in daily table at a time. Find the corresponding row in cr_all and update it or insert it
    update_data_to_cr_all

    # Step 3:
    # Get latest pardot id for email
    # Sync new changes to pardot
    # Get pardot id for the new records
    sync_to_pardot
  end

  #load "../lib/cdo/cr_new.rb"; CRNew.test
  def self.test
    create_tables

    # clean_tables
    # collect_changes_in_users
    update_data_to_cr_all

    # date = Date.new(2019, 9, 19)
    # delete_daily_changes_in_users(date)
    # collect_daily_changes_in_users(date)

    count_table_rows
    nil
  end
end
