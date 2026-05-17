class Api::V1::ScrapbookEntriesController < Api::V1::JSONApiController
  before_action :authenticate_user!

  def create
    entry = ScrapbookEntry.find_or_initialize_by(
      user_id: current_user.id,
      script_id: params[:script_id],
      level_id: params[:level_id]
    )
    entry.assign_attributes(scrapbook_entry_params)
    if entry.save
      render json: entry.as_json(only: [:id, :script_id, :level_id, :at_first_text, :but_then_text, :and_now_text, :before_asset_url, :after_asset_url])
    else
      render json: {errors: entry.errors.full_messages}, status: :unprocessable_entity
    end
  end

  def destroy
    entry = ScrapbookEntry.find_by(id: params[:id], user_id: current_user.id)
    if entry.nil?
      head :not_found
      return
    end
    entry.destroy
    head :no_content
  end

  def index
    entries = ScrapbookEntry.where(user_id: current_user.id)
    entries = entries.where(script_id: params[:script_id]) if params[:script_id].present?
    entries = entries.where(level_id: params[:level_id]) if params[:level_id].present?
    entries = entries.order(created_at: :desc).to_a

    units = Unit.where(id: entries.map(&:script_id).uniq).index_by(&:id)
    levels = Level.where(id: entries.map(&:level_id).uniq).index_by(&:id)

    render json: entries.map {|entry| entry_with_names(entry, units[entry.script_id], levels[entry.level_id])}
  end

  private def entry_with_names(entry, unit, level)
    {
      id: entry.id,
      script_id: entry.script_id,
      level_id: entry.level_id,
      script_title: unit&.localized_title,
      level_name: level&.name,
      level_url: build_level_url(entry, unit),
      before_asset_url: entry.before_asset_url,
      after_asset_url: entry.after_asset_url,
      at_first_text: entry.at_first_text,
      but_then_text: entry.but_then_text,
      and_now_text: entry.and_now_text,
    }
  end

  private def build_level_url(entry, unit)
    return nil unless unit
    level_ids = [entry.level_id] +
      ParentLevelsChildLevel.where(child_level_id: entry.level_id).pluck(:parent_level_id)
    script_level = ScriptLevel.joins(:levels).
      where(script_id: entry.script_id, levels: {id: level_ids}).first
    return nil unless script_level&.lesson
    "/s/#{unit.name}/lessons/#{script_level.lesson.relative_position}/levels/#{script_level.position}"
  end

  private def scrapbook_entry_params
    params.require(:scrapbook_entry).permit(
      :before_asset_url,
      :after_asset_url,
      :at_first_text,
      :but_then_text,
      :and_now_text
    )
  end
end
