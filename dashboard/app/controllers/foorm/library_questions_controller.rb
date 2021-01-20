module Foorm
  # Foorm Library Question Editor is only available on levelbuilder or test, for those with levelbuilder permissions.
  class LibraryQuestionsController < ApplicationController
    before_action :require_levelbuilder_mode_or_test_env
    before_action :authenticate_user!
    authorize_resource

    # PUT '/foorm/library_questions/:id'
    def update
      question = params[:question]
      @library_question.question = question

      @library_question.save
    end

    # GET '/foorm/library_questions/editor'
    def editor
      formatted_names_and_versions = Foorm::LibraryQuestion.all.map {|library_question| {name: library_question.library_name, version: library_question.library_version}}.uniq
      formatted_names_and_versions.sort_by! {|library| library[:name]}
      categories = formatted_names_and_versions.map {|data| data[:name].slice(0, data[:name].rindex('/'))}.uniq

      @script_data = {
        props: {
          libraryNamesAndVersions: formatted_names_and_versions,
          libraryCategories: categories
        }.to_json
      }

      render 'foorm/library_questions/editor'
    end
  end
end
