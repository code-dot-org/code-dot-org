#
# Table
#
require 'csv'
require 'set'
module TableMetadata
  def TableMetadata.generate_column_info(records)
    records.map(&:keys).flatten.uniq
  end

  def TableMetadata.remove_column(column_list, column_name)
    raise 'No such column' unless column_list.include? column_name

    new_list = column_list.dup
    new_list.delete(column_name)
    new_list
  end

  def TableMetadata.add_column(column_list, column_name)
    raise 'Column already exists' if column_list.include? column_name
    column_list.dup.push(column_name)
  end

  class SqlTableMetadata

    def initialize(channel_id, table_name, table_type)
      _, @channel_id = storage_decrypt_channel_id(channel_id)
      @table_name = table_name
      @table_type = table_type

      @table = PEGASUS_DB[:channel_table_metadata]
      @data = nil
    end

    def data
      @data ||= @table.where(channel_id: @channel_id, table_name: @table_name, table_type: @table_type).limit(1).first
    end

    def insert(column_info)
      raise ArgumentError, 'Value is not an array' unless column_info.is_a? Array
      row = {
        channel_id: @channel_id,
        table_type: @table_type,
        table_name: @table_name,
        column_info: column_info.to_json,
        updated_at: DateTime.now
      }

      tries = 0
      begin
        row[:id] = @table.insert(row)
      rescue Sequel::UniqueConstraintViolation
        retry if (tries += 1) < 5
        raise
      end
    end

    def get_column_info
      column_info = @data.slice(:column_info)
      return JSON.parse(column_info) unless column_info.nil?
    end

    def set_column_info(column_info)
      if @data.nil?
        insert(column_info)
      else
        @data.update({column_info: column_info.to_json, updated_at: DateTime.now})
      end
    end
  end

  require 'aws-sdk'

  #
  # DynamoTableMetadata
  #
  class DynamoTableMetadata

    def initialize(channel_id, table_name, table_type)
      _, @channel_id = storage_decrypt_channel_id(channel_id)
      @table_name = table_name
      @table_type = table_type

      @hash = "#{@channel_id}:#{@table_name}:#{@table_type}"
    end

    def db
      @@dynamo_db ||= Aws::DynamoDB::Client.new
    end

    def exists?()
      # TODO
    end
  end
end
