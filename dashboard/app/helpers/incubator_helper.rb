module IncubatorHelper
  def show_incubator_banner?
    return true
    return false unless current_user
    return false unless language == "en"
    return false unless current_user.teacher?
    return false unless permitted_user_id?(current_user.id)
    return true
  end

  def permitted_user_id?(user_id)
    user_id % 10 == 0
  end
end
