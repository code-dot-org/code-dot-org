class AddReceivesMarketingToPotentialTeacher < ActiveRecord::Migration[6.1]
  def change
    add_column :potential_teachers, :receives_marketing, :boolean
  end
end
