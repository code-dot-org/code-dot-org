class CreateProgrammingExpressions < ActiveRecord::Migration[5.2]
  def change
    create_table :programming_expressions do |t|
      t.string :name, null: false
      t.string :category
      t.text :properties
      t.references :programming_environment, null: false

      t.timestamps
    end
    reversible do |dir|
      dir.up do
        execute "ALTER TABLE programming_expressions CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci"
      end
    end
  end
end
