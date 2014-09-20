class TeacherBonusPrizesController < ApplicationController
  before_filter :authenticate_user!
  check_authorization
  load_and_authorize_resource
  
  before_action :set_teacher_bonus_prize, only: [:show, :edit, :update, :destroy]

  # GET /teacher_bonus_prizes
  # GET /teacher_bonus_prizes.json
  def index
    @teacher_bonus_prizes = TeacherBonusPrize.all
  end

  # GET /teacher_bonus_prizes/1
  # GET /teacher_bonus_prizes/1.json
  def show
  end

  # GET /teacher_bonus_prizes/new
  def new
    @teacher_bonus_prize = TeacherBonusPrize.new
  end

  # GET /teacher_bonus_prizes/1/edit
  def edit
  end

  # POST /teacher_bonus_prizes
  # POST /teacher_bonus_prizes.json
  def create
    @teacher_bonus_prize = TeacherBonusPrize.new(teacher_bonus_prize_params)

    respond_to do |format|
      if @teacher_bonus_prize.save
        format.html { redirect_to @teacher_bonus_prize, notice: 'Teacher bonus prize was successfully created.' }
        format.json { render action: 'show', status: :created, location: @teacher_bonus_prize }
      else
        format.html { render action: 'new' }
        format.json { render json: @teacher_bonus_prize.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /teacher_bonus_prizes/1
  # PATCH/PUT /teacher_bonus_prizes/1.json
  def update
    respond_to do |format|
      if @teacher_bonus_prize.update(teacher_bonus_prize_params)
        format.html { redirect_to @teacher_bonus_prize, notice: 'Teacher bonus prize was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @teacher_bonus_prize.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /teacher_bonus_prizes/1
  # DELETE /teacher_bonus_prizes/1.json
  def destroy
    @teacher_bonus_prize.destroy
    respond_to do |format|
      format.html { redirect_to teacher_bonus_prizes_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_teacher_bonus_prize
      @teacher_bonus_prize = TeacherBonusPrize.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def teacher_bonus_prize_params
      params.require(:teacher_bonus_prize).permit(:prize_provider_id, :code, :user_id)
    end

    # this is to fix a ForbiddenAttributesError cancan issue
    prepend_before_filter do
      params[:teacher_bonus_prize] &&= teacher_bonus_prize_params
    end
end
