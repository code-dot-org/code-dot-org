# TODO: reorganize this so it's more obvious which actions are for
# students, teachers, and admins (most likely move into more relevant
# controllers)

class ReportsController < ApplicationController
  before_filter :authenticate_user!, except: [:header_stats]

  check_authorization except: [:header_stats, :students]

  before_action :set_script
  include LevelSourceHintsHelper

  def user_stats
    @user = User.find(params[:user_id])
    authorize! :read, @user

    #@recent_activity = Activity.where(['user_id = ?', user.id]).order('id desc').includes({level: :game}).limit(2)
    @recent_levels = UserLevel.find_by_sql(<<SQL)
select ul.*, sl.game_chapter, l.game_id, sl.chapter, sl.script_id, sl.id as script_level_id
from user_levels ul
inner join script_levels sl on sl.level_id = ul.level_id
inner join levels l on l.id = ul.level_id
where sl.script_id = 1 and ul.user_id = #{@user.id}
order by ul.updated_at desc limit 2
SQL
  end

  def header_stats
    user = current_user
    if stale?(:etag => [@script, user || session[:progress]], :last_modified => [@script.updated_at, (user || session[:progress]).try(:[], :updated_at) || @script.updated_at].max)
      render file: "shared/_user_stats", layout: false, locals: { user: user }
    end
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

  ADMIN_GALLERY_PER_PAGE = 25
  def admin_gallery
    authorize! :read, :reports

    @gallery_activities = GalleryActivity.order(id: :desc).page(params[:page]).per(ADMIN_GALLERY_PER_PAGE)
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
    user ||= User.where(:email => params[:user_id]).first

    if user
      sign_in user, :bypass => true
      redirect_to '/'
    else
      flash[:error] = "I can't find that user"
      render :assume_identity_form
    end
  end

  private
  def get_base_usage_activity
    Activity.all.order('id desc').includes([:user, :level_source, {level: :game}]).limit(50)
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_script
    @script = Script.find(params[:script_id]) if params[:script_id]
  end
end
