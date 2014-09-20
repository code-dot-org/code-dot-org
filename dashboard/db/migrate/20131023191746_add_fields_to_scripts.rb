class AddFieldsToScripts < ActiveRecord::Migration
  def change
    add_column :scripts, :trophies, :boolean, null:false, default:false
    add_column :scripts, :hidden, :boolean, null:false, default:false
  end
end
