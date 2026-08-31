# Keeps config/us_only_ai_curriculum.yml honest. The file is a snapshot, so it
# only stays correct if something recomputes it when curriculum changes.
namespace :us_only_ai_curriculum do
  desc 'Print units whose Aichat levels use a US only model, and diff against the snapshot'
  task snapshot: :environment do
    actual = UsOnlyAiCurriculum.compute_unit_names
    recorded = UsOnlyAiCurriculum.unit_names.to_a.sort

    added = actual - recorded
    removed = recorded - actual

    puts "levels scan found #{actual.size} unit(s); snapshot records #{recorded.size}"
    actual.each {|name| puts "  #{name}"}

    unless added.empty? && removed.empty?
      puts
      added.each {|name| puts "MISSING from snapshot: #{name}"}
      removed.each {|name| puts "STALE in snapshot:     #{name}"}
      abort "\nconfig/us_only_ai_curriculum.yml is out of date -- update the units list above."
    end

    puts "\nsnapshot is up to date"
  end
end
