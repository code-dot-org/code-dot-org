class ChangeSectionLoginTypeFromNoneToEmail < ActiveRecord::Migration
  def up
    change_column_default :sections, :login_type, 'email'
    Section.where(login_type: 'none').find_each {|s| s.update_attribute(:login_type, 'email')}
  end

  def down
    Section.where(login_type: 'email').find_each {|s| s.update_attribute(:login_type, 'none')}
    change_column_default :sections, :login_type, 'none'
  end

end
