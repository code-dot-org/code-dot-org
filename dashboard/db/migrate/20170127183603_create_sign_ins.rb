class CreateSignIns < ActiveRecord::Migration[5.0]
  def change
    create_table :sign_ins do |t|
      # The user to which the sign-in applies.
      t.belongs_to :user, null: false
      # The timestamp of the sign-in.
      t.timestamp :sign_in_at
    end
  end
end
