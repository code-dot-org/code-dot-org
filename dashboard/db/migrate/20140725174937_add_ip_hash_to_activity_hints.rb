class AddIpHashToActivityHints < ActiveRecord::Migration[4.2]
  def change
    add_column :activity_hints, :ip_hash, :integer
  end
end
