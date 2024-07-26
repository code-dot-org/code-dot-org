class UpdateBackpackStorageAppsValue < ActiveRecord::Migration[5.2]
  def up
    # The following code is disabled because access to PEGASUS_DB from outside
    # of the pegasus or bin directories is not allowed. For more details, see:
    # https://github.com/code-dot-org/code-dot-org/pull/55417

    # PEGASUS_DB[:storage_apps].where(project_type: 'backpack').each do |storage_app|
    #   if storage_app[:value] == "".to_json
    #     new_value = {hidden: true}.to_json
    #     PEGASUS_DB[:storage_apps].where(id: storage_app[:id]).update(value: new_value)
    #   end
    # end
  end
end
