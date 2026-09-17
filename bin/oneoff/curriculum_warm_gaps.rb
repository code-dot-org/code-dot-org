# curriculum_warm_gaps.rb — find the associations that get lazy-loaded AFTER the prewarm,
# i.e. the CoW "warming gaps".
#
# Usage: cd dashboard && ./bin/rails runner ../bin/oneoff/curriculum_warm_gaps.rb [UNIT_NAME]
#        (default unit: csd1-2024; override via arg or UNIT= env)
#
# How it works: the prewarm loads each unit through Unit.with_associated_models and then walks
# the loaded association graph. Any association a request touches that ISN'T in that graph is
# lazy-loaded on first access in each worker — which WRITES @association_cache onto the shared
# curriculum object, copying its page private (CoW erosion). This probe preloads one unit exactly
# as the parent does, realizes that graph, then subscribes to sql.active_record and runs the hot
# controller code paths (summarize). Every SELECT captured is a warming gap: a candidate to add to
# the eager-load graph so it's loaded once, shared, in the parent instead of privately per worker.
#
# summarize is called with user=nil so per-user (non-warmable) loads don't pollute the results;
# what remains is context-independent curriculum structure that COULD be prewarmed.

unit_name = ARGV[0] || ENV['UNIT'] || 'csd1-2024'

unit = Unit.with_associated_models.find_by(name: unit_name)
abort "no such unit: #{unit_name}" unless unit
warn "probing unit=#{unit.name} (id=#{unit.id})"

# Realize the documented with_associated_models graph so already-warmed associations don't
# register as gaps below. Touch lessons, script_levels, and their levels.
unit.lessons.to_a.each {|l| l.script_levels.to_a}
unit.script_levels.to_a.each(&:level)

loads   = Hash.new(0)
samples = {}
subscriber = ActiveSupport::Notifications.subscribe('sql.active_record') do |*args|
  payload = ActiveSupport::Notifications::Event.new(*args).payload
  name = payload[:name].to_s
  next if payload[:cached]
  next if name.empty? || %w[SCHEMA TRANSACTION CACHE].include?(name)
  next unless /\ASELECT/i.match?(payload[:sql].to_s)
  loads[name] += 1
  samples[name] ||= payload[:sql].to_s.gsub(/\s+/, ' ')[0, 140]
end

# Exercise the hot controller code paths at the model layer (what scripts#show, lessons#show,
# and script_levels#show render). Each is guarded so a signature/data mismatch doesn't abort.
exercise = lambda do |label, &block|
  block.call
rescue StandardError => exception
  warn "  (#{label}: #{exception.class} #{exception.message})"
end

exercise.call('unit.summarize') {unit.summarize}
unit.lessons.first(3).each do |lesson|
  exercise.call('lesson.summarize_for_lesson_show') {lesson.summarize_for_lesson_show} if lesson.respond_to?(:summarize_for_lesson_show)
end
unit.script_levels.first(8).each do |sl|
  exercise.call('script_level.summarize') {sl.summarize}
end

ActiveSupport::Notifications.unsubscribe(subscriber)

total = loads.values.sum
puts "=== warming gaps for unit=#{unit.name}: #{total} lazy SELECTs across #{loads.size} models ==="
puts "(each is an association NOT in with_associated_models; add high-count ones to the eager-load graph)"
puts
puts "#{'MODEL LOAD'.ljust(40)} #{'COUNT'.rjust(6)}  SAMPLE SQL"
loads.sort_by {|_name, count| -count}.each do |name, count|
  puts "#{name.ljust(40)} #{count.to_s.rjust(6)}  #{samples[name]}"
end
