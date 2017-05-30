class AddPdSessionCode < ActiveRecord::Migration[5.0]
  def change
    add_column :pd_sessions, :code, :string
    add_index :pd_sessions, :code, unique: true
  end
end
