class AddIpHashToActivityHints < ActiveRecord::Migration
  def change
    add_column :activity_hints, :ip_hash, :integer
  end
end
