class ChangePhaseToInt < ActiveRecord::Migration
  def change
    Workshop.find_each do |workshop|
      phase = workshop.phase
      new_phase = 0
      if phase == 'Phase 1'
        new_phase = 1
      elsif phase == 'Phase 2'
        new_phase = 2
      elsif phase == 'Phase 2 Online'
        new_phase = 3
      elsif phase == 'Phase 3A'
        new_phase = 4
      elsif phase == 'Phase 3B'
        new_phase = 5
      elsif phase == 'Phase 3C'
        new_phase = 6
      elsif phase == 'Phase 3D'
        new_phase = 7
      elsif phase == 'Phase 4'
        new_phase = 8
      end
      workshop.phase = new_phase
      workshop.save!
    end
    change_column :workshops, :phase, :text
  end
end
