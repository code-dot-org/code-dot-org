class AppliedAtColumn < ActiveRecord::Migration[5.2]
  def change
    add_column :pd_applications, :applied_at, :datetime
  end
end
