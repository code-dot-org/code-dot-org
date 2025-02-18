class RemoveJSONEncodingFromDatablockStorageKvps < ActiveRecord::Migration[6.1]
  def up
    DatablockStorageKvp.all.each do |kvp|
      kvp.update!(value: JSON.parse(kvp.value))
    rescue => exception
      message = <<~LOG
        Failed to migrate KVP (project_id=#{kvp.project_id}, key=#{kvp.key.inspect})
          Exception: #{exception.message}
          Traceback:
        #{exception.backtrace.join("\n\t\t")}
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
