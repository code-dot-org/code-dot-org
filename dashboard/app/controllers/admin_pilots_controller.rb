class AdminPilotsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin
  check_authorization

  def index
    @pilots = Pilot.all
  end

  def create
    pilot_params = params[:pilot]
    return head :bad_request unless pilot_params

    begin
      Pilot.create!(
        name: pilot_params[:name],
        display_name: pilot_params[:display_name],
        allow_joining_via_url: pilot_params[:allow_joining_via_url]
      )
    rescue StandardError => exception
      return render status: :bad_request, json: {error: exception.message}
    end

    redirect_to :admin_pilots
  end

  def show
    @pilot_name = params[:pilot_name]
    return head :bad_request unless Pilot.exists?(name: @pilot_name)
    user_ids = SingleUserExperiment.where(name: @pilot_name).map(&:min_user_id)
    @emails = User.where(id: user_ids).pluck(:email).sort
    @join_url = Pilot.find_by(name: @pilot_name).allow_joining_via_url ? "http://studio.code.org/experiments/set_single_user_experiment/#{@pilot_name}" : nil
  end

  # Parses newline separated emails, ignores commas and whitespace
  def add_to_pilot
    emails = params[:email]
    pilot_name = params[:pilot_name]
    return head :bad_request unless Pilot.exists?(name: pilot_name)
    email_array = emails.split("\n")
    email_array.each do |email|
      email = email.strip.gsub(/[\s,]/, "")
      user = User.find_by_email_or_hashed_email(email)
      if !user
        flash[:alert] = "An account with the email address #{email} does not exist"
      elsif user.student?
        flash[:alert] = "Cannot add a student to the pilot"
      else
        SingleUserExperiment.find_or_create_by!(min_user_id: user.id, name: pilot_name)
        flash[:notice] = "Successfully added #{email} to #{pilot_name}!"
      end
    end
    redirect_to action: 'show', pilot_name: pilot_name
  end

  def remove_from_pilot
    email = params[:email]
    pilot_name = params[:pilot_name]
    return head :bad_request unless Pilot.exists?(name: pilot_name)

    user = User.find_by_email_or_hashed_email(email)
    e = Experiment.where(name: pilot_name, min_user_id: user.id).first
    Experiment.delete(e.id)

    flash[:notice] = "Successfully removed #{email} from #{pilot_name}"

    redirect_to action: 'show', pilot_name: pilot_name
  end
end
