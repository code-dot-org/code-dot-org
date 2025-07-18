class CreateOrganizations < ActiveRecord::Migration[6.1]
  def change
    create_table :organizations do |t|
      t.string :name
      t.string :domain
      t.integer :session_length

      t.timestamps
    end

    add_index :organizations, :name
    add_index :organizations, :domain, unique: true
  end
end
