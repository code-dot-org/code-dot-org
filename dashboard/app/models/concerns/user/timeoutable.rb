module User::Timeoutable
  extend ActiveSupport::Concern

  included do
    devise :timeoutable
  end

  # Devise provides the timeout_in method. Override this functionality here
  # to set custom session timeout values for different users.
  def timeout_in
    self.class.timeout_in
  end
end
