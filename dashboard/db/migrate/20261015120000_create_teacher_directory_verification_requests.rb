class CreateTeacherDirectoryVerificationRequests < ActiveRecord::Migration[7.0]
  def change
    create_table :teacher_directory_verification_requests, charset: "utf8mb4", collation: "utf8mb4_unicode_ci" do |t|
      t.bigint :user_id, null: false
      t.string :school_id, limit: 12, null: false
      t.string :school_name, null: false
      t.string :email, null: false
      t.string :status, null: false, default: "pending_confirmation"
      t.string :evidence_url, limit: 2048, null: false
      t.string :evidence_title
      t.string :evidence_email, null: false
      t.string :token_digest, limit: 64
      t.datetime :token_expires_at
      t.datetime :confirmed_at
      t.string :ticket_external_id, limit: 36, null: false
      t.string :zendesk_ticket_id
      t.datetime :purge_after, null: false

      t.timestamps

      t.index :token_digest, unique: true, name: 'idx_teacher_dir_verif_token'
      t.index :ticket_external_id, unique: true, name: 'idx_teacher_dir_verif_ticket'
      t.index :user_id, unique: true, name: 'idx_teacher_dir_verif_user'
      t.index :purge_after, name: 'idx_teacher_dir_verif_purge'
    end
  end
end
