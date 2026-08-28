class AddStableIdToSignIns < ActiveRecord::Migration[7.0]
  def change
    add_column :sign_ins, :stable_id, :string
  end
end
