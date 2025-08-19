class PortfolioController < ApplicationController
  def show
    student_id = params[:student_id]
    student = User.find(student_id)
    @student_name = student.name
    @portfolio_entries = PortfolioEntry.where(student_id: student_id)
  end
end
