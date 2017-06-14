class Pd::UserAdminController < ApplicationController
  authorize_resource class: :pd_user_admin

  def find_user
  end
end
