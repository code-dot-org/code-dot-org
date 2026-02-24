class CreateDataRetentionStatus < ActiveRecord::Migration[6.1]
  def change
    create_table :data_retention_statuses do |t|
      t.belongs_to :user, type: :integer, null: false, foreign_key: true, index: true
      t.datetime :pii_scrubbed_at, null: true, index: true
      t.datetime :anonymized_at, null: true, index: true
      t.timestamps
    end
  end
end
