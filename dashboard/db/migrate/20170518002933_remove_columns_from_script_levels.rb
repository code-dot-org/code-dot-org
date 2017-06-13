class RemoveColumnsFromScriptLevels < ActiveRecord::Migration[5.0]
  def up
    ScriptLevel.where(named_level: true).each do |sl|
      sl.type = ScriptLevel::NAMED_LEVEL
      sl.save!
    end
    ScriptLevel.where(assessment: true).each do |sl|
      sl.type = ScriptLevel::ASSESSMENT
      sl.save!
    end
    ScriptLevel.where(bonus: true).each do |sl|
      sl.type = ScriptLevel::BONUS
      sl.save!
    end

    remove_column :script_levels, :named_level, :boolean
    remove_column :script_levels, :assessment, :boolean
    remove_column :script_levels, :bonus, :boolean
  end

  def down
    add_column :script_levels, :named_level, :boolean
    add_column :script_levels, :assessment, :boolean
    add_column :script_levels, :bonus, :boolean

    ScriptLevel.all.each do |sl|
      case sl.type
      when ScriptLevel::NAMED_LEVEL
        sl.update!(named_level: true)
      when ScriptLevel::ASSESSMENT
        sl.update!(assessment: true)
      when ScriptLevel::BONUS
        sl.update!(bonus: true)
      end
    end
  end
end
