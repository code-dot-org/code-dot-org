FactoryGirl.allow_class_lookup = false

FactoryGirl.define do
  factory :foorm_form, class: 'Foorm::Form' do
    sequence(:name) {|n| "FormName#{n}"}
    version 0
    questions '{}'

    trait :with_multi_select_question do
      questions '{
        "pages":[
          {
            "name":"page_1",
            "elements":[
              {
                "type":"checkbox",
                "name":"not_members_spice_girls",
                "title":"Which of the following are NOT names of members of the Spice Girls?",
                "choices":[
                  {
                    "value":"sporty",
                    "text":"Sporty"
                  },
                  {
                    "value":"radical",
                    "text":"Radical"
                  },
                  {
                    "value":"spicy",
                    "text":"Spicy"
                  },
                  {
                    "value":"posh",
                    "text":"Posh"
                  },
                  {
                    "value":"ginger",
                    "text":"Ginger"
                  }
                ]
              }
            ]
          }
        ]
      }'
    end
  end

  factory :basic_foorm_submission, class: 'Foorm::Submission' do
    form_name "surveys/pd/sample"
    foorm_submission_metadata
    answers '{}'

    trait :with_multi_select_answer do
      answers '{
        "not_members_spice_girls": ["radical", "spicy"]
      }'
    end
  end

  factory :day_5_workshop_foorm_submission, class: 'Pd::WorkshopSurveyFoormSubmission' do
    association :pd_workshop, factory: :csd_summer_workshop
    association :user, factory: :teacher
    day 5

    trait :answers_low do
      association :foorm_submission, factory: [:daily_workshop_day_5_foorm_submission, :answers_low]
    end

    trait :answers_high do
      association :foorm_submission, factory: [:daily_workshop_day_5_foorm_submission, :answers_high]
    end
  end

  factory :daily_workshop_day_5_foorm_submission, class: 'Foorm::Submission' do
    form_name "surveys/pd/summer_workshop_post_survey_test"
    foorm_submission_metadata
    answers '{}'

    trait :answers_low do
      answers '{
        "overall_success": {
          "more_prepared": "1",
          "know_help":"1",
          "pd_suitable_experience":"1",
          "connected_community": "1",
          "would_recommend":"1",
          "absolute_best_pd":"1"
        },
        "teacher_engagement": {
          "activities_engaging": "1",
          "participated":"1",
          "frequently_talk_about":"1",
          "planning_to_use": "1"
        },
        "teaching_in_general_matrix": {
          "formally_assess_learning": "1",
          "recruit_strategies":"1",
          "retain_strategies":"1"
        },
       "expertise_rating": 1,
       "two_things_liked": "things",
       "permission_promotional": "yes_with_name"
      }'
    end

    trait :answers_high do
      answers '{
        "overall_success": {
          "more_prepared": "7",
          "know_help":"7",
          "pd_suitable_experience":"7",
          "connected_community": "7",
          "would_recommend":"7",
          "absolute_best_pd":"7"
        },
        "teacher_engagement": {
          "activities_engaging": "7",
          "participated":"7",
          "frequently_talk_about":"7",
          "planning_to_use": "7"
        },
        "teaching_in_general_matrix": {
          "formally_assess_learning": "7",
          "recruit_strategies":"7",
          "retain_strategies":"7"
        },
       "expertise_rating": 5,
       "two_things_liked": "things",
       "permission_promotional": "yes_with_name"
      }'
    end

    trait :answers_high_with_survey_config_variables do
      answers_high

      after(:build) do |submission|
        survey_config_answers = '{
          "workshop_course":"CS Principles",
          "workshop_subject":"5-day Summer",
          "regional_partner_name":"",
          "is_virtual":"true",
          "num_facilitators":"0",
          "day":"0",
          "is_friday_institute":"false"
        }'

        parsed_answers = JSON.parse(submission.answers)
        parsed_answers.merge! JSON.parse(survey_config_answers)
        submission.answers = parsed_answers.to_json
      end
    end
  end

  factory :day_0_workshop_foorm_submission, class: 'Pd::WorkshopSurveyFoormSubmission' do
    association :pd_workshop, factory: :csd_summer_workshop
    association :user, factory: :teacher
    day 0

    trait :answers_low do
      association :foorm_submission, factory: [:daily_workshop_day_0_foorm_submission, :answers_low]
    end

    trait :answers_high do
      association :foorm_submission, factory: [:daily_workshop_day_0_foorm_submission, :answers_high]
    end
  end

  factory :daily_workshop_day_0_foorm_submission, class: 'Foorm::Submission' do
    form_name "surveys/pd/summer_workshop_pre_survey_test"
    foorm_submission_metadata

    trait :answers_low do
      answers '{
        "course_length_weeks":"5_fewer",
        "teaching_cs_matrix":{"committed_to_teaching_cs": "1", "like_teaching_cs": "1", "understand_cs": "1", "skills_cs": "1"},
        "expertise_rating":1,
        "birth_year": "1990",
        "racial_ethnic_identity": ["black_aa","white"]
      }'
    end

    trait :answers_high do
      answers '{
        "course_length_weeks":"30_more",
        "teaching_cs_matrix":{"committed_to_teaching_cs": "7", "like_teaching_cs": "7", "understand_cs": "7", "skills_cs": "7"},
        "expertise_rating":5,
        "birth_year": "1983",
        "racial_ethnic_identity": ["black_aa","hispanic_latino"]
      }'
    end
  end

  factory :foorm_form_with_inconsistent_questions, class: 'Foorm::Form' do
    name "surveys/pd/sample_survey"
    version 0
    created_at "2020-03-26 21:58:28"
    updated_at "2020-03-26 21:58:28"
    questions '{
      "pages": [
          {
            "name": "teaching_context",
            "elements": [
            {
              "type": "rating",
              "title": "Lead Learner. 1. model expertise in how to learn  --- 5. need deep content expertise",
              "name": "expertise_rating",
              "indent": 12,
              "titleLocation": "hidden",
              "minRate": 2,
              "minRateDescription": "Strongly aligned with A",
              "maxRateDescription": "Strongly aligned with B!"
            }]
          }
        ]
      }'
  end

  factory :csf_intro_post_workshop_submission, class: 'Pd::WorkshopSurveyFoormSubmission' do
    association :user, factory: :teacher
    association :pd_workshop, factory: :csf_101_workshop

    trait :answers_low do
      association :foorm_submission, factory: [:csf_intro_post_foorm_submission, :answers_low]
    end

    trait :answers_high do
      association :foorm_submission, factory: [:csf_intro_post_foorm_submission, :answers_high]
    end
  end

  factory :csf_intro_post_foorm_submission, class: 'Foorm::Submission' do
    form_name "surveys/pd/workshop_csf_intro_post_test"
    foorm_submission_metadata

    trait :answers_low do
      answers '{
      "overall_success": {
        "more_prepared": "1",
        "where_to_go":"1",
        "suitable_my_level":"1",
        "feel_community": "1",
        "would_recommend":"1",
        "best_pd":"1"
      },
      "teacher_engagement": {
        "engaging": "1",
        "active":"1",
        "ideas":"1"
      },
      "supported": "lots",
      "permission": "no"
    }'
    end

    trait :answers_high do
      answers '{
      "overall_success": {
        "more_prepared": "7",
        "where_to_go":"7",
        "suitable_my_level":"7",
        "feel_community": "7",
        "would_recommend":"7",
        "best_pd":"7"
      },
      "teacher_engagement": {
        "engaging": "7",
        "active":"7",
        "ideas":"7"
      },
      "supported": "lots",
      "permission": "yes_name"
    }'
    end
  end

  factory :csf_intro_post_facilitator_workshop_submission, class: 'Pd::WorkshopSurveyFoormSubmission' do
    association :pd_workshop, factory: :csf_101_workshop
    association :user, factory: :teacher

    trait :answers_low do
      association :foorm_submission, factory: [:csf_intro_post_facilitator_foorm_submission, :answers_low]
    end

    trait :answers_high do
      association :foorm_submission, factory: [:csf_intro_post_facilitator_foorm_submission, :answers_high]
    end
  end

  factory :csf_intro_post_facilitator_foorm_submission, class: 'Foorm::Submission' do
    form_name "surveys/pd/workshop_csf_intro_post_test"
    foorm_submission_metadata

    trait :answers_low do
      answers '{
      "facilitatorId": 1,
      "facilitatorName": "Facilitator1",
      "facilitator_effectiveness":{
        "demonstrated_knowledge":"1",
        "built_equitable":"1",
        "on_track":"1",
        "productive_discussions":"1",
        "ways_equitable":"1",
        "healthy_relationship":"1"
      },
      "k5_facilitator_did_well":"things done well"
    }'
    end

    trait :answers_high do
      answers '{
      "facilitatorId": 1,
      "facilitatorName": "Facilitator1",
      "facilitator_effectiveness":{
        "demonstrated_knowledge":"7",
        "built_equitable":"7",
        "on_track":"7",
        "productive_discussions":"7",
        "ways_equitable":"7",
        "healthy_relationship":"7"
      },
      "k5_facilitator_did_well":"things done well"
    }'
    end
  end

  trait :foorm_submission_metadata do
    form_version 0
  end

  factory :foorm_form_summer_pre_survey, class: 'Foorm::Form' do
    name 'surveys/pd/summer_workshop_pre_survey_test'
    version 0
    created_at '2020-03-25 21:58:28'
    updated_at '2020-03-26 21:58:28'
    questions '{
    "pages": [
    {
      "name": "teaching_context",
      "elements": [
      {
        "type": "radiogroup",
        "name": "course_length_weeks",
        "title": "For a typical section of {workshop_course} that you will teach, approximately how many WEEKS will the class run?",
        "choices": [
        {
          "value": "5_fewer",
          "text": "5 or fewer"
        },
        {
          "value": "6_10",
          "text": "6 - 10"
        },
        {
          "value": "11_15",
          "text": "11 - 15"
        },
        {
          "value": "16_20",
          "text": "16 - 20"
        },
        {
          "value": "21_30",
          "text": "21 - 30"
        },
        {
          "value": "30_more",
          "text": "30 or more (full year)"
        }
        ]
      }
      ],
      "title": "Teaching Context",
      "description": "First, we have some questions about the context in which you are teaching {workshop_course}."
    },
    {
      "name": "teaching_computer_science",
      "elements": [
      {
        "type": "matrix",
        "name": "teaching_cs_matrix",
        "title": "How much do you agree or disagree with the following statements about teaching computer science? ",
        "columns": [
        {
          "value": "1",
          "text": "Strongly Disagree"
        },
        {
          "value": "2",
          "text": "Disagree "
        },
        {
          "value": "3",
          "text": "Slightly Disagree "
        },
        {
          "value": "4",
          "text": "Neutral "
        },
        {
          "value": "5",
          "text": "Slightly Agree "
        },
        {
          "value": "6",
          "text": "Agree "
        },
        {
          "value": "7",
          "text": "Strongly Agree "
        }
        ],
        "rows": [
        {
          "value": "committed_to_teaching_cs",
          "text": "I am committed to teaching computer science."
        },
        {
          "value": "like_teaching_cs",
          "text": "I like, or think I will like, teaching computer science."
        },
        {
          "value": "understand_cs",
          "text": "I understand computer science concepts well enough to be an effective teacher of computer science."
        },
        {
          "value": "skills_cs",
          "text": "I have the skills necessary to be an effective teacher of computer science. "
        }
        ]
      }
      ],
      "title": "Teaching Computer Science"
    },
    {
      "name": "teaching_philosophy",
      "elements": [
      {
        "type": "html",
        "name": "statement_AB_expertise",
        "html": "<table style=\"width: 600px; margin-left: auto; margin-right: auto;\" cellpadding=\"5\">\n<tbody>\n                <tr>\n                  <td style=\"padding-top: 10px; text-align: center;\">\n                    <span style=\"font-family: arial, helvetica, sans-serif; font-size: 12pt;\">\n                      <strong>Statement A</strong>\n                    </span>\n                  </td>\n                  <td style=\"padding-top: 10px; text-align: center;\">\n                    <span style=\"font-family: arial, helvetica, sans-serif; font-size: 12pt;\">\n                      <strong>      </strong>\n                    </span>\n                  </td>\n                  <td style=\"padding-top: 10px; text-align: center;\">\n                    <span style=\"font-family: arial, helvetica, sans-serif; font-size: 12pt;\">\n                      <strong>Statement B</strong>\n                    </span>\n                  </td>\n                </tr>\n                <tr>\n                  <td style=\"border: 1px solid black; width: 250px; vertical-align: top; text-align: left;\">\n                    <span style=\"color: black;\">\"I do not need to have deep expertise in computer science in order to successfully teach it. I have expertise in how to learn, and I can model that for my students as we learn the content together.\" </span>\n                  </td>\n                  <td style=\"text-align: center;\">\n                    <em><span style=\"color: #999999;\"> </span></em>\n                  </td>\n                  <td style=\"border: 1px solid black; width: 250px; vertical-align: top; text-align: left;\"> \t\n<span style=\"color: black;\">\"As the teacher, I need to have deep content expertise so that I can properly answer students’ questions and guide instruction appropriately.\"</span>\n                    \n                  </td>\n                </tr>\n              </tbody>\n</table>"
      },
      {
        "type": "rating",
        "title": "Lead Learner. 1. model expertise in how to learn  --- 5. need deep content expertise",
        "name": "expertise_rating",
        "indent": 12,
        "titleLocation": "hidden",
        "minRateDescription": "Strongly aligned with A",
        "maxRateDescription": "Strongly aligned with B"
      }
      ],
      "title": "Teaching Philosophy"
    },
    {
      "name": "wrap_up_submit",
      "elements": [
      {
        "type": "text",
        "name": "birth_year",
        "title": "What is your year of birth? ",
        "description": "Please enter a whole number e.g. 1975. ",
        "inputType": "number",
        "placeHolder": "enter a number"
      },
      {
        "type": "checkbox",
        "name": "racial_ethnic_identity",
        "title": "What is your racial or ethnic identity? [check all that apply] ",
        "choices": [
        {
          "value": "am_indian_alaska",
          "text": "American Indian/Alaska Native"
        },
        {
          "value": "asian",
          "text": "Asian"
        },
        {
          "value": "black_aa",
          "text": "Black or African American"
        },
        {
          "value": "hispanic_latino",
          "text": "Hispanic or Latino"
        },
        {
          "value": "native_hawaiin_pi",
          "text": "Native Hawaiian or other Pacific Islander"
        },
        {
          "value": "white",
          "text": "White"
        },
        {
          "value": "other",
          "text": "Other"
        },
        {
          "value": "no_answer",
          "text": "Prefer not to answer"
        }
        ]
      },
      {
        "type": "html",
        "name": "thank_you",
        "html": "<h2>Thank you!</h2>\n<p>Thank you so much for taking the time to complete this survey. Your input and feedback is vital for our programs.</p>\n"
      }
      ],
      "title": "Wrap Up and Submit"
    }
    ]
  }'
  end

  factory :foorm_form_summer_post_survey, class: 'Foorm::Form' do
    name 'surveys/pd/summer_workshop_post_survey_test'
    version 0
    created_at '2020-03-25 21:58:28'
    updated_at '2020-03-26 21:58:28'
    questions '{
    "pages": [
    {
      "name": "workshop_experience",
      "title": "Your {workshop_course} Workshop Experience",
      "elements": [
      {
        "type": "matrix",
        "name": "overall_success",
        "title": "How much do you agree or disagree with the following statements about the workshop overall?",
        "columns": [
        {
          "value": "1",
          "text": "Strongly Disagree"
        },
        {
          "value": "2",
          "text": "Disagree "
        },
        {
          "value": "3",
          "text": "Slightly Disagree "
        },
        {
          "value": "4",
          "text": "Neutral "
        },
        {
          "value": "5",
          "text": "Slightly Agree "
        },
        {
          "value": "6",
          "text": "Agree "
        },
        {
          "value": "7",
          "text": "Strongly Agree "
        }
        ],
        "rows": [
        {
          "value": "more_prepared",
          "text": "I am more prepared to teach the material covered in this workshop than before I came."
        },
        {
          "value": "know_help",
          "text": "I know where to go if I need help preparing to teach this material."
        },
        {
          "value": "pd_suitable_experience",
          "text": "This professional development was suitable for my level of experience with teaching CS."
        },
        {
          "value": "connected_community",
          "text": "I feel connected to a community of computer science teachers."
        },
        {
          "value": "would_recommend",
          "text": "I would recommend this professional development to others."
        },
        {
          "value": "absolute_best_pd",
          "text": "This was the the absolute best professional development I have ever participated in."
        }
        ]
      },
      {
        "type": "matrix",
        "name": "teacher_engagement",
        "title": "How much do you agree or disagree with the following statements about your level of engagement in the workshop?",
        "columns": [
        {
          "value": "1",
          "text": "Strongly Disagree"
        },
        {
          "value": "2",
          "text": "Disagree "
        },
        {
          "value": "3",
          "text": "Slightly Disagree "
        },
        {
          "value": "4",
          "text": "Neutral "
        },
        {
          "value": "5",
          "text": "Slightly Agree "
        },
        {
          "value": "6",
          "text": "Agree "
        },
        {
          "value": "7",
          "text": "Strongly Agree "
        }
        ],
        "rows": [
        {
          "value": "activities_engaging",
          "text": "I found the activities we did in this workshop interesting and engaging."
        },
        {
          "value": "participated",
          "text": "I was highly active and participated a lot in the workshop activities."
        },
        {
          "value": "frequently_talk_about",
          "text": "When I\'m not in Code.org workshops, I frequently talk about ideas or content from the workshop with others."
        },
        {
          "value": "planning_to_use",
          "text": "I am definitely planning to make use of ideas and content covered in this workshop in my classroom."
        }
        ]
      },
      {
        "type": "comment",
        "name": "venue_logistics_feedback",
        "title": "Do you have feedback about the venue and the way logistics were run for the workshop this week? Please be specific and provide suggestions for improvement."
      }
      ]
    },
    {
      "name": "teaching_practices",
      "elements": [
      {
        "type": "matrix",
        "name": "teaching_in_general_matrix",
        "title": "Teaching computer science in general. Right now... ",
        "columns": [
        {
          "value": "0",
          "text": "N/A"
        },
        {
          "value": "1",
          "text": "1"
        },
        {
          "value": "2",
          "text": "2"
        },
        {
          "value": "3",
          "text": "3"
        },
        {
          "value": "4",
          "text": "4"
        },
        {
          "value": "5",
          "text": "5"
        },
        {
          "value": "6",
          "text": "6"
        },
        {
          "value": "7",
          "text": "7"
        }
        ],
        "rows": [
        {
          "value": "formally_assess_learning",
          "text": "I know how to formally assess students’ learning and performance in computer science."
        },
        {
          "value": "recruit_strategies",
          "text": "I have strategies to recruit students into my computer science class."
        },
        {
          "value": "retain_strategies",
          "text": "I have strategies to retain students in my computer science class."
        }
        ]
      }
      ],
      "title": "Self-assessment of Computer Science Knowledge & Teaching Practices"
    },
    {
      "name": "teaching_philosophy",
      "elements": [
      {
        "type": "html",
        "name": "statement_AB_expertise",
        "html": "<table style=\"width: 600px; margin-left: auto; margin-right: auto;\" cellpadding=\"5\">\n<tbody>\n                <tr>\n                  <td style=\"padding-top: 10px; text-align: center;\">\n                    <span style=\"font-family: arial, helvetica, sans-serif; font-size: 12pt;\">\n                      <strong>Statement A</strong>\n                    </span>\n                  </td>\n                  <td style=\"padding-top: 10px; text-align: center;\">\n                    <span style=\"font-family: arial, helvetica, sans-serif; font-size: 12pt;\">\n                      <strong>      </strong>\n                    </span>\n                  </td>\n                  <td style=\"padding-top: 10px; text-align: center;\">\n                    <span style=\"font-family: arial, helvetica, sans-serif; font-size: 12pt;\">\n                      <strong>Statement B</strong>\n                    </span>\n                  </td>\n                </tr>\n                <tr>\n                  <td style=\"border: 1px solid black; width: 250px; vertical-align: top; text-align: left;\">\n                    <span style=\"color: black;\">\"I do not need to have deep expertise in computer science in order to successfully teach it. I have expertise in how to learn, and I can model that for my students as we learn the content together.\" </span>\n                  </td>\n                  <td style=\"text-align: center;\">\n                    <em><span style=\"color: #999999;\"> </span></em>\n                  </td>\n                  <td style=\"border: 1px solid black; width: 250px; vertical-align: top; text-align: left;\"> \t\n<span style=\"color: black;\">\"As the teacher, I need to have deep content expertise so that I can properly answer students’ questions and guide instruction appropriately.\"</span>\n                    \n                  </td>\n                </tr>\n              </tbody>\n</table>"
      },
      {
        "type": "rating",
        "title": "Lead Learner. 1. model expertise in how to learn  --- 5. need deep content expertise",
        "name": "expertise_rating",
        "indent": 12,
        "titleLocation": "hidden",
        "minRateDescription": "Strongly aligned with A",
        "maxRateDescription": "Strongly aligned with B"
      }
      ],
      "title": "Teaching Philosophy"
    },
    {
      "name": "overall_feedback",
      "elements": [
      {
        "type": "comment",
        "name": "two_things_liked",
        "title": "What were the one or two things you liked most about the activities you did in this workshop and why?"
      },
      {
        "type": "radiogroup",
        "name": "permission_promotional",
        "title": " I give the workshop organizer permission to quote my written feedback from today for use on social media, promotional materials, and other communications. ",
        "choices": [
        {
          "value": "yes_with_name",
          "text": "Yes, I give the workshop organizer permission to quote me and use my name. "
        },
        {
          "value": "yes_anonymous",
          "text": "Yes, I give the workshop organizer permission to quote me, but I want to be anonymous."
        },
        {
          "value": "no",
          "text": "No, I do not give the workshop organizer my permission. "
        }
        ]
      }
      ],
      "title": "Overall Workshop Feedback"
    }
    ]
  }'
  end

  factory :foorm_form_csf_intro_post_survey, class: 'Foorm::Form' do
    name 'surveys/pd/workshop_csf_intro_post_test'
    version 0
    created_at '2020-03-30 21:58:28'
    updated_at '2020-03-31 21:58:28'
    questions '{
    "title": "Satisfaction Survey for Code.org\'s CS Fundamentals 5-day Summer Professional Development Workshop",
    "pages": [
    {
      "name": "page1",
      "elements": [
      {
        "type": "html",
        "name": "intro_text",
        "html": "Thanks!"
      },
      {
        "type": "matrix",
        "name": "overall_success",
        "title": "How much do you agree or disagree with the following statements about the workshop overall?",
        "columns": [
        {
          "value": "1",
          "text": "Strongly Disagree"
        },
        {
          "value": "2",
          "text": "Disagree"
        },
        {
          "value": "3",
          "text": "Slightly Disagree"
        },
        {
          "value": "4",
          "text": "Neutral"
        },
        {
          "value": "5",
          "text": "Slightly Agree"
        },
        {
          "value": "6",
          "text": "Agree"
        },
        {
          "value": "7",
          "text": "Strongly Agree"
        }
        ],
        "rows": [
        {
          "value": "more_prepared",
          "text": "I feel more prepared to teach the material covered in this workshop than before I came."
        },
        {
          "value": "where_to_go",
          "text": "I know where to go if I need help preparing to teach this material."
        },
        {
          "value": "suitable_my_level",
          "text": "This professional development was suitable for my level of experience with teaching CS."
        },
        {
          "value": "feel_community",
          "text": "I feel connected to a community of computer science teachers."
        },
        {
          "value": "would_recommend",
          "text": "I would recommend this professional development to others."
        },
        {
          "value": "best_pd",
          "text": "This was the absolute best professional development I’ve ever participated in."
        }
        ]
      },
      {
        "type": "matrix",
        "name": "teacher_engagement",
        "title": "How much do you agree or disagree with the following statements about your level of engagement in the workshop?",
        "columns": [
        {
          "value": "1",
          "text": "Strongly Disagree"
        },
        {
          "value": "2",
          "text": "Disagree"
        },
        {
          "value": "3",
          "text": "Slightly Disagree"
        },
        {
          "value": "4",
          "text": "Neutral"
        },
        {
          "value": "5",
          "text": "Slightly Agree"
        },
        {
          "value": "6",
          "text": "Agree"
        },
        {
          "value": "7",
          "text": "Strongly Agree"
        }
        ],
        "rows": [
        {
          "value": "engaging",
          "text": "I found the activities we did in this workshop interesting and engaging."
        },
        {
          "value": "active",
          "text": "I was highly active and participated a lot in the workshop activities."
        },
        {
          "value": "ideas",
          "text": "I am definitely planning to make use of ideas and content covered in this workshop in my classroom."
        }
        ]
      },
      {
        "type": "comment",
        "name": "supported",
        "title": "What supported your learning the most today and why?"
      },{
       "type": "paneldynamic",
       "name": "facilitators",
       "title": "Your facilitators",
       "templateElements": [
         {
           "type": "matrix",
           "name": "facilitator_effectiveness",
           "title": "During my workshop, {panel.facilitator_name} did the following:",
           "columns": [
             {
               "value": "1",
               "text": "Strongly Disagree"
             },
             {
               "value": "2",
               "text": "Disagree"
             },
             {
               "value": "3",
               "text": "Slightly Disagree"
             },
             {
               "value": "4",
               "text": "Neutral"
             },
             {
               "value": "5",
               "text": "Slightly Agree"
             },
             {
               "value": "6",
               "text": "Agree"
             },
             {
               "value": "7",
               "text": "Strongly Agree"
             }
           ],
           "rows": [
             {
               "value": "demonstrated_knowledge",
               "text": "Demonstrated knowledge of the curriculum."
             },
             {
               "value": "built_equitable",
               "text": "Built and sustained an equitable learning environment in our workshop."
             },
             {
               "value": "on_track",
               "text": "Kept the workshop and participants on track."
             },
             {
               "value": "productive_discussions",
               "text": "Supported productive workshop discussions."
             },
             {
               "value": "ways_equitable",
               "text": "Helped me see ways to create and support an equitable learning environment for my students."
             },
             {
               "value": "healthy_relationship",
               "text": "Demonstrated a healthy working relationship with their co-facilitator (if applicable)."
             }
           ]
         },
         {
           "type": "comment",
           "name": "k5_facilitator_did_well",
           "title": "What were two things {panel.facilitator_name} did well?"
         },
         {
           "type": "comment",
           "name": "k5_facilitator_could_improve",
           "title": "What were two things {panel.facilitator_name} could do better?"
         }
       ],
       "templateTitle": "Information about: {panel.facilitator_name}",
       "allowAddPanel": false,
       "allowRemovePanel": false
     },{
       "type": "radiogroup",
       "name": "permission",
       "title": "I give the workshop organizer permission to quote my written feedback from today for use on social media, promotional materials, and other communications.",
       "isRequired": true,
       "choices": [
         {
           "value": "yes_name",
           "text": "Yes, I give the workshop organizer permission to quote me and use my name."
         },
         {
           "value": "yes_anonymous",
           "text": "Yes, I give the workshop organizer permission to quote me, but I want to be anonymous."
         },
         {
           "value": "no",
           "text": "No, I do not give the workshop organizer my permission."
         }
       ]
     }
   ]
  }]
  }'
  end

  factory :foorm_form_summer_daily_survey, class: 'Foorm::Form' do
    name 'surveys/pd/summer_workshop_daily_survey_test'
    version 0
    created_at '2020-03-25 21:58:28'
    updated_at '2020-03-26 21:58:28'
    questions '{}'
  end

  factory :foorm_form_teacher_end_of_year_survey, class: 'Foorm::Form' do
    name 'surveys/teachers/teacher_end_of_year_survey_test'
    version 0
    created_at '2020-03-25 21:58:28'
    updated_at '2020-03-26 21:58:28'
    questions '{}'
  end
end
