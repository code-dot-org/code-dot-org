class CreateUserLogTokens < ActiveRecord::Migration[7.0]
  def change
    create_table :user_log_tokens do |t|
      # users.id is :integer, so the FK column must match.
      # index: false because the composite index below already covers user_id.
      t.references :user, null: false, type: :integer, foreign_key: true, index: false
      t.string :destination, null: false
      # School year the token was minted in; bounds how far back a destination
      # can correlate one user.
      t.integer :period, null: false
      t.string :uuid, limit: 36, null: false

      t.timestamps
    end

    # Also what keeps the lazy mint race-safe.
    add_index :user_log_tokens,
      [:user_id, :destination, :period],
      unique: true,
      name: 'index_user_log_tokens_on_user_destination_period'

    # The admin page's reverse lookup.
    add_index :user_log_tokens, :uuid, unique: true
  end
end
