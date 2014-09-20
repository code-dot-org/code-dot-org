class ConvertStringifiedBooleanProperties < ActiveRecord::Migration
  def change
    Level.all.each do |level|
      next unless level.is_a? Blockly

      if level.is_k1 == '0'
        level.is_k1 = 'false'
      elsif level.is_k1 == '1'
        level.is_k1 = 'true'
      else
        next
      end
      level.save!
    end
  end
end
