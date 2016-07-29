class AddLockableToStages < ActiveRecord::Migration
  def change
    add_column :stages, :lockable, :boolean
  end
end
