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
    return [column_name] if column_list.nil?
    raise 'Column already exists' if column_list.include? column_name
    column_list.dup.push(column_name)
  end

  # def TableMetadata.rename_column(column_list, old_name, new_name)
  #   raise 'Column doesnt exist' unless column_list.include? old_name
  #   raise 'Column already exists' if column_list.include? new_name
  #
  #   column_list.map { |x| x == old_name ? new_name : x }
  # end

  class SqlTableMetadata

    def initialize(channel_id, table_name, table_type)
      _, @channel_id = storage_decrypt_channel_id(channel_id)
      @table_name = table_name
      @table_type = table_type

      @table = PEGASUS_DB[:channel_table_metadata]
      @dataset = nil
    end

    def dataset
      @dataset ||= @table.where(channel_id: @channel_id, table_name: @table_name, table_type: @table_type).limit(1)
    end

    def metadata
      dataset.first if dataset
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

    def delete()
      dataset.delete
    end

    def get_column_info
      return nil unless metadata

      column_info = metadata[:column_info]
      return JSON.parse(column_info) unless column_info.nil?
    end

    def set_column_info(column_info)
      if metadata.nil?
        insert(column_info)
      else
        dataset.update({column_info: column_info.to_json, updated_at: DateTime.now})
      end
    end

    def add_column(col_name)
      new_column_info = TableMetadata.add_column(get_column_info, col_name)
      set_column_info(new_column_info)
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
