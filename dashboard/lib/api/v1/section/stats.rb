module Api::V1::Section::Stats
  def get_section_stats(section_id)
    students = Section.find_by_id(section_id).try(:students)
    return nil if students.nil?
    all_results = {}
    students.each do |student|
      results = Hash.new(0)
      student.user_levels.each do |user_level|
        lcd = Level.cache_find(user_level.level_id).level_concept_difficulty
        next unless lcd
        ConceptDifficulties::CONCEPTS.each do |concept|
          if lcd.send(concept)
            results["#{concept}_total"] += 1
            results["#{concept}_perfect"] += 1 if user_level.perfect?
          end
        end
      end
      all_results[student.id] = results
    end
  end
end
