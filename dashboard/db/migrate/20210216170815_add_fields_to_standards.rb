class AddFieldsToStandards < ActiveRecord::Migration[5.2]
  def change
    change_table :standards do |t|
      t.references :category
      t.integer :framework_id
      t.string :shortcode
      t.index [:framework_id, :shortcode]
    end
  end
end
