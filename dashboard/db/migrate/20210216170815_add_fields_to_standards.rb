class AddFieldsToStandards < ActiveRecord::Migration[5.2]
  def change
    change_table :standards do |t|
      t.references :category
      t.integer :framework_id
      t.string :shortcode
      t.index [:framework_id, :shortcode]
    end
    reversible do |dir|
      dir.up do
        execute "ALTER TABLE standards CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci"
      end
    end
  end
end
