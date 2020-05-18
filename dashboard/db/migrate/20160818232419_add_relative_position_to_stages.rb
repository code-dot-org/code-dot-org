class AddRelativePositionToStages < ActiveRecord::Migration[4.2]
  def up
    rename_column :stages, :position, :absolute_position
    add_column :stages, :relative_position, :integer

    Stage.reset_column_information
    # Go through each script, and calculate relative_position for lockable/unlockable
    # stages
    Script.all.each do |script|
      lockable_count = 0
      nonlockable_count = 0
      # depend on the fact that stages are ordered by absolute_position
      script.lessons.each do |stage|
        if stage.lockable?
          lockable_count += 1
          stage.update!(relative_position: lockable_count)
        else
          nonlockable_count += 1
          stage.update!(relative_position: nonlockable_count)
        end
      end
    end
    # Might have orphaned stages (i.e. their script no longer exists). In these
    # cases just set relative_position to absolute_position
    Stage.all.each do |stage|
      if stage.relative_position.nil?
        stage.update!(relative_position: stage.absolute_position)
      end
    end
    change_column_null :stages, :relative_position, false

  rescue
    # If an exception occurs, back out of this migration, but ignore any
    # exceptions generated there. Do the best you can.
    down rescue nil

    # Re-raise this exception for diagnostic purposes.
    raise
  end

  def down
    remove_column :stages, :relative_position
    rename_column :stages, :absolute_position, :position
  end
end
