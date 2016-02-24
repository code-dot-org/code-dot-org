#
# Table
#
require 'csv'
require 'set'
module TableMetadata
  def TableMetadata.generate_column_metadata(records)
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
    end

    def exists?()
      !@table.where(app_id: @channel_id, storage_id: @storage_id, table_name: @table_name).limit(1).first.nil?
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
