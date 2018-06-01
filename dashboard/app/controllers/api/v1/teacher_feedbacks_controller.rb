class Api::V1::TeacherFeedbacksController < Api::V1::JsonApiController
  load_and_authorize_resource
  #authorize_resource
  def show
    @teacher_feedback = TeacherFeedback.find(params[:id])
  end

  # POST /teacher_feedbacks
  # POST /teacher_feedbacks.json
  def create
    #puts "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    #puts teacher_feedback_params
    #@teacher_feedback = TeacherFeedback.new(teacher_feedback_params)
    #puts "_______________________________________________-"

    puts "HERRRRRRRRRRRRRRRRRRRRRRRRRRREEEEEEEEEEEEEE"
    if @teacher_feedback.save

      head :created
    else
      head :bad_request
    end
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def teacher_feedback_params
    puts "Params!!"
    params.require(:teacher_feedback).permit(:student_id, :level_id, :section_id, :comment)
    puts 'HERE'
  end
end
