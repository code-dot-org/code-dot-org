class Queries::User
  def self.dependent_students_count(user_id)
    user = User.find(user_id)
    user.sections.where.not(login_type: 'email').distinct.joins(:students).select(:'users.id').count
  end
end
