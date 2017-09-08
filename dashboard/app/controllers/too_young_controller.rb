class TooYoungController < ApplicationController
  # There are three types of young, signed-in students:
  #
  # 1. no teacher
  # 2. has teacher, terms not accepted
  # 3. has teacher, terms accepted
  #
  # Users of type 3 should never be sent here, since they should be allowed to
  # access everything that older students can access. Therefore, we only
  # differentiate between 1 and 2 when choosing which message to display.
  #
  # GET /too_young
  def index
    has_teacher = current_user && current_user.teachers.any?
    msg = has_teacher ? I18n.t("errors.messages.teacher_must_accept_terms") : I18n.t("errors.messages.too_young")
    redirect_to '/', flash: {alert: msg}
  end
end
