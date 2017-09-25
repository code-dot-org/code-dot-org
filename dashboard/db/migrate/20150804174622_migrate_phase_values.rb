class MigratePhaseValues < ActiveRecord::Migration[4.2]
  PHASES = {
    1 => 'Phase 1',
    2 => 'Phase 2',
    3 => 'Phase 2 Online',
    4 => 'Phase 3A',
    5 => 'Phase 3B',
    6 => 'Phase 3C',
    7 => 'Phase 3D',
    8 => 'Phase 4'
  }.freeze

  def up
    ActiveRecord::Base.transaction do
      Workshop.find_each do |workshop|
        phase = workshop.phase
        if PHASES.invert[phase]
          workshop.phase = PHASES.invert[phase]
        elsif phase.to_i > 0 && phase.to_i < 9
          puts("Phase already properly mapped to id")
        elsif !phase
          puts("No phase to convert (okay)")
        else
          raise "Unknown phase name #{phase}. Please update the PHASES map"
        end
        workshop.save!
      end
    end
  end

  def down
    ActiveRecord::Base.transaction do
      Workshop.find_each do |workshop|
        phase = workshop.phase
        if PHASES[phase.to_i]
          workshop.phase = PHASES[phase.to_i]
        elsif !phase
          puts("No phase to convert (okay)")
        else
          raise "Unknown phase id #{phase}. Please update the PHASES map"
        end
        workshop.save!
      end
    end
  end
end
