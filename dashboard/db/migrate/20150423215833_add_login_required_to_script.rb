class AddLoginRequiredToScript < ActiveRecord::Migration[4.2]
  def change
    add_column :scripts, :login_required, :boolean, null: false, default: false
  end
end
