class CreateStudentLoginBadges < ActiveRecord::Migration[7.0]
  def change
    create_table :student_login_badges do |t|
      t.integer :user_id, null: false
      t.string :public_id, limit: 32, null: false
      t.integer :generation, null: false, default: 1
      t.string :secret_digest, limit: 64, null: false
      t.binary :encrypted_secret
      t.string :key_version, limit: 32, null: false
      t.integer :issuer_id, null: false
      t.integer :section_id, null: false
      t.datetime :issued_at, null: false
      t.datetime :expires_at, null: false
      t.datetime :revoked_at
      t.timestamps
    end
    add_index :student_login_badges, :user_id, unique: true
    add_index :student_login_badges, :public_id, unique: true

    create_table :student_login_badge_events do |t|
      t.integer :user_id, null: false
      t.integer :actor_id, null: false
      t.string :operation, limit: 16, null: false
      t.integer :generation, null: false
      t.string :request_id, limit: 36
      t.timestamps
    end
    add_index :student_login_badge_events, [:user_id, :request_id], unique: true, name: 'index_badge_events_on_user_and_request'
  end
end
