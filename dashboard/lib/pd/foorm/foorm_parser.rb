require 'pd/foorm/foorm_parser.rb'

module Pd::Foorm
  class FoormParser
    include Constants
    extend Helper

    def self.parse_forms(forms)
      parsed_forms = {}
      forms.each do |form|
        parsed_form = {}
        form_questions = JSON.parse(form.questions, symbolize_names: true)
        form_questions[:pages].each do |page|
          page[:elements].each do |question_data|
            parsed_form = parse_element(question_data, parsed_form)
          end
        end
        parsed_forms[get_form_key(form.name, form.version)] = parsed_form
      end
      parsed_forms
    end

    def self.parse_element(question_data, parsed_form)
      if question_data[:type] == 'panel'
        question_data[:elements].each do |panel_question_data|
          parse_element(panel_question_data, parsed_form)
        end
      else
        parsed_form[question_data[:name]] = parse_question(question_data)
      end
      parsed_form
    end

    def self.parse_question(question_data)
      return unless QUESTION_TYPES.include?(question_data[:type])
      parsed_question = {
        title: question_data[:title],
        type: QUESTION_TO_ANSWER_TYPES[question_data[:type]]
      }
      case question_data[:type]
      when TYPE_CHECKBOX, TYPE_RADIO
        parsed_question[:choices] = flatten_choices(question_data[:choices])
        if question_data[:hasOther]
          parsed_question[:other_text] = question_data[:otherPlaceHolder] || 'other'
        end
      when TYPE_RATING
        parsed_question[:choices] = get_friendly_rating_choices(question_data)
      when TYPE_MATRIX
        parsed_question[:rows] = flatten_choices(question_data[:rows])
        parsed_question[:columns] = flatten_choices(question_data[:columns])
      end
      parsed_question
    end

    def self.get_friendly_rating_choices(question_data)
      choices = {}
      min_rate = 1 || question_data[:rateMin]
      max_rate = 5 || question_data[:rateMax]
      min_rate_description = question_data[:minRateDescription] ?
                               "#{min_rate} - #{question_data[:minRateDescription]}" :
                               min_rate.to_s
      max_rate_description = question_data[:maxRateDescription] ?
                               "#{max_rate} - #{question_data[:maxRateDescription]}" :
                               max_rate.to_s
      choices[min_rate.to_s] = min_rate_description
      (min_rate + 1...max_rate).each do |n|
        choices[n.to_s] = n.to_s
      end
      choices[max_rate.to_s] = max_rate_description
      choices
    end

    def self.flatten_choices(choices)
      choices_obj = {}
      choices.each do |choice_hash|
        choices_obj[choice_hash[:value]] = choice_hash[:text]
      end
      choices_obj
    end
  end
end
