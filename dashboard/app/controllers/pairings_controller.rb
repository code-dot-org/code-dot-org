class PairingsController < ApplicationController

  def show
    # [{id: 1, name: "A section"}, {id: 15, name: "Anotther section"}]
    @sections = current_user.sections_as_student.map do |section|
      {id: section.id, name: section.name}
    end

    @react_props = {sections: @sections}
  end
end
