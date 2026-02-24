# Handles pages telling users they need to be signed-in or have a
# teacher account to access a certain part of our site.

class GatesController < ApplicationController
  # GET /logged_out
  def logged_out
    render 'logged_out', formats: [:html]
  end

  # GET /teacher_account_required
  def teacher_account_required
    render 'teacher_account_required', formats: [:html]
  end
end
