app = Rails.application.class.name.split('::').first.downcase
env = Rails.env

colors = {
  development: :green,
  production: :red,
  levelbuilder: :cyan,
  staging: :cyan,
}
color = colors[env.to_sym] || :white

IRB.conf[:PROMPT] ||= {}
IRB.conf[:PROMPT][:RAILS_APP] = {
  PROMPT_I: "[#{env.colorize(color)}] #{app} > ",
  PROMPT_N: nil,
  PROMPT_S: nil,
  PROMPT_C: nil,
  RETURN: "=> %s\n",
}

IRB.conf[:PROMPT_MODE] = :RAILS_APP
