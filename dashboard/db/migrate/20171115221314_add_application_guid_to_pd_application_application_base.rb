class AddApplicationGuidToPdApplicationApplicationBase < ActiveRecord::Migration[5.0]
  def change
    add_column :pd_applications, :application_guid, :string
    add_index :pd_applications, :application_guid
  end
end
