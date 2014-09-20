class ChangeSectionLoginMethodToString < ActiveRecord::Migration
  def up
    change_table :sections do |t|
      t.remove :login_method
      t.string :login_type, null: false, default: 'none'
    end
  end

  def down
    change_table :sections do |t|
      t.remove :login_type
      t.integer :login_method, default: 0
    end
  end

end
