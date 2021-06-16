module Foorm
  # Foorm Library Editor is only available on levelbuilder or test, for those with levelbuilder permissions.
  class LibrariesController < ApplicationController
    before_action :require_levelbuilder_mode_or_test_env
    before_action :authenticate_user!
    load_and_authorize_resource

    # GET '/foorm/libraries/editor'
    def editor
      library_names_and_versions = Foorm::Library.all.map do |library|
        {
          id: library.id,
          name: library.name,
          version: library.version
        }
      end

      library_names_and_versions.sort_by! {|library| library[:name]}

      categories = library_names_and_versions.map {|data| data[:name].slice(0, data[:name].rindex('/'))}.uniq

      @unit_data = {
        props: {
          libraryNamesAndVersions: library_names_and_versions,
          libraryCategories: categories
        }.to_json
      }

      render 'foorm/libraries/editor'
    end

    # GET '/foorm/libraries/:id/question_names'
    def question_names
      question_names = @library.library_questions.map do |library_question|
        {
          id: library_question.id,
          name: library_question.question_name,
          type: JSON.parse(library_question.question)['type'] || 'unknown'
        }
      end
      question_names.sort_by! {|library_question| [library_question[:type], library_question[:name]]}

      render json: question_names
    end
  end
end
