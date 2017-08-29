class ErrorsController < ApplicationController
  after_filter :return_errors, only: [:error_404, :error_500, :error_422]
  def error_404
    @status = 404
    @layout = "application"
    @template = "not_found"
  end

  def error_500
    @status = 500
    @layout = "application"
    @template = "internal_error"
  end

  def error_422
    @status = 422
    @layout = "application"
    @template = "unacceptable_error"
  end

  private

  def return_errors
    respond_to do |format|
      format.html {render template: 'errors/' + @template, layout: 'layouts/' + @layout, status: @status}
      format.all  {render nothing: true, status: @status}
    end
  end
end
