class AddModuleColumnToWorkshop < ActiveRecord::Migration[6.1]
  def change
    add_column :pd_workshops, :module, :string
  end
end
