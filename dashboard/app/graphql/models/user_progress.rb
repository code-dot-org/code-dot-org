module Models
  class UserProgress
    def initialize(user)
      @user = user
    end

    def total_lines_of_code
      @user.total_lines
    end

    def levels_passed
      UserLevel.where(user_id: @user.id).passing.count
    end
  end
end
