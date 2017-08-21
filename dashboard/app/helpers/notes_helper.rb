module NotesHelper
  include LocaleHelper

  def get_slides_by_video_key(video_key)
    slides = try_t('slides.' + video_key)
    return nil unless slides
    return slides if I18n.locale == I18n.default_locale

    # If we're in a non-english locale, fold in the English yaml's slides for
    # image references to avoid previously translation-broken asset paths
    slides_english = try_t('slides.' + video_key, locale: :en)
    slides.each do |slide_number, slide_data|
      unless slides_english.key?(slide_number) && slides_english[slide_number].key?(:image)
        raise "Missing English slide #{slide_number} for video #{video_key}"
      end
      slide_data[:image] = slides_english[slide_number][:image]
    end
    slides
  end
end
