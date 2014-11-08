# Abstract class for DSL types which provide a standard set of content-definition methods.
class ContentDSL < BaseDSL
  def title(text) @hash[:title] = text end

  # legacy
  def description(text) @hash[:content1] = text end
  def banner(text) @hash[:content2] = text end

  # new
  def content1(text) @hash[:content1] = text end
  def content2(text) @hash[:content2] = text end
  def content3(text) @hash[:content3] = text end

  def pre_title(text) @hash[:pre_title] = text end
  def pre_body(text) @hash[:pre_body] = text end
  def pre_image(text) @hash[:pre_image] = text end
  def pre_ani(text) @hash[:pre_ani] = text end

  def parse_output
    {name: @name, properties: @hash}
  end

  def i18n_strings
    strings = {}
    strings[@hash[:title]] = @hash[:title]
    strings[@hash[:content1]] = @hash[:content1] unless @hash[:content1].blank?
    strings[@hash[:content2]] = @hash[:content2] unless @hash[:content2].blank?
    strings[@hash[:content3]] = @hash[:content3] unless @hash[:content3].blank?
    strings[@hash[:pre_title]] = @hash[:pre_title] unless @hash[:pre_title].blank?
    strings[@hash[:pre_body]] = @hash[:pre_body] unless @hash[:pre_body].blank?
    strings[@hash[:pre_image]] = @hash[:pre_image] unless @hash[:pre_image].blank?
    strings[@hash[:pre_ani]] = @hash[:pre_ani] unless @hash[:pre_ani].blank?
    {@name => strings}
  end
end
