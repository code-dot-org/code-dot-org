module IncubatorHelper
  def show_incubator_banner?
    return true
    return false unless current_user
    return false unless language == "en"
    return false unless current_user.teacher?
    return true
  end
end
