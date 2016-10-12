class AddLockableToStages < ActiveRecord::Migration[4.2]
  def change
    add_column :stages, :lockable, :boolean
  end
end
