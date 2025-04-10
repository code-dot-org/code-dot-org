class UserPreferencesController < ApplicationController
  before_action :authenticate_user!

  def update
    preference = UserPreference.find_or_initialize_by(user_id: current_user.id)
    # Merge existing editor/console font size JSON with new values if param is present.
    # to_h handles if current editor/console font size is nil.
    merged_editor_font_size = update_params[:editor_font_size] ?
      preference.editor_font_size.to_h.merge(update_params[:editor_font_size]) :
      preference.editor_font_size

    merged_console_font_size = update_params[:console_font_size] ?
      preference.console_font_size.to_h.merge(update_params[:console_font_size]) :
      preference.console_font_size

    preference.update!(
      section_order: update_params[:section_order] || preference.section_order,
      editor_font_size: merged_editor_font_size,
      console_font_size: merged_console_font_size
    )
  end

  def console_font_size
    preference = UserPreference.find_by(user_id: current_user.id)

    if preference && preference.console_font_size.present?
      render json: {console_font_size: preference.console_font_size}
    else
      render json: {}, status: :not_found
    end
  end

  def editor_font_size
    preference = UserPreference.find_by(user_id: current_user.id)

    if preference && preference.editor_font_size.present?
      render json: {editor_font_size: preference.editor_font_size}
    else
      render json: {}, status: :not_found
    end
  end

  private def update_params
    params.transform_keys(&:underscore).permit(
      section_order: [],
      console_font_size: {},
      editor_font_size: {}
    )
  end
end
