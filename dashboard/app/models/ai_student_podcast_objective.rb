# == Schema Information
#
# Table name: ai_student_podcast_objectives
#
#  id                    :bigint           not null, primary key
#  ai_student_podcast_id :bigint           not null
#  objective_id          :integer          not null
#
# Indexes
#
#  index_ai_student_podcast_objectives_on_ai_student_podcast_id  (ai_student_podcast_id)
#  index_ai_student_podcast_objectives_on_objective_id           (objective_id)
#  index_ai_student_podcast_objectives_unique                    (ai_student_podcast_id,objective_id) UNIQUE
#
class AiStudentPodcastObjective < ApplicationRecord
  belongs_to :ai_student_podcast
  belongs_to :objective
end
