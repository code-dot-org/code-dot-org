class Api::V1::TeacherScoreSerializer < ActiveModel::Serializer
  attributes :id, :user_level_id, :teacher_id, :score
end
