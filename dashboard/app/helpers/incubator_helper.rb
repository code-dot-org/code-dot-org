module IncubatorHelper
  def show_incubator_banner?
    return false unless current_user
    return false unless language == "en"
    return false unless current_user.teacher?
    return false if DCDO.get("hide_incubator_link", false)
    return true
  end
end
