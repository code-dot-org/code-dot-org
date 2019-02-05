task pseudolocalize: :environment do
  def pseudolocalize_string(s)
    # TODO: Something smarter
    "!!-#{s}-!!"
  end

  def pseudolocalize_hash(h)
    h.reduce({}) do |acc, (k, v)|
      acc[k] = pseudolocalize(v)
      acc
    end
  end

  def pseudolocalize_array(a)
    a.map do |x|
      pseudolocalize(x)
    end
  end

  def pseudolocalize(x)
    case x
    when String
      pseudolocalize_string(x)
    when Hash
      pseudolocalize_hash(x)
    when Array
      pseudolocalize_array(x)
    else
      raise "Unexpected type in messages: #{x.class}"
    end
  end

  SOURCE_LOCALE = 'en'.freeze
  PSEUDO_LOCALE = 'en-PLOC'.freeze

  srcs = Dir.glob("#{Rails.root}/config/locales/*#{SOURCE_LOCALE}.json")
  srcs.each do |src|
    puts "converting: #{src}"
    dest = src.gsub("#{SOURCE_LOCALE}.json", "#{PSEUDO_LOCALE}.json")
    messages = JSON.parse(File.read(src))
    File.open(dest, 'w') do |f|
      transformed = {PSEUDO_LOCALE => pseudolocalize(messages[SOURCE_LOCALE])}
      File.write(f, JSON.pretty_generate(transformed))
    end
  end
end
