module ReportsHelper
  def bronze_fraction_image_path(completion)
    'bronze_' + [[(completion * 10 / Trophy::BRONZE_THRESHOLD).floor * 10, 100].min, 0].max.to_s + '.png'
  end
  def silver_fraction_image_path(completion)
    'silver_' + [[((completion - Trophy::BRONZE_THRESHOLD) * 10 /
                   (Trophy::SILVER_THRESHOLD - Trophy::BRONZE_THRESHOLD)).floor * 10, 100].min, 0].max.to_s + '.png'
  end
  def gold_fraction_image_path(completion)
    'gold_' + [[((completion - Trophy::SILVER_THRESHOLD) * 10 /
                 (Trophy::GOLD_THRESHOLD - Trophy::SILVER_THRESHOLD)).floor * 10, 100].min, 0].max.to_s + '.png'
  end
  
  def level_passed(params)
    result = 0
    if params[:user]
      result = params[:user_level].best_result if params[:user_level] && params[:user_level].best_result
    elsif (session[:progress] && session[:progress][params[:level_id]])
      result = session[:progress][params[:level_id]]
    end
  
    result >= Activity::MINIMUM_PASS_RESULT
  end
end
