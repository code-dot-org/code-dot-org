class AddHiddenToSections < ActiveRecord::Migration[5.0]
  def change
    unless ActiveRecord::Base.connection.column_exists?(:sections, :hidden)
      add_column :sections, :hidden, :boolean, null: false, default: false
    end
  end
end
