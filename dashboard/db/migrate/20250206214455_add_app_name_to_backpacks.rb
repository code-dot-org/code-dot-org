class AddAppNameToBackpacks < ActiveRecord::Migration[6.1]
  def change
    add_column :backpacks, :app_name, :string

    reversible do |dir|
      dir.up do
        Backpack.reset_column_information
        Backpack.update_all(app_name: 'javalab')
      end
    end
  end
end
