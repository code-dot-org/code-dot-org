require 'policies/user'

class Queries::User
  def self.dependent_students_count(user_id)
    user = User.find(user_id)
    # Limit the number of students to mitigiate slow page loads on /users/edit
    user.students.limit(Policies::User::DEPENDENT_STUDENTS_COUNT_LIMIT).uniq.count
  end
end
