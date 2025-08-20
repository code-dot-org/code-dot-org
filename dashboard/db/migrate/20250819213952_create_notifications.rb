class CreateNotifications < ActiveRecord::Migration[6.1]
  def change
    create_table :notifications do |t|
      t.belongs_to :user, type: :integer, null: false, foreign_key: true, index: true
      t.string :message, null: false
      t.string :source, null: false
      t.timestamps
    end
  end
end
