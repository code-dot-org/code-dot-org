class CollabDemoController < ApplicationController
  def demo
    @document_id = params[:document_id]
  end
end
