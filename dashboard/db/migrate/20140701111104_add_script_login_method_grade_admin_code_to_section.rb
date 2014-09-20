class AddScriptLoginMethodGradeAdminCodeToSection < ActiveRecord::Migration
  def change
    add_column :sections, :script_id, :integer
    add_column :sections, :login_method, :integer, default: 0
    add_column :sections, :grade, :string
    add_column :sections, :admin_code, :string
  end
end
