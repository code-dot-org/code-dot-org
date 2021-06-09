class SetPublishedStateForUnitGroupAndScript < ActiveRecord::Migration[5.2]
  def up
    Script.all.each do |script|
      script.update!({skip_name_format_validation: true, published_state: script.get_published_state})

      script.write_script_dsl
      script.write_script_json
    end

    UnitGroup.all.each do |ug|
      ug.update!({published_state: ug.get_published_state})
    end
  end

  def down
    Script.all.each do |script|
      script.update!({skip_name_format_validation: true, published_state: nil})

      script.write_script_dsl
      script.write_script_json
    end

    UnitGroup.all.each do |ug|
      ug.update!({published_state: nil})
    end
  end
end
