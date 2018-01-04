class AddPropertiesToPdApplicationApplicationBase < ActiveRecord::Migration[5.0]
  def change
    add_column :pd_applications, :properties, :text
  end
end
