# Moves all level column data to corresponding field in 'properties' column
class RemoveLevelDataColumns < ActiveRecord::Migration
  def change
    columns = %w(level_url:string skin:string instructions:string maze:string x:integer y:integer
              start_direction:string start_blocks:text toolbox_blocks:text step_mode:integer is_k1:boolean
              nectar_goal:integer honey_goal:integer flower_type:string).map{|x|x.split(':')}
    reversible do |dir|
      dir.up do
        Level.all.each do |level|
          columns.each do |column, type|
            attribute = level.send(:read_attribute, column.to_sym)
            level.properties[column] = attribute unless attribute.nil? || level.properties[column]
            level.send(:write_attribute, column.to_sym, nil)
          end
          level.save!
        end
      end
      columns.each do |column, type|
        options = (column == 'maze') ? {limit: 20000} : {}
        dir.up { remove_column :levels, column.to_sym, type.to_sym, options }
        dir.down { add_column :levels, column.to_sym, type.to_sym, options }
      end
      dir.down do
        Level.all.each do |level|
          columns.reject{|x|x[0] == 'maze'}.each do |column, type|
            level.send(:write_attribute, column.to_sym, level.properties.delete(column))
          end
          level.save!
        end
      end
    end
  end
end
