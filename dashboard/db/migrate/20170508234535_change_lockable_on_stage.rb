class ChangeLockableOnStage < ActiveRecord::Migration[5.0]
  def change
    change_column_null :stages, :lockable, false, false
    change_column_default :stages, :lockable, from: nil, to: false
  end
end
