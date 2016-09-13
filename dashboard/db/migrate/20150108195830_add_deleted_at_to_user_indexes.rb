class AddDeletedAtToUserIndexes < ActiveRecord::Migration[4.2]
  def change
    add_index "users", ["confirmation_token", "deleted_at"], name: "index_users_on_confirmation_token_and_deleted_at", unique: true, using: :btree
    remove_index "users", ["confirmation_token"]

    add_index "users", ["email", "deleted_at"], name: "index_users_on_email_and_deleted_at", using: :btree
    remove_index "users", ["email"]

    add_index "users", ["hashed_email", "deleted_at"], name: "index_users_on_hashed_email_and_deleted_at", using: :btree
    remove_index "users", ["hashed_email"]

    add_index "users", ["prize_id", "deleted_at"], name: "index_users_on_prize_id_and_deleted_at", unique: true, using: :btree
    remove_index "users", ["prize_id"]

    add_index "users", ["provider", "uid", "deleted_at"], name: "index_users_on_provider_and_uid_and_deleted_at", unique: true, using: :btree
    remove_index "users", ["provider", "uid"]

    add_index "users", ["reset_password_token", "deleted_at"], name: "index_users_on_reset_password_token_and_deleted_at", unique: true, using: :btree
    remove_index "users", ["reset_password_token"]

    add_index "users", ["teacher_bonus_prize_id", "deleted_at"], name: "index_users_on_teacher_bonus_prize_id_and_deleted_at", unique: true, using: :btree
    remove_index "users", ["teacher_bonus_prize_id"]

    add_index "users", ["teacher_prize_id", "deleted_at"], name: "index_users_on_teacher_prize_id_and_deleted_at", unique: true, using: :btree
    remove_index "users", ["teacher_prize_id"]

    add_index "users", ["unconfirmed_email", "deleted_at"], name: "index_users_on_unconfirmed_email_and_deleted_at", using: :btree
    remove_index "users", ["unconfirmed_email"]

    add_index "users", ["username", "deleted_at"], name: "index_users_on_username_and_deleted_at", unique: true, using: :btree
    remove_index "users", ["username"]

    # remove this index so we don't use it
    remove_index "users", ["deleted_at"]
  end
end
