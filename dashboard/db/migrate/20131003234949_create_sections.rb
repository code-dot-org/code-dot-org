class CreateSections < ActiveRecord::Migration
  def change
    create_table :sections do |t|
      t.references :user, null: false
      t.string :name

      t.timestamps
    end

    add_index :sections, [:user_id, :name], unique: true

    add_column(:followers, :section_id, :integer)
  end
end
