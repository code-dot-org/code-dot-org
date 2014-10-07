require 'cdo/regexp'
require 'cdo/geocoder'
require 'cdo/web_purify'

class ActivitiesController < ApplicationController
  include LevelsHelper

  # TODO: milestone is the only action so the below lines essentially do nothing. commenting out bc
  # the TODO is to figure out why (forgery protection is useful -- why can't we use it? blockly?)
#  protect_from_forgery except: :milestone
#  check_authorization except: [:milestone]
#  load_and_authorize_resource except: [:milestone]
  before_filter :nonminimal, only: :milestone

  MAX_INT_MILESTONE = 2147483647
  USER_ENTERED_TEXT_TITLE_NAMES = %w(TITLE TEXT)

  def milestone
    # TODO: do we use the :result and :testResult params for the same thing?
    solved = ('true' == params[:result])
    if params[:script_level_id]
      @script_level = ScriptLevel.cache_find(params[:script_level_id].to_i)
      @level = @script_level.level
    elsif params[:level_id]
      # TODO: do we need a cache_find for Level like we have for ScriptLevel?
      @level = Level.find(params[:level_id].to_i)
    end

    if params[:program]
      share_failure = find_share_failure(params[:program])
      @level_source = LevelSource.find_identical_or_create(@level, params[:program]) unless share_failure
    end

    log_milestone(@level_source, params)

    # Store the image only if the image is set, and the image has not been saved
    if params[:image] && @level_source
      @level_source_image = LevelSourceImage.find_or_create_by(:level_source_id => @level_source.id)
      @level_source_image.replace_image_if_better Base64.decode64(params[:image])
    end

    @new_level_completed = false
    if current_user
      track_progress_for_user
    else
      track_progress_in_session
    end

    total_lines = if current_user && current_user.total_lines
                    current_user.total_lines
                  elsif session[:lines]
                    session[:lines]
                  else
                    0
                  end

    render json: milestone_response(script_level: @script_level,
                                    total_lines: total_lines,
                                    trophy_updates: @trophy_updates,
                                    solved?: solved,
                                    level_source: @level_source,
                                    activity: @activity,
                                    new_level_completed: @new_level_completed,
                                    share_failure: share_failure)

    slog(:tag => 'activity_finish',
         :script_level_id => @script_level.try(:id),
         :level_id => @level.id,
         :user_agent => request.user_agent,
         :locale => locale) if solved
  end

  def find_share_failure(program)
    return nil unless program.match /(#{USER_ENTERED_TEXT_TITLE_NAMES.join('|')})/

    xml_tag_regexp = /<[^>]*>/
    program_tags_removed = program.gsub(xml_tag_regexp, "\n")

    if email = RegexpUtils.find_potential_email(program_tags_removed)
      return {message: t('share_code.email_not_allowed'), contents: email}
    elsif street_address = Geocoder.find_potential_street_address(program_tags_removed)
      return {message: t('share_code.address_not_allowed'), contents: street_address}
    elsif phone_number = RegexpUtils.find_potential_phone_number(program_tags_removed)
      return {message: t('share_code.phone_number_not_allowed'), contents: phone_number}
    elsif WebPurify.find_potential_profanity(program_tags_removed, ['en', locale])
      return {message: t('share_code.profanity_not_allowed')}
    end
    nil
  end

  private

  def milestone_logger
    @@milestone_logger ||= Logger.new("#{Rails.root}/log/milestone.log")
  end

  def track_script_progress
    retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      @user_script = UserScript.where(user: current_user, script: @script_level.script).first_or_create
      time_now = Time.now
      @user_script.started_at ||= time_now
      @user_script.last_progress_at = time_now

      if @user_script.check_completed?
        @user_script.completed_at ||= time_now
      end
    end

    @user_script.save!
  end

  def track_progress_for_user
    authorize! :create, Activity
    authorize! :create, UserLevel

    test_result = params[:testResult].to_i
    solved = ('true' == params[:result])
    lines = params[:lines].to_i

    current_user.backfill_user_scripts if current_user.needs_to_backfill_user_scripts?

    @activity = Activity.create!(user: current_user,
                                 level: @level,
                                 action: solved, # TODO I think we don't actually use this. (maybe in a report?)
                                 test_result: test_result,
                                 attempt: params[:attempt].to_i,
                                 lines: lines,
                                 time: [[params[:time].to_i, 0].max, MAX_INT_MILESTONE].min,
                                 level_source: @level_source )

    retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      user_level = UserLevel.where(user: current_user, level: @level).first_or_create
      old_passing = user_level.passing?
      user_level.attempts += 1 unless user_level.best?
      user_level.best_result = user_level.best_result ?
        [test_result, user_level.best_result].max :
        test_result
      user_level.save!
      @new_level_completed = true if !old_passing && user_level.passing?
    end

    if @script_level
      track_script_progress
    end

    passed = Activity.passing?(test_result)
    if lines > 0 && passed
      current_user.total_lines += lines
      current_user.save!
    end

    # blockly could send us 'undefined' when things are not defined...
    if params[:save_to_gallery] && params[:save_to_gallery] != 'undefined' &&
        @level_source_image && solved
      @gallery_activity = GalleryActivity.create!(user: current_user, activity: @activity)
    end

    begin
      trophy_check(current_user) if passed
    rescue Exception => e
      Rails.logger.error "Error updating trophy exception: #{e.inspect}"
    end

    unless @trophy_updates.blank?
      prize_check(current_user)
    end
  end

  def track_progress_in_session
    # TODO: this doesn't work for multiple scripts, especially if scripts share levels

    # hash of level_id => test_result
    test_result = params[:testResult].to_i
    session[:progress] ||= {}
    old_result = session[:progress].fetch(@level.id, -1)
    if test_result > old_result
      session[:progress][@level.id] = test_result
    end

    # counter of total lines written
    session[:lines] ||= 0
    lines = params[:lines].to_i
    if lines > 0 && Activity.passing?(test_result)
      session[:lines] += lines
    end

    @new_level_completed = true if !Activity.passing?(old_result) && Activity.passing?(test_result)
  end

  def trophy_check(user)
    @trophy_updates ||= []
    # called after a new activity is logged to assign any appropriate trophies
    current_trophies = user.user_trophies.includes([:trophy, :concept]).index_by { |ut| ut.concept }
    progress = user.concept_progress

    progress.each_pair do |concept, counts|
      current = current_trophies[concept]
      pct = counts[:current].to_f/counts[:max]

      new_trophy = Trophy.find_by_id case
        when pct == Trophy::GOLD_THRESHOLD
          Trophy::GOLD
        when pct >= Trophy::SILVER_THRESHOLD
          Trophy::SILVER
        when pct >= Trophy::BRONZE_THRESHOLD
          Trophy::BRONZE
        else
          # "no trophy earned"
      end

      if new_trophy
        if new_trophy.id == current.try(:trophy_id)
          # they already have the right trophy
        elsif current
          current.update_attributes!(trophy_id: new_trophy.id)
          @trophy_updates << [data_t('concept.description', concept.name), new_trophy.name, view_context.image_path(new_trophy.image_name)]
        else
          UserTrophy.create!(user: user, trophy_id: new_trophy.id, concept: concept)
          @trophy_updates << [data_t('concept.description', concept.name), new_trophy.name, view_context.image_path(new_trophy.image_name)]
        end
      end
    end
  end

  def prize_check(user)
    if user.trophy_count == (Concept.cached.length * Trophy::TROPHIES_PER_CONCEPT)
      if !user.prize_earned
        user.prize_earned = true
        user.save!
        # student prizes disabled
        # PrizeMailer.prize_earned(user).deliver if user.email.present? && eligible_for_prize?
      end

      # for awarding prizes, we only honor the first (primary) teacher
      teacher = user.valid_prize_teacher

      if teacher && (!teacher.teacher_prize_earned || !teacher.teacher_bonus_prize_earned)
        t_prize, t_bonus = teacher.check_teacher_prize_eligibility
        if t_prize && !teacher.teacher_prize_earned
          teacher.teacher_prize_earned = true
          teacher.save!
          # teacher prizes disabled, but we still are sending a congrats mail to people who would have received a prize
          PrizeMailer.teacher_prize_earned(teacher).deliver if teacher.email.present? && eligible_for_prize?
        end

        if t_bonus && !teacher.teacher_bonus_prize_earned
          teacher.teacher_bonus_prize_earned = true
          teacher.save!
          # teacher bonus prizes disabled
          # PrizeMailer.teacher_bonus_prize_earned(teacher).deliver if teacher.email.present? && eligible_for_prize?
        end
      end
    end
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_activity
    @activity = Activity.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def activity_params
    params[:activity]
  end

  def log_milestone(level_source, params)
    log_string = "Milestone Report:"
    if (current_user || session.id)
      log_string += "\t#{(current_user ? current_user.id.to_s : ("s:" + session.id))}"
    else
      log_string += "\tanon"
    end
    log_string += "\t#{request.remote_ip}\t#{params[:app]}\t#{params[:level]}\t#{params[:result]}" +
                  "\t#{params[:testResult]}\t#{params[:time]}\t#{params[:attempt]}\t#{params[:lines]}"
    log_string += level_source.present? ? "\t#{level_source.id.to_s}" : "\t"
    log_string += "\t#{request.user_agent}"

    milestone_logger.info log_string
  end
end
