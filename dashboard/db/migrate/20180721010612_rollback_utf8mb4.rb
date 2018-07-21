require 'db/migrate/20180703165502_change_blocks_to_utf8mb4'

class RollbackUtf8mb4 < ActiveRecord::Migration[5.0]
  def up
    ChangeBlocksToUtf8mb4.down
  end

  def down
    ChangeBlocksToUtf8mb4.up
  end
end
