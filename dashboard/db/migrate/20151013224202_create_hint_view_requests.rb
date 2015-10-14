class CreateHintViewRequests < ActiveRecord::Migration
  def change
    create_table :hint_view_requests do |t|
      t.references :user, index: true, foreign_key: true
      t.references :script_level, index: true, foreign_key: true
      t.integer :feedback_type
      t.string :feedback_xml

      t.timestamps null: false
    end
  end
end
