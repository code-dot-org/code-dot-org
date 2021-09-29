class UpdateDefaultPublishedState < ActiveRecord::Migration[5.2]
  def up
    change_column_default :scripts, :published_state, from: 'beta', to: 'in_development'
    change_column_default :unit_groups, :published_state, from: 'beta', to: 'in_development'
  end

  def down
    change_column_default :scripts, :published_state, from: 'in_development', to: 'beta'
    change_column_default :unit_groups, :published_state, from: 'in_development', to: 'beta'
  end
end
