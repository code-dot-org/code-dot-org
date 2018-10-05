class CreatePdApplicationEmails < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_application_emails do |t|
      t.belongs_to :pd_application, null: false, foreign_key: true, index: true, dependent: :destroy
      t.string :application_status, null: false
      t.string :email_type, null: false
      t.string :to, null: false
      t.datetime :created_at, null: false
      t.datetime :sent_at
    end
  end
end
