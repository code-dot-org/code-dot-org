task :pseudolocalize => :environment do

  def pseudolocalize_string(s)
    #TODO: Something smarter
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
      raise "Unexpected type in messages YML: #{x.class}"
    end
  end

  SOURCE_LOCALE = 'en'
  PSEUDO_LOCALE = 'en-PLOC'

  srcs = Dir.glob("#{Rails.root}/config/locales/*#{SOURCE_LOCALE}.yml")
  srcs.each do |src|
    puts "converting: #{src}"
    dest = src.gsub("#{SOURCE_LOCALE}.yml", "#{PSEUDO_LOCALE}.yml")
    messages = YAML.load_file(src)
    File.open(dest, 'w') do |f|
      transformed = {PSEUDO_LOCALE => pseudolocalize(messages[SOURCE_LOCALE])}
      YAML.dump(transformed, f)
    end
  end

end
