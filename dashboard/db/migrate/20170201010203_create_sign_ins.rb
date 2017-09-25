class CreateSignIns < ActiveRecord::Migration[5.0]
  def change
    create_table :sign_ins do |t|
      # The user to which the sign-in applies.
      t.belongs_to :user, null: false
      # The timestamp of the sign-in. The column is indexed so as to be able to
      # quickly compute 7-DA and 30-DA counts.
      t.timestamp :sign_in_at, null: false, index: true
      # The number of total sign-ins (including this one) for this user.
      t.integer :sign_in_count, null: false
    end
  end
end
