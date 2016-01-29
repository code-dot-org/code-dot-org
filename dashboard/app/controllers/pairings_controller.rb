class PairingsController < ApplicationController

  def show
    # [{id: 1, name: "A section"}, {id: 15, name: "Anotther section"}]
    @sections = current_user.sections_as_student.map do |section|
      {id: section.id, name: section.name, students:
       (section.students - [current_user]).map do |student|
         {id: student.id, name: student.name}
       end
      }
    end

    @pairings = User.limit(1).map do |user|
      {id: user.id, name: user.name}
    end

    @react_props = {pairings: @pairings, sections: @sections}
  end
end
