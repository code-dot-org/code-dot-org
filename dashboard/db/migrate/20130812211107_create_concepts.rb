class CreateConcepts < ActiveRecord::Migration
  def up
    create_table :concepts do |t|
      t.string :name
      t.string :description, limit: 1024

      t.timestamps
    end

    create_table :concepts_levels do |t|
      t.references :concept, :level
    end

    execute(<<SQL)
insert into concepts (name, description)
values
('output 1', 'Use functions to trigger actions'),
('conditional 1', 'Use if statement to run code conditionally'),
('conditional 2', 'Use multiple if statements or if-else'),
('loop 1', 'Use basic loops, such as for or while statements'),
('loop 2', 'Use of more complex loop structures'),
('variables 1', 'Basic variables, such as a for loop iterator'),
('variables 2', 'More complex variables'),
('data structures 1', 'Use of non-native types, such as arrays and hashes')
SQL
  end

  def down
    drop_table :concepts_levels
    drop_table :concepts
  end
end
