class CreateUserLogTokens < ActiveRecord::Migration[7.0]
  def change
    create_table :user_log_tokens do |t|
      # users.id is :integer, so the FK column must match.
      t.references :user, null: false, type: :integer, foreign_key: true, index: false
      t.string :destination, null: false
      # The school year the token was minted in, not a calendar year.
      t.integer :period, null: false
      t.string :uuid, limit: 36, null: false

      t.timestamps
    end

    # The mint path relies on this to lose a race rather than duplicate a token.
    add_index :user_log_tokens,
      [:user_id, :destination, :period],
      unique: true,
      name: 'index_user_log_tokens_on_user_destination_period'

    # Resolving a token to a user is a lookup on this.
    add_index :user_log_tokens, :uuid, unique: true
  end
end
