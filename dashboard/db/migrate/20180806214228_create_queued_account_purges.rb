class CreateQueuedAccountPurges < ActiveRecord::Migration[5.0]
  def change
    create_table :queued_account_purges do |t|
      t.belongs_to :user, null: false, foreign_key: true, index: {unique: true}, dependent: :destroy
      t.text :reason_for_review

      t.timestamps
    end
  end
end
