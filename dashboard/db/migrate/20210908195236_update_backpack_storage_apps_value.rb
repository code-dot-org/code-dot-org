class UpdateBackpackStorageAppsValue < ActiveRecord::Migration[5.2]
  def change
    Backpack.all.each do |backpack|
      storage_app_row = PEGASUS_DB[:storage_apps].where(id: backpack.storage_app_id).first
      if storage_app_row[:value] == "".to_json
        new_value = {hidden: true}.to_json
        PEGASUS_DB[:storage_apps].where(id: backpack.storage_app_id).update(value: new_value)
      end
    end
  end
end
