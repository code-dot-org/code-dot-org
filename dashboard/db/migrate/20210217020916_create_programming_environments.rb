class CreateProgrammingEnvironments < ActiveRecord::Migration[5.2]
  def change
    create_table :programming_environments do |t|
      t.string :name, null: false
      t.text :properties

      t.timestamps
    end
    reversible do |dir|
      dir.up do
        execute "ALTER TABLE programming_environments CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci"
      end
    end
  end
end
