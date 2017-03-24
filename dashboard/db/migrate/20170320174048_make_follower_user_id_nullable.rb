class MakeFollowerUserIdNullable < ActiveRecord::Migration[5.0]
  def change
    change_column_null :followers, :user_id, true
  end
end
