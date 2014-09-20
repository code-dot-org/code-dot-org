def format_integer_with_commas(i)
  i.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse
end
