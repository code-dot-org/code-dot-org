module NotesHelper
  include LocaleHelper

  def get_slides_by_video_key(video_key)
    slides_key = "slides.#{video_key}"
    slides = {}
    1.step.each do |n|
      slide_text = try_t("#{slides_key}.#{n}.text")
      slide_image = try_t("#{slides_key}.#{n}.image")
      break unless slide_text
      slides[n] = {text: slide_text, image: slide_image}
    end
    return nil if slides.empty?
    return slides if I18n.locale == I18n.default_locale

    # If we're in a non-english locale, fold in the English yaml's slides for
    # image references to avoid previously translation-broken asset paths
    slides_english = {}
    1.step.each do |n|
      slide_image = try_t("#{slides_key}.#{n}.image", locale: :en)
      break unless slide_image
      slides_english[n] = {image: slide_image}
    end
    slides.each do |slide_number, slide_data|
      unless slides_english.key?(slide_number) && slides_english[slide_number].key?(:image)
        raise "Missing English slide #{slide_number} for video #{video_key}"
      end
      slide_data[:image] = slides_english[slide_number][:image]
    end
    slides
  end
end
