# Parses Foorm forms into a useful format for looking up questions by form name, form version
# and question name
# @return
#   {
#     <form-name>.<form-version: {
#       <question_name>: {
#         title: "sample title",
#         type: "text/singleSelect/multiSelect/matrix/scale",
#         # for singleSelect/multiSelect/scale
#         choices: {
#           choice_1_name: "choice 1 value",
#           ...
#         },
#         # if has other choice
#         other_text: "Other choice text",
#         # for matrix
#         rows: {
#           row_1_name: "row 1 value",
#           ...
#         },
#         columns: {
#           column_1_name: "column 1 value",
#           ...
#         }
#       }
#     }
#   }
module Pd::Foorm
  class FoormParser
    include Constants
    extend Helper

    # parse all forms in given list and return object in format above
    def self.parse_forms(forms)
      parsed_forms = {}
      forms.each do |form|
        parsed_form = {}
        form_questions = JSON.parse(form.questions, symbolize_names: true)
        form_questions[:pages].each do |page|
          page[:elements].each do |question_data|
            parsed_form.merge!(parse_element(question_data))
          end
        end
        parsed_forms[get_form_key(form.name, form.version)] = parsed_form
      end
      parsed_forms
    end

    # parse a form element
    # @return hash of {question_name->question_data,...}
    # Form element may be a panel which contains questions, therefore resulting hash
    # may contain one or more questions
    def self.parse_element(question_data)
      parsed_questions = {}
      if question_data[:type] == 'panel'
        question_data[:elements].each do |panel_question_data|
          parsed_questions.merge!(parse_element(panel_question_data))
        end
      else
        if QUESTION_TYPES.include?(question_data[:type])
          parsed_questions[question_data[:name]] = parse_question(question_data)
        end
      end
      parsed_questions
    end

    # parse single question into standardized format
    def self.parse_question(question_data)
      parsed_question = {
        title: question_data[:title],
        type: QUESTION_TO_ANSWER_TYPES[question_data[:type]]
      }
      case question_data[:type]
      when TYPE_CHECKBOX, TYPE_RADIO, TYPE_DROPDOWN
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

    # given a rating question, create choices from
    # <min-rate>...<max-rate>, as form will only specify min and max
    # Include min/max rate descriptions in min/max choices if specified in form
    # Example choices for a rating from 1 to 5:
    # '1 - Disagree', '2', '3', '4', '5 - Agree'
    # the keys will be 1, 2, 3, 4, 5
    def self.get_friendly_rating_choices(question_data)
      choices = {}
      # survey js default min/max is 1/5
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

    # @param choices in the format [{value: "value1", text: "text1"},{value: "value2", text: "text2"},...]
    # @return object in format {value1: "text1", value2: "text2",...}
    def self.flatten_choices(choices)
      choices_obj = {}
      choices.each do |choice_hash|
        choices_obj[choice_hash[:value]] = choice_hash[:text]
      end
      choices_obj
    end
  end
end
