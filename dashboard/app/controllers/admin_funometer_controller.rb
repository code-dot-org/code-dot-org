require 'cdo/env'

# The controller for Fun-O-Meter reports.
class AdminFunometerController < ApplicationController
  before_filter :authenticate_user!
  before_action :require_admin
  check_authorization

  def funometer
    require 'cdo/properties'
    SeamlessDatabasePool.use_persistent_read_connection do
      @stats = Properties.get(:funometer)
      @ratings_by_day = @stats['ratings_by_day'] if @stats.present?
    end
  end

  def funometer_by_script
    SeamlessDatabasePool.use_persistent_read_connection do
      @script_id = params[:script_id]
      @script_name = Script.find(@script_id)[:name]

      # Compute the global funometer percentage for the script.
      ratings = PuzzleRating.where('puzzle_ratings.script_id = ?', @script_id)
      @overall_percentage = get_percentage_positive(ratings)

      # Generate the funometer percentages for the script, by day.
      @ratings_by_day = get_ratings_by_day(ratings)

      # Generate the funometer percentages for the script, by stage.
      ratings_by_stage = ratings.
                         joins("INNER JOIN script_levels ON puzzle_ratings.script_id = script_levels.script_id AND puzzle_ratings.level_id = script_levels.level_id").
                         joins("INNER JOIN stages ON stages.id = script_levels.stage_id").
                         group('script_levels.stage_id').
                         order('script_levels.stage_id')
      @ratings_by_stage_headers = ['Stage ID', 'Stage Name', 'Percentage', 'Count']
      @ratings_by_stage = ratings_by_stage.
                          select('stage_id', 'name', '100.0 * SUM(rating) / COUNT(rating) AS percentage', 'COUNT(rating) AS cnt')

      # Generate the funometer percentages for the script, by level.
      ratings_by_level = ratings.joins(:level).group(:level_id).order(:level_id)
      @ratings_by_level_headers = ['Level ID', 'Level Name', 'Percentage', 'Count']
      @ratings_by_level = ratings_by_level.
                          select('level_id', 'name', '100.0 * SUM(rating) / COUNT(rating) AS percentage', 'COUNT(rating) AS cnt')
    end
  end

  def funometer_by_stage
    SeamlessDatabasePool.use_persistent_read_connection do
      stage = Stage.find(params[:stage_id])
      @stage_name = stage[:name]
      @script_id = stage[:script_id]
      @level_ids = ScriptLevel.where('stage_id = ?', params[:stage_id]).pluck(:level_id)

      # Compute the global funometer percentage for the stage.
      ratings = PuzzleRating.where(level_id: @level_ids)
      @overall_percentage = get_percentage_positive(ratings)

      # Generate the funometer percentages for the stage, by day.
      @ratings_by_day = get_ratings_by_day(ratings)

      # Generate the funometer percentages for the stage, by level.
      ratings_by_level = ratings.joins(:level).group(:level_id)
      @ratings_by_level_headers = ['Level ID', 'Level Name', 'Percentage', 'Count']
      @ratings_by_level = ratings_by_level.
                          select('level_id',
                                 'name',
                                 '100.0 * SUM(rating) / COUNT(rating) AS percentage',
                                 'COUNT(rating) AS cnt')
    end
  end

  def funometer_by_script_level
    SeamlessDatabasePool.use_persistent_read_connection do
      @script_id = params[:script_id]
      @script_name = Script.find(@script_id)[:name]
      @level_id = params[:level_id]
      @level_name = Level.find(@level_id)[:name]

      ratings = PuzzleRating.
                where('puzzle_ratings.script_id = ?', @script_id).
                where('level_id = ?', @level_id)
      @overall_percentage = get_percentage_positive(ratings)

      # Generate the funometer percentages for the level, by day.
      @ratings_by_day = get_ratings_by_day(ratings)
    end
  end

  private
  def get_ratings_by_day(ratings_to_process)
    return ratings_to_process.
           group('DATE(created_at)').
           order('DATE(created_at)').
           pluck('DATE(created_at)', '100.0 * SUM(rating) / COUNT(rating)', 'COUNT(rating)')
  end

  def get_percentage_positive(ratings_to_process)
    return 100.0 * ratings_to_process.where(rating: 1).count / ratings_to_process.count
  end
end
