# TODO: reorganize this so it's more obvious which actions are for
# students, teachers, and admins (most likely move into more relevant
# controllers)

class ReportsController < ApplicationController
  before_filter :authenticate_user!, except: [:header_stats, :user_progress, :get_script]

  check_authorization except: [:header_stats, :user_progress, :get_script, :students]

  before_action :set_script
  include LevelSourceHintsHelper
  include LevelsHelper
  include UsersHelper

  def user_stats
    @user = User.find(params[:user_id])
    authorize! :read, @user

    #@recent_activity = Activity.where(['user_id = ?', user.id]).order('id desc').includes({level: :game}).limit(2)
    @recent_levels = UserLevel.find_by_sql(<<SQL)
select ul.*, sl.position, l.game_id, sl.chapter, sl.script_id, sl.id as script_level_id
from user_levels ul
inner join script_levels sl on sl.level_id = ul.level_id
inner join levels l on l.id = ul.level_id
where sl.script_id = 1 and ul.user_id = #{@user.id}
order by ul.updated_at desc limit 2
SQL
  end

  # Find a script by name OR id, including someone who pased an ID into name.
  def find_script(p)
    name_or_id = p[:script_name]
    name_or_id = p[:script_id] if name_or_id.nil?
    return if name_or_id.nil?

    Script.get_from_cache name_or_id
  end

  def find_script_level(script, p)
    script_level = script.get_script_level_by_stage_and_position p[:stage_id], p[:level_id]
    raise ActiveRecord::RecordNotFound unless script_level
    script_level
  end

  def header_stats
    @script = find_script(params)
    render file: 'shared/_user_stats', layout: false, locals: {user: current_user}
  end

  def summarize_stage(stage)
    stage.summarize
  end

  def get_script
    script = find_script(params)
    render json: script.summarize
  end

  def user_progress
    script = find_script(params)
    script_level = find_script_level(script, params)
    stage = script_level.stage

    level = script_level.level
    game = script_level.level.game

    stage_data = stage.summarize

    # Copy these now because they will be modified during this routine, but the API caller needs the previous value
    if session[:callouts_seen]
      callouts_seen = session[:callouts_seen].map { |x| x }
    end
    if session[:videos_seen]
      videos_seen = session[:videos_seen].map { |x| x }
    end

    # Level-specific data
    if level.unplugged?
      unplug_id = (level.type == 'Unplugged' ? level.name : game.name)
      level_data = {
        kind: 'unplugged',
        level: summarize_script_level(script_level),
        app: 'unplugged',
        title: try_t("data.unplugged.#{unplug_id}.title"),
        desc: try_t("data.unplugged.#{unplug_id}.desc")
      }

      pdfs = try_t("data.unplugged.#{unplug_id}.pdfs")
      if pdfs
        level_data[:pdfs] = pdfs.map.with_index do |pdf, i|
          {
            name: t('download_pdf', :pdf => i + 1),
            url: '/unplugged/' + pdf + '.pdf'
          }
        end
      end

      video = Video.find_by_key(try_t("data.unplugged.#{unplug_id}.video"))
      if video
        level_data[:video] = video_info(video, false)
      end

    elsif level.is_a?(DSLDefined)
      # TODO OFFLINE: partial "levels/#{level.class.to_s.underscore}"
      level_data = {
        kind: 'dsl',
        level: summarize_script_level(script_level),
        app: level.class.to_s
      }
    else
      # Prepare some globals for blockly_options()
      # Intentionally does not set @current_user since this is a static callback
      # No longer sets @callback because milestone URL is calculated on the client.
      @script = script
      @level = level
      @game = game
      @script_level = script_level
      @level_source_id = level.ideal_level_source_id
      # TODO OFFLINE: @phone_share_url
      set_videos_and_blocks_and_callouts  # sets @callouts, @autoplay_video_info for use in blockly_options()

      level_data = blockly_options()
      if (level.embed == 'true' && !@edit_blocks)
        level_data[:embed] = true
        level_data[:hide_source] = true
        level_data[:no_padding] = true
        level_data[:show_finish] = true
        level_data[:disableSocialShare] = true
      end
    end

    if level.ideal_level_source_id
      level_data[:solutionPath] = script_level_solution_path(script, level)  # TODO: Only for teachers?
    end
    level_data[:locale] = js_locale
    if !level.related_videos.nil? && !level.related_videos.empty?
      level_data[:relatedVideos] = level.related_videos.map do |video|
        {
          name: data_t('video.name', video.key),
          youtube_code: video.youtube_code,
          data: video_info(video),
          thumbnail_url: video_thumbnail_path(video)
        }
      end
    end

    if script_level && script.show_report_bug_link?
      level_data[:feedbackUrl] = script.feedback_url
      level_data[:reportBugLink] = script_level.report_bug_url(request)
    end

    if script.k5_course?
      actions = [
        {
          label: t('nav.header.free_play.playlab'),
          icon: 'fa-rocket',
          link: playlab_freeplay_level(script)
        },
        {
          label: t('nav.header.free_play.artist'),
          icon: 'fa-pencil',
          link: artist_freeplay_level(script)
        }
      ]
    end

    reply = {
      stage: stage_data,
      level: level_data,
      actions: actions
    }

    # USER-SPECIFIC DATA - should eventually move to its own callback?
    if current_user
      reply[:progress] = summarize_user_progress script
    else
      # TODO OFFLINE:  Session-based progress
    end

    if params['jsonp']
      expires_in 10000, public: true  # TODO: Real static asset caching
    end
    render :json => reply, :callback => params['jsonp']
  end

  def prizes
    authorize! :read, current_user
  end

  def usage
    @user = User.find(params[:user_id])
    authorize! :read, @user

    @recent_activities = get_base_usage_activity.where(['user_id = ?', @user.id])
  end

  def all_usage
    authorize! :read, :reports

    @recent_activities = get_base_usage_activity
    render 'usage', formats: [:html]
  end

  def admin_stats
    authorize! :read, :reports
    
    SeamlessDatabasePool.use_persistent_read_connection do
      @user_count = User.count
      @teacher_count = User.where(:user_type => 'teacher').count
      @student_count = @user_count - @teacher_count
      @users_with_teachers = Follower.distinct.count(:student_user_id)
      @users_with_email = User.where('email <> ""').count
      @users_with_confirmed_email = User.where('confirmed_at IS NOT NULL').count
      @girls = User.where(:gender => 'f').count
      @boys = User.where(:gender => 'm').count
 
      @prizes_redeemed = Prize.where('user_id IS NOT NULL').group(:prize_provider).count
      @prizes_available = Prize.where('user_id IS NULL').group(:prize_provider).count
      
      @student_prizes_earned = User.where(:prize_earned => true).count
      @student_prizes_redeemed = Prize.where('user_id IS NOT NULL').count
      @student_prizes_available = Prize.where('user_id IS NULL').count

      @teacher_prizes_earned = User.where(:teacher_prize_earned => true).count
      @teacher_prizes_redeemed = TeacherPrize.where('user_id IS NOT NULL').count
      @teacher_prizes_available = TeacherPrize.where('user_id IS NULL').count
      
      @teacher_bonus_prizes_earned = User.where(:teacher_bonus_prize_earned => true).count
      @teacher_bonus_prizes_redeemed = TeacherBonusPrize.where('user_id IS NOT NULL').count
      @teacher_bonus_prizes_available = TeacherBonusPrize.where('user_id IS NULL').count
    end
  end

  def admin_progress
    authorize! :read, :reports
    
    SeamlessDatabasePool.use_persistent_read_connection do
      @user_count = User.count
      @all_script_levels = Script.twenty_hour_script.script_levels.includes({ level: :game })
 
      @levels_attempted = User.joins(:user_levels).group(:level_id).where('best_result > 0').count
      @levels_attempted.default = 0
      @levels_passed = User.joins(:user_levels).group(:level_id).where('best_result >= 20').count
      @levels_passed.default = 0

      @stage_map = @all_script_levels.group_by { |sl| sl.level.game }
    end
  end

  def admin_concepts
    authorize! :read, :reports
    SeamlessDatabasePool.use_persistent_read_connection do
      render 'admin_concepts', formats: [:html]
    end
  end

  def students
    redirect_to teacher_dashboard_url
  end

  def level_stats
    authorize! :read, :reports

    @level = Level.find(params[:level_id])

    best_code_map = Hash.new{|h,k| h[k] = {:level_source_id => k, :count => 0, :popular => false} }
    passing_code_map = Hash.new{|h,k| h[k] = {:level_source_id => k, :count => 0, :popular => false} }
    finished_code_map = Hash.new{|h,k| h[k] = {:level_source_id => k, :count => 0, :popular => false} }
    unsuccessful_code_map = Hash.new{|h,k| h[k] = {:level_source_id => k, :count => 0, :popular => false} }
    all_but_best_code_map = Hash.new{|h,k| h[k] = {:level_source_id => k, :count => 0, :popular => false} }

    Activity.all.where(['level_id = ?', @level.id]).order('id desc').limit(10000).each do |activity|
      # Do not process activity records with nil level_source_id
      if activity.level_source_id.nil?
        next
      end
      if activity.best?
        best_code_map[activity.level_source_id][:count] += 1
      elsif activity.passing?
        passing_code_map[activity.level_source_id][:count] += 1
      elsif activity.finished?
        finished_code_map[activity.level_source_id][:count] += 1
      else
        unsuccessful_code_map[activity.level_source_id][:count] += 1
      end

      if !activity.best?
        all_but_best_code_map[activity.level_source_id][:count] += 1
      end
    end

    # Setting up the popular incorrect code
    if !all_but_best_code_map.empty?
      sorted_all_but_best_code = all_but_best_code_map.values.sort_by {|v| -v[:count] }
      pop_level_source_ids = Array.new([sorted_all_but_best_code.length - 1, 9].min)
      for idx in 0..[sorted_all_but_best_code.length - 1, 9].min
        pop_level_source_id = sorted_all_but_best_code[idx][:level_source_id]
        pop_level_source_ids[idx] = pop_level_source_id
        if passing_code_map.has_key?(pop_level_source_id)
          passing_code_map[pop_level_source_id][:popular] = true
          passing_code_map[pop_level_source_id][:pop_level_source_idx] = idx
        elsif finished_code_map.has_key?(pop_level_source_id)
          finished_code_map[pop_level_source_id][:popular] = true
          finished_code_map[pop_level_source_id][:pop_level_source_idx] = idx
        elsif unsuccessful_code_map.has_key?(pop_level_source_id)
          unsuccessful_code_map[pop_level_source_id][:popular] = true
          unsuccessful_code_map[pop_level_source_id][:pop_level_source_idx] = idx
        end
      end
    end

    @best_code = best_code_map.values.sort_by {|v| -v[:count] }
    @passing_code = passing_code_map.values.sort_by {|v| -v[:count] }
    @finished_code = finished_code_map.values.sort_by {|v| -v[:count] }
    @unsuccessful_code = unsuccessful_code_map.values.sort_by {|v| -v[:count] }
    @pop_level_source_ids = pop_level_source_ids

  end

  def assume_identity_form
    authorize! :manage, :all
  end

  def assume_identity
    authorize! :manage, :all

    user = User.where(:id => params[:user_id]).first
    user ||= User.where(:username => params[:user_id]).first
    user ||= User.find_by_email_or_hashed_email params[:user_id]

    if user
      sign_in user, :bypass => true
      redirect_to '/'
    else
      flash[:alert] = 'User not found'
      render :assume_identity_form
    end
  end

  def lookup_section
    authorize! :manage, :all
    @section = Section.find_by_code params[:section_code]
    if params[:section_code] && @section.nil?
      flash[:alert] = 'Section code not found'
    end
  end

  def level_completions
    authorize! :read, :reports
    require 'date'
# noinspection RubyResolve
    require '../dashboard/scripts/archive/ga_client/ga_client'

    @start_date = (params[:start_date] ? DateTime.parse(params[:start_date]) : (DateTime.now - 7)).strftime('%Y-%m-%d')
    @end_date = (params[:end_date] ? DateTime.parse(params[:end_date]) : DateTime.now.prev_day).strftime('%Y-%m-%d')

    output_data = {}
    %w(Attempt Success).each do |key|
      dimension = 'ga:eventLabel'
      metric = 'ga:totalEvents,ga:uniqueEvents,ga:avgEventValue'
      filter = "ga:eventAction==#{key};ga:eventCategory==Puzzle"
      if params[:filter]
        filter += ";ga:eventLabel=@#{params[:filter].to_s.gsub('_','/')}"
      end
      ga_data = GAClient.query_ga(@start_date, @end_date, dimension, metric, filter)
      if ga_data.data.containsSampledData
        throw new ArgumentError 'Google Analytics response contains sampled data, aborting.'
      end

      ga_data.data.rows.each do |r|
        label = r[0]
        output_data[label] ||= {}
        output_data[label]["Total#{key}"] = r[1]
        output_data[label]["Unique#{key}"] = r[2]
        output_data[label]["Avg#{key}"] = r[3]
      end
    end
    output_data.each_key do |key|
      output_data[key]['Avg Success Rate'] = output_data[key].delete('AvgAttempt')
      output_data[key]['Avg attempts per completion'] = output_data[key].delete('AvgSuccess')
      output_data[key]['Avg Unique Success Rate'] = output_data[key]['UniqueSuccess'].to_f / output_data[key]['UniqueAttempt'].to_f
    end

    @data_array = output_data.map do |key, value|
      {'Puzzle' => key}.merge(value)
    end
    require 'naturally'
    @data_array = @data_array.select{|x| x['TotalAttempt'].to_i > 10}.sort_by{|i| Naturally.normalize(i.send(:fetch, 'Puzzle'))}
  end

  private
  def get_base_usage_activity
    Activity.all.order('id desc').includes([:user, :level_source, {level: :game}]).limit(50)
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_script
    @script = Script.get_from_cache(params[:script_id]) if params[:script_id]
  end
end
