module Pd
  module TeacherCommonApplicationConstants
    YES_NO = %w(Yes No).freeze

    TEXT_FIELDS = {
      other_with_text: 'Other:'.freeze,
      other_please_list: 'Other (Please List):'.freeze,
      other_please_explain: 'Other (Please Explain):'.freeze,
      not_teaching_this_year: "I'm not teaching this year (Please Explain):".freeze,
      not_teaching_next_year: "I'm not teaching next year (Please Explain):".freeze,
      dont_know_if_i_will_teach_explain: "I don't know if I will teach this course (Please Explain):".freeze,
      unable_to_attend: "No, I'm unable to attend (Please Explain):".freeze,
      able_to_attend_single: "Yes, I'm able to attend".freeze,
      no_explain: "No (Please Explain):".freeze,
      no_pay_fee: "No, my school or I will not be able to pay the summer workshop program fee.".freeze,
      i_dont_know_explain: "I don't know (Please Explain):",
      no_pay_fee_2021: 'No, my school will not be able to pay the program fee. I would like to be considered for a scholarship.',
      no_pay_fee_1920: 'No, my school will not be able to pay the program fee. I would like to be considered for a scholarship.',
      not_sure_explain: 'Not sure (Please Explain):',
      unable_to_attend_2021: 'I’m not able to attend any of the above workshop dates. (Please Explain):',
      unable_to_attend_1920: 'I’m not able to attend any of the above workshop dates. (Please Explain):'
    }.freeze
  end
end
