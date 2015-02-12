class External < DSLDefined
  def dsl_default
    <<-TEXT.strip_heredoc.chomp
    name 'unique level name here'
    title 'title'
    description 'description here'
    href 'path/to/html/in/asset/folder'
    TEXT
  end
end
