class AddDemoTypeToSections < ActiveRecord::Migration[7.0]
  def change
    add_column :sections, :demo_type, :string
    add_index :sections, [:user_id, :demo_type], unique: true, name: 'index_sections_on_user_id_and_demo_type'
  end
end
