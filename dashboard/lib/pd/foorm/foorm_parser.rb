require 'pd/foorm/foorm_parser.rb'

module Pd::Foorm
  class FoormParser
    include Constants
    extend Helper

    def self.parse_forms(forms)
      parsed_forms = {}
      forms.each do |form|
        parsed_form = {
          questions: {}
        }
        form_questions = JSON.parse(form.questions, symbolize_names: true)
        parsed_form[:title] = form_questions[:title]
        form_questions[:pages].each do |page|
          page[:elements].each do |question_data|
            # TODO: cover case of panel
            next unless QUESTION_TYPES.include?(question_data[:type])
            parsed_question = {
              title: question_data[:title],
              type: QUESTION_TO_ANSWER_TYPES[question_data[:type]]
            }
            case question_data[:type]
            when TYPE_CHECKBOX, TYPE_RADIO
              parsed_question[:choices] = question_data[:choices]
            when TYPE_RATING
              parsed_question[:choices] = get_friendly_rating_choices(question_data)
            when TYPE_MATRIX
              parsed_question[:rows] = question_data[:rows]
              parsed_question[:columns] = question_data[:columns]
            end
            parsed_form[:questions][question_data[:name]] = parsed_question
          end
        end
        parsed_forms[get_form_key(form.name, form.version)] = parsed_form
      end
      parsed_forms
    end

    def self.get_friendly_rating_choices(question_data)
      choices = []
      min_rate = 1 || question_data[:rateMin]
      max_rate = 5 || question_data[:rateMax]
      min_rate_description = question_data[:minRateDescription] ?
                               "#{min_rate} - #{question_data[:minRateDescription]}" :
                               min_rate.to_s
      max_rate_description = question_data[:maxRateDescription] ?
                               "#{max_rate} - #{question_data[:maxRateDescription]}" :
                               max_rate.to_s
      choices << {value: min_rate.to_s, text: min_rate_description}
      (min_rate + 1...max_rate).each do |n|
        choices << {value: n.to_s, text: n.to_s}
      end
      choices << {value: max_rate.to_s, text: max_rate_description}
    end
  end
end
