class RemoveJSONEncodingFromDatablockStorageKvps < ActiveRecord::Migration[6.1]
  def up
    DatablockStorageKvp.all.each do |kvp|
      kvp.update!(value: JSON.parse(kvp.value))
    rescue => exception
      message = <<~LOG
        Failed to do the thingy: #{exception.message}

        Traceback:
        #{exception.backtrace.join("\n")}
      LOG
      Rails.logger.warn message
      puts message
    end
  end

  def down
    DatablockStorageKvp.all.each do |kvp|
      kvp.update!(value: kvp.value.to_json)
    end
  end
end
