module Lessons
  # Levelbuilder pages for a lesson's deck of intro slides — the AI
  # generator, the panels viewer, and the panels editor — plus the
  # save endpoint. Slides are panels-app panels persisted on disk via
  # the Slides class (see dashboard/lib/slides.rb), independent of the
  # lesson's level set.
  #
  # Split out of LessonsController so the slides concern lives on its
  # own. The actions are deliberately owner-shaped only at the edges
  # (resolve a Lesson, read its `slides` deck) — when units or courses
  # grow decks, a sibling controller can follow the same pattern.
  #
  # Every action is levelbuilder-only: `authorize! :manage, @lesson`
  # passes only for a levelbuilder when the server is in levelbuilder
  # mode (or the test env), matching the ability grant on Lesson.
  class SlidesController < ApplicationController
    include LevelsHelper
    include ResolvesLessonFromParams

    before_action :require_levelbuilder_apis
    before_action :set_lesson
    before_action :authorize_lesson

    # GET /lessons/:id/slides/generate
    # GET /s/:script/lessons/:position/slides/generate (+ course twin)
    def generate
      # Two slashes back from /slides/generate gets us to the lesson
      # root; from there we re-attach /edit and /slides for the
      # surrounding pages.
      lesson_root = request.path.delete_suffix('/slides/generate')
      edit_url = "#{lesson_root}/edit"
      edit_url = edit_lesson_path(id: @lesson.id) if lesson_root == request.path
      @lesson_data = @lesson.summarize_for_slides_generate.merge(
        lessonPath: @lesson.get_uncached_show_path,
        editLessonUrl: edit_url,
        slidesUrl: "#{lesson_root}/slides",
      )
      view_options(full_width: true)
      render :generate
    end

    # GET /lessons/:id/slides — panels viewer.
    def show
      setup_slides_view
      # The viewer is a focused slide surface; the marketing footer just
      # distracts from the deck. (The editor keeps its footer.)
      view_options(no_footer: true)
      render :show
    end

    # GET /lessons/:id/slides/edit — panels editor. Same payload as the
    # viewer, but the page mounts EditPanels with a Save button that
    # PUTs back to #update.
    def edit
      setup_slides_view
      render :edit
    end

    # PUT /lessons/:id/slides_data — write slides.json. Body:
    #   {
    #     slides: [{key, description, panel?}, ...],
    #     generateSlidesOutline?: "<page-level prompt>"
    #   }
    # `slides` is required and replaces the deck wholesale (the page
    # sends its full ordered array on every save). `generateSlidesOutline`,
    # when supplied, is persisted on the Lesson; absent leaves it alone.
    def update
      raw = params[:slides]
      return head :bad_request, json: {message: 'slides param required'} unless raw
      slides =
        if raw.is_a?(String)
          JSON.parse(raw)
        else
          # Rails wraps each entry of an array body in
          # ActionController::Parameters; the Slides writer wants plain
          # Hashes for File.write to JSON-encode.
          Array(raw).map do |entry|
            if entry.respond_to?(:permit)
              entry.permit(:key, :description, panel: {}).to_h.tap do |h|
                # `panel` keys are open-ended (the panels-app Panel
                # record has many fields and grows over time), so we
                # keep the raw nested structure rather than enumerating.
                h['panel'] = entry[:panel].to_unsafe_h if entry[:panel].respond_to?(:to_unsafe_h)
              end
            else
              entry
            end
          end
        end
      @lesson.slides.write(slides)

      if params.key?(:generateSlidesOutline)
        @lesson.generate_slides_outline = params[:generateSlidesOutline].to_s
        @lesson.save! if @lesson.changed?
      end

      render json: @lesson.summarize_for_slides_generate
    rescue StandardError => exception
      render status: :unprocessable_entity, json: {message: exception.message}
    end

    private def set_lesson
      @lesson = params[:id] ? Lesson.find(params[:id]) : lookup_by_position
    end

    private def authorize_lesson
      authorize! :manage, @lesson
    end

    # Shared payload for the viewer and the editor: the persisted panels
    # plus the full slides records.
    private def setup_slides_view
      # Teacher notes are stripped for non-teacher users so the field
      # never lands in a student's DOM. (Today every caller is a
      # levelbuilder, so notes are always included; the check stays so
      # the payload stays correct if access widens later.)
      show_teacher_notes = !!(current_user&.teacher? || current_user&.levelbuilder?)
      saved = @lesson.slides.read(include_teacher_notes: show_teacher_notes)
      panels = (saved['slides'] || []).map {|s| s['panel']}.compact
      @slides_data = {
        lessonId: @lesson.id,
        lessonName: @lesson.name,
        panels: panels,
        slides: saved['slides'] || [],
        slidesFilePath: @lesson.slides.relative_path,
        showTeacherNotes: show_teacher_notes,
      }
      view_options(full_width: true)
    end
  end
end
