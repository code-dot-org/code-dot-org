class ActivityHintsController < ApplicationController
  def update
    @activity_hint = ActivityHint.find(params[:id])
    @activity_hint.set_made_visible if @activity_hint
    respond_to do |format|
      format.json { head :no_content }
    end
  end
end
