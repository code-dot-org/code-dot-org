class PairingsController < ApplicationController

  def show
    respond_to do |format|
      format.html do
        @props = {source: url_for()}.to_json
        render
      end
      format.js { render json: pairings_summary }
    end
  end


  private
  def pairings_summary
    # [{id: 1, name: "A section"}, {id: 15, name: "Anotther section"}]
    sections = current_user.sections_as_student.map do |section|
      {id: section.id, name: section.name, students:
       (section.students - [current_user]).map do |student|
         {id: student.id, name: student.name}
       end
      }
    end

    pairings = [] # read/write this from session

    {pairings: pairings, sections: sections}
  end
end
