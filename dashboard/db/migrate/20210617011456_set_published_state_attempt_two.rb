class SetPublishedStateAttemptTwo < ActiveRecord::Migration[5.2]
  def up
    Script.all.each do |script|
      script.update!({skip_name_format_validation: true, published_state: script.get_published_state})

      if Rails.application.config.levelbuilder_mode
        script.write_script_dsl
        script.write_script_json
      end
    end

    change_column_null :scripts, :published_state, false
    change_column_default :scripts, :published_state, from: nil, to: 'beta'

    UnitGroup.all.each do |ug|
      ug.update!({published_state: ug.get_published_state})
    end

    change_column_null :unit_groups, :published_state, false
    change_column_default :unit_groups, :published_state, from: nil, to: 'beta'
  end

  def down
    Script.all.each do |script|
      script.update!({skip_name_format_validation: true, published_state: nil})

      if Rails.application.config.levelbuilder_mode
        script.write_script_dsl
        script.write_script_json
      end
    end

    change_column_null :scripts, :published_state, true
    change_column_default :scripts, :published_state, from: 'beta', to: nil

    UnitGroup.all.each do |ug|
      ug.update!({published_state: nil})
    end

    change_column_null :unit_groups, :published_state, true
    change_column_default :unit_groups, :published_state, from: 'beta', to: nil
  end
end
