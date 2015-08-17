class AddLoginRequiredToScript < ActiveRecord::Migration
  def change
    add_column :scripts, :login_required, :boolean, null: false, default: false
  end
end
