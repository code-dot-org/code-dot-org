class SetPublishedStateAttemptTwo < ActiveRecord::Migration[5.2]
  def up
    change_column_null :scripts, :published_state, false
    change_column_default :scripts, :published_state, from: nil, to: 'beta'

    change_column_null :unit_groups, :published_state, false
    change_column_default :unit_groups, :published_state, from: nil, to: 'beta'
  end

  def down
    change_column_null :scripts, :published_state, true
    change_column_default :scripts, :published_state, from: 'beta', to: nil

    change_column_null :unit_groups, :published_state, true
    change_column_default :unit_groups, :published_state, from: 'beta', to: nil
  end
end
