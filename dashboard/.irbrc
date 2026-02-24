require 'irb'

app = Rails.application.class.name.split('::').first.downcase
colors = {
  development: [:GREEN],
  production: [:RED, :BOLD],
  levelbuilder: [:CYAN],
  staging: [:CYAN],
}

color = colors.fetch(Rails.env.to_sym, [])
env = IRB::Color.colorize(Rails.env, color)

IRB.conf[:PROMPT] ||= {}
IRB.conf[:PROMPT][:RAILS_APP] = {
  PROMPT_I: "[#{env}] #{app} > ",
  PROMPT_S: "[#{env}] #{app} %l ",
  PROMPT_C: "[#{env}] #{app} * ",
  RETURN: "=> %s\n",
}

IRB.conf[:PROMPT_MODE] = :RAILS_APP

# Disable autocomplete, which causes perf issues since the Ruby 3.1 upgrade.
IRB.conf[:USE_AUTOCOMPLETE] = false
