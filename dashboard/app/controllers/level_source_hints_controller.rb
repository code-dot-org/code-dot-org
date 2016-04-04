class LevelSourceHintsController < ApplicationController
  include LevelsHelper
  before_filter :authenticate_user!
  before_action :set_level_source_hint, only: [:update]
  load_and_authorize_resource
  check_authorization

  HINTS_PER_PAGE = 10
  CODE_DOT_ORG_HINTS_PAGE = 'http://code.org/hints'

  def review_hints
    authorize! :manage, :all

    @hints = LevelSourceHint.where(source: LevelSourceHint::CROWDSOURCED)
    @user = current_user
    @restriction = params[:restriction]
    if @restriction
      @hints = @hints.where(status: @restriction)
    end
    @hints = @hints.page(params[:page]).per(HINTS_PER_PAGE)
  end

  # PATCH/PUT /level_source_hints/1
  # PATCH/PUT /level_source_hints/1.json
  def update
    raise 'unauthorized' unless @level_source_hint
    # If anyone but the administrator changed a field, the hint needs to be reviewed again.
    unless current_user.admin?
      raise 'unauthorized' if current_user.id != @level_source_hint.user_id
      params[:status] = LevelSourceHint::STATUS_NEW
    end
    respond_to do |format|
      if @level_source_hint.update(level_source_hint_params)
        # A frequent_unsuccessful_level_source should be active if there are no
        # selected hints for it, and inactive if there are any selected hints.
        fuls = FrequentUnsuccessfulLevelSource.where(:level_source_id => @level_source_hint.level_source_id)
        if fuls.count > 0
          if params[:status] == LevelSourceHint::STATUS_SELECTED
            # Set the associated frequent_unsuccessful_level_source to be inactive.
            fuls.first.update_attribute(:active, false)
          else
            # Possibly set the associated frequent_unsuccessful_level_source to be active.
            unless @level_source_hint.level_source.get_crowdsourced_hint
              fuls.first.update_attribute(:active, true)
            end
          end
        end
        format.any { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @level_source_hint.errors, status: :unprocessable_entity }
      end
    end
  end

  # This solicits a hint for a given level_source_id.
  # There are additional parameters idx and pop_level_source_ids, used for
  # creating previous and next links.  These get their initial values in
  # reports/_code_groups.html.haml.
  def add_hint
    @level_source_id = params[:level_source_id]
    common(@level_source_id)
  end

  def show_hints
    @level_source_id = params[:level_source_id]
    @hints = LevelSourceHint.where(source: LevelSourceHint::CROWDSOURCED,
                                   level_source_id: @level_source_id).
        sort_by { |hint| -hint.times_proposed}
    @user = current_user
    common(@level_source_id)
  end

  def add_pop_hint
    unsuccessful_level_sources = FrequentUnsuccessfulLevelSource.where(active: true).order('num_of_attempts desc')
    idx = params[:idx].to_i
    if idx < 0
      redirect_to CODE_DOT_ORG_HINTS_PAGE
      return
    end
    # Skip any levels for which this user has written a hint, even if it has
    # not been approved.  A possible alternative would be letting users
    # see and revise their own hints.
    @prev_path = add_pop_hint_path(idx - 1)
    while unsuccessful_level_sources.length > idx
      @level_source_id = unsuccessful_level_sources.at(idx).level_source_id
      if LevelSourceHint.where(:user_id => current_user.id,
                               :level_source_id => @level_source_id).count > 0
        idx += 1
      else
        break
      end
    end
    if unsuccessful_level_sources.length > idx
      @num_of_attempts = unsuccessful_level_sources.at(idx).num_of_attempts
      @current_path = add_pop_hint_path(idx)
      @middle_link = ActionController::Base.helpers.link_to "Choose by Puzzle", frequent_unsuccessful_level_sources_path
      @next_path = add_pop_hint_path(idx + 1)
      common(@level_source_id)
    else
      redirect_to CODE_DOT_ORG_HINTS_PAGE
    end
  end

  private
  def setup_display_of_pop_hints(unsuccessful_level_sources, path_maker)
    unsuccessful_level_sources = unsuccessful_level_sources.order('num_of_attempts desc')
    # Only consider levels having the restriction, if one is provided.
    @restriction = params[:restriction]
    if @restriction
      unsuccessful_level_sources = unsuccessful_level_sources.joins(:level_source_hints).
        where('level_source_hints.status = ?', @restriction)
    end
    idx = params[:idx].to_i
    if idx >= 0 && unsuccessful_level_sources.length > idx
      @user = current_user
      @level_source_id = unsuccessful_level_sources.at(idx).level_source_id
      @num_of_attempts = unsuccessful_level_sources.at(idx).num_of_attempts
      @prev_path = path_maker.call(idx - 1, @restriction)
      @current_path = path_maker.call(idx, @restriction)
      @next_path = path_maker.call(idx + 1, @restriction)
      @hints = LevelSourceHint.where(level_source_id: @level_source_id,
                                     source: LevelSourceHint::CROWDSOURCED)
      # Always start at the beginning if the restriction is changed.
      @restricted_url_path_helper = lambda {|restriction| path_maker.call(0, restriction)}
      # Show restricted hint first.
      if @restriction
        @hints = @hints.order("status = \"#{@restriction}\" DESC")
      end
      common(@level_source_id)
      true
    else
      false
    end
  end

  public
  # This shows not just the hint whose popularity index is specified but also
  # all the other hints having the same level source id.
  def show_pop_hints
    authorize! :manage, :all

    unless setup_display_of_pop_hints(
        FrequentUnsuccessfulLevelSource,
        lambda {|idx, restriction| show_pop_hints_path idx, restriction})
      redirect_to frequent_unsuccessful_level_sources_path,
                  notice: "No more #{@restriction && LevelSourceHint::USER_VISIBLE_NAMES[@restriction]} hints to review."
    end
  end

  def add_pop_hint_per_level
    unsuccessful_level_sources = FrequentUnsuccessfulLevelSource.where(active: true, level_id: params[:level_id].to_i).order('num_of_attempts desc')
    idx = params[:idx].to_i
    level_idx = params[:level_id].to_i
    if (idx >= 0 && unsuccessful_level_sources.length > idx)
      @level_source_id = unsuccessful_level_sources.at(idx).level_source_id
      @num_of_attempts = unsuccessful_level_sources.at(idx).num_of_attempts
      @prev_path = add_pop_hint_per_level_path(level_idx, idx - 1)
      @current_path = add_pop_hint_per_level_path(level_idx, idx)
      @middle_link = ActionController::Base.helpers.link_to "Choose by Popularity", add_pop_hint_path(0)
      @next_path = add_pop_hint_per_level_path(level_idx, idx + 1)
      common(@level_source_id)
      render 'add_pop_hint'
    else
      redirect_to frequent_unsuccessful_level_sources_path,
                  notice: 'No more hints are needed for the level you chose.  Please select another.'
    end
  end

  def show_pop_hints_per_level
    authorize! :manage, :all

    if setup_display_of_pop_hints(
        FrequentUnsuccessfulLevelSource.where(level_id: params[:level_id].to_i),
        lambda {|idx, restriction| show_pop_hints_per_level_path(params[:level_id].to_i, idx, restriction)})
      render 'show_pop_hints'
    else
      redirect_to frequent_unsuccessful_level_sources_path,
                  notice: "No more #{@restriction && LevelSourceHint::USER_VISIBLE_NAMES[@restriction]} hints to review for the chosen level."
    end
  end

  def create
    # Find or create the hint data
    level_source_hint =
      LevelSourceHint.where(level_source_id: params[:level_source_id],
                            hint: params[:hint_content],
                            status: LevelSourceHint::STATUS_NEW,
                            source: LevelSourceHint::CROWDSOURCED
      ).first_or_create
    # Update the times this hint has been proposed
    level_source_hint.times_proposed = (level_source_hint.times_proposed || 0) + 1
    # Record the user_id entering the hint
    level_source_hint.user_id = current_user.id
    level_source_hint.save!

    # Redirecting to the params[:redirect] page
    redirect_url = params[:redirect]
    redirect_to redirect_url, notice: I18n.t('add_hint_form.submit')
  end

  def add_hint_access
    redirect_url = params[:redirect]
    user = User.where(email: params[:user_email]).first
    if user
      user.update_attribute(:hint_access, true)
      redirect_to redirect_url, notice: "User hint access added to #{params[:user_email]}"
    else
      redirect_to redirect_url, notice: "Failed: cannot find user with email #{params[:user_email]}."
    end
  end

  protected
  def common(level_source_id)
    @level_source = LevelSource.find(level_source_id)
    @level = @level_source.level
    @game = @level.game

    level_view_options(
      start_blocks: @level_source.data,
      hide_source: false,
      share: true
    )
    view_options(
      full_width: true
    )
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_level_source_hint
    @level_source_hint = LevelSourceHint.where(id: params[:id], source: LevelSourceHint::CROWDSOURCED).try(:first)
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def level_source_hint_params
    params.permit([:id, :hint, :status])
  end
end
