class AddUrlParamToStages < ActiveRecord::Migration
  def up
    add_column :stages, :url_param, :string

    Stage.reset_column_information
    # Go through each script, and calculate url_param for lockable/unlockable
    # stages
    Script.all.each do |script|
      lockable_count = 0
      nonlockable_count = 0
      # depend on the fact that stages are ordered by position
      script.stages.each do |stage|
        if stage.lockable?
          lockable_count += 1
          stage.update!(url_param: lockable_count.to_s)
        else
          nonlockable_count += 1
          stage.update!(url_param: nonlockable_count.to_s)
        end
      end
    end
    # Might have orphaned stages (i.e. their script no longer exists). In these
    # cases just set url_param to position
    Stage.all.each do |stage|
      if stage.url_param.nil?
        stage.update!(url_param: stage.position.to_s)
      end
    end
    change_column_null :stages, :url_param, false
  end

  def down
    remove_column :stages, :url_param
  end
end
