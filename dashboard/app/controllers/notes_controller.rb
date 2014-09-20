class NotesController < ApplicationController
  def index
    slides_localized = try_t('slides.' + params[:key])

    unless slides_localized
      render('notes/coming_soon', layout: false, formats: [:html]) and return
    end

    @slides = fix_slide_images(slides_localized)

    render layout: false, formats: [:html]
  end

  private

  # Fold in the English yaml's slides for image references to avoid
  # previously translation-broken asset paths
  def fix_slide_images(slides)
    slides_english = try_t('slides.' + params[:key], locale: :en)
    slides.each do |slide_number, slide_data|
      unless slides_english.key?(slide_number) && slides_english[slide_number].key?(:image)
        throw("Missing English slide #{slide_number} for video #{params[:key]}")
      end
      slide_data[:image] = slides_english[slide_number][:image]
    end
    slides
  end
end
