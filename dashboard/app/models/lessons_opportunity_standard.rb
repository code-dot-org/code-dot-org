# == Schema Information
#
# Table name: lessons_opportunity_standards
#
#  lesson_id   :bigint           not null
#  standard_id :bigint           not null
#  id          :bigint           not null, primary key
#
# Indexes
#
#  index_lessons_opportunity_standards_on_lesson_id_and_standard_id  (lesson_id,standard_id) UNIQUE
#  index_lessons_opportunity_standards_on_standard_id_and_lesson_id  (standard_id,lesson_id)
#
class LessonsOpportunityStandard < ApplicationRecord
end
