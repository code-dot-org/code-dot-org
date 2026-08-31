class AddAnonUserIdToSignIns < ActiveRecord::Migration[7.0]
  def change
    add_column :sign_ins, :anon_user_id, :string, length: 36
  end
end
