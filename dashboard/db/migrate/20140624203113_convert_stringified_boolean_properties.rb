class ConvertStringifiedBooleanProperties < ActiveRecord::Migration[4.2]
  def change
    Level.all.each do |level|
      next unless level.is_a? Blockly

      case level.is_k1
      when '0'
        level.is_k1 = 'false'
      when '1'
        level.is_k1 = 'true'
      else
        next
      end
      level.save!
    end
  end
end
