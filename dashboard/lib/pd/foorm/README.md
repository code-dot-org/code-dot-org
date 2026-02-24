# Foorm Survey Pipeline

The Foorm Survey Pipeline takes Foorm survey responses and summarizes them for visualization. The main entry point is
SurveyReporter.get_workshop_report. SurveyReporter.get_workshop_report takes in a workshop id and returns a summary
in the format described below. The path for calculating a report, given a `workshop_id` x,
which is a workshop for course y (ex. 'CS Principles'), is:
1. Get raw workshop data (`SurveyReporter.get_raw_workshop_data`). This gets the forms and responses for
   `workshop_id`.
1. Summarize workshop x using raw workshop data
   1. `FoormParser.parse_forms`
   1. `WorkshopSummarizer.summarize_answers_by_survey`
1. Get rollup question details
    1. `RollupHelper.get_question_details_for_rollup`
1. Calculate rollup for workshop x
    1. `RollupCreator.calculate_averaged_rollup`
1. Calculate rollup for all workshops for course y
    1. get all workshop ids for course
    1. `SurveyReporter.get_raw_data_for_workshop(ids)`
    1. `FoormParser.parse_forms`
    1. `WorkshopSummarizer.summarize_answers_by_survey`
    1. `RollupCreator.calculate_averaged_rollup`

## Survey Report Format
```
{
  course_name: 'CS Principles',
  facilitators: {34: 'facilitator1', 56: 'facilitator2'}
  questions: {
    general: {
       <form-name>.<form-version>: {
         question1: {
           title: "sample title",
           type: "text/singleSelect/multiSelect/matrix/scale",
           # for singleSelect/multiSelect/scale
           choices: {
             choice_1_name: "choice 1 value",
             ...
           },
           # if has "other" choice
           other_text: "Other choice text",
           # for matrix
           rows: {
             row_1_name: "row 1 value",
             ...
           },
           columns: {
             column_1_name: "column 1 value",
             ...
           }
         }
       }
     },
     facilitator: {
       <form-name>.<form-version>: {...}
      }  
    },
    this_workshop: {
      Day 0: {
       general: {
       <form_name>.<form_version> =>
         {
           response_count: 4,
           question1-name: {
              num_respondents: 3, 
              answer1-name: 5, 
              answer2-name: 3, 
              other_answers: ["other 1", "other 2"]...
            },
           question2-name: {
             answer1-name>: 5,
             answer2-name: 3
            },
           question3-name: ['abc', 'def']
         }
       },
       facilitator: {
         response_count: {34: 2, 56: 2},
         question4-name: {
            34: {answer1: 5, answer2: 3}, 
            56: {answer1: 4, answer2: 5}
         }
       }
     }
  },
  workshop_rollups: {
    general: {
      questions: {
        question_id: {
          title: <question_title>,
          rows: <row configuration>,
          column_count: <number_of_columns>,
          type: 'matrix',
          header: <header_text>,
          form_keys: [form ids where question appears]
          },...
        },
        single_workshop: {
            response_count: 5,
            averages: {
              question_id_1: {
                average: 3.45,
                rows: {
                  row_id_1: 2.5,
                  row_id_2: 5.6
                }
               },...
             }
           }
        },
        overall_facilitator: {
          56: {
            response_count: 7,
              averages: {
                question_id_1: {
                  average: 3.52,
                  rows: {
                    row_id_1: 3.1,
                    row_id_2: 5.6
                  }
                },...
              }
            },..
          }
        },
        overall: {
          response_count: 5,
          averages: {
            question_id_1: {
              average: 3.45,
              rows: {
                row_id_1: 2.5,
                row_id_2: 5.6
              }
             },...
           }
        }
      }
    },
    facilitator: {
      questions: {..same as general questions..},
      single_workshop: {
        34: {
            response_count: 3,
            averages: {
              question_id_1: {
                average: 3.45,
                rows: {
                  row_id_1: 2.5,
                  row_id_2: 5.6
                }
              },...
            }
          },..
        }
      },
      overall_facilitator: {
         56: {
            response_count: 7,
            averages: {
              question_id_1: {
                average: 3.52,
                rows: {
                  row_id_1: 3.1,
                  row_id_2: 5.6
                }
              },...
            }
          },..
        }
      },
      overall: {
        response_count: 5,
        averages: {
          question_id_1: {
            average: 3.45,
              rows: {
                row_id_1: 2.5,
                row_id_2: 5.6
              }
            },...
          }
        }
      }
    }
  }
}
```

## Build Your Own Workshop Survey Summary

example response:

```
{
  "course": "Build Your Own Workshop",
  "name": "Test Workshop",
  "facilitators": {
    "54": "Andy Bernard",
  },
  "surveys": {
    "post_workshop": {
      "total_responses": 2,
      "categories": {
        "engagement": {
          "questions": {
            "motivated_learn_cs_in_education": {
              "question_name": "motivated_learn_cs_in_education",
              "question_text": "This workshop motivated me to continue learning about computer science in education.",
              "question_short_text": "Motivated to teach CS (%)",
              "question_type": "likert",
              "category": "engagement",
              "results": {
                "total_responses": 0,
                "weighted_score": 0,
                "agreement_count": 0,
                "agreement_percentage": 0,
                "breakdown": {
                  "1": {
                    "count": 0,
                    "percentage": 0,
                    "label": "Strongly Disagree",
                    "weighted_value": 0
                  },
                  "2": {
                    "count": 0,
                    "percentage": 0,
                    "label": "Disagree",
                    "weighted_value": 17
                  },
                  "3": {
                    "count": 0,
                    "percentage": 0,
                    "label": "Slightly Disagree",
                    "weighted_value": 33
                  },
                  "4": {
                    "count": 0,
                    "percentage": 0,
                    "label": "Neutral",
                    "weighted_value": 50
                  },
                  "5": {
                    "count": 0,
                    "percentage": 0,
                    "label": "Slightly Agree",
                    "weighted_value": 67
                  },
                  "6": {
                    "count": 0,
                    "percentage": 0,
                    "label": "Agree",
                    "weighted_value": 83
                  },
                  "7": {
                    "count": 0,
                    "percentage": 0,
                    "label": "Strongly Agree",
                    "weighted_value": 100
                  }
                }
              }
            },
            "nps_self_paced_pd_byow": {
              "question_name": "nps_self_paced_pd_byow",
              "question_text": "How likely are you to recommend this professional learning workshop to a friend or colleague?",
              "question_short_text": "Likely to recommend",
              "question_type": "promoter",
              "category": "engagement",
              "results": {
                "total_responses": 2,
                "promoter_percentage": 50,
                "breakdown": {
                  "0": {
                    "count": 1,
                    "percentage": 50,
                    "label": "0 - Not likely at all"
                  },
                  "1": {
                    "count": 0,
                    "percentage": 0,
                    "label": "1"
                  },
                  "2": {
                    "count": 0,
                    "percentage": 0,
                    "label": "2"
                  },
                  "3": {
                    "count": 0,
                    "percentage": 0,
                    "label": "3"
                  },
                  "4": {
                    "count": 0,
                    "percentage": 0,
                    "label": "4"
                  },
                  "5": {
                    "count": 0,
                    "percentage": 0,
                    "label": "5"
                  },
                  "6": {
                    "count": 0,
                    "percentage": 0,
                    "label": "6"
                  },
                  "7": {
                    "count": 0,
                    "percentage": 0,
                    "label": "7"
                  },
                  "8": {
                    "count": 0,
                    "percentage": 0,
                    "label": "8"
                  },
                  "9": {
                    "count": 1,
                    "percentage": 50,
                    "label": "9"
                  },
                  "10": {
                    "count": 0,
                    "percentage": 0,
                    "label": "10 - Extremely likely"
                  }
                }
              }
            },
            "other_feedback_FR": {
              "question_name": "other_feedback_FR",
              "question_text": "Is there anything else you’d like to tell us about your experience at this workshop?",
              "question_short_text": "Additional experience comments",
              "question_type": "text",
              "category": "engagement",
              "results": {
                "total_responses": 2,
                "responses": [
                  "it was fun!!",
                  "nope"
                ]
              }
            }
          }
        },
        "facilitators": {
          "54": {
            "name": "Andy Bernard",
            "questions": {
              "demonstrated_knowledge": {
                "question_name": "demonstrated_knowledge",
                "question_text": "Demonstrated knowledge of the curriculum.",
                "question_short_text": "Knowledge of curriculum (%)",
                "question_type": "likert",
                "category": "facilitators",
                "results": {
                  "total_responses": 2,
                  "weighted_score": 42,
                  "agreement_count": 1,
                  "agreement_percentage": 50,
                  "breakdown": {
                    "1": {
                      "count": 1,
                      "percentage": 50,
                      "label": "Strongly Disagree",
                      "weighted_value": 0
                    },
                    "2": {
                      "count": 0,
                      "percentage": 0,
                      "label": "Disagree",
                      "weighted_value": 17
                    },
                    "3": {
                      "count": 0,
                      "percentage": 0,
                      "label": "Slightly Disagree",
                      "weighted_value": 33
                    },
                    "4": {
                      "count": 0,
                      "percentage": 0,
                      "label": "Neutral",
                      "weighted_value": 50
                    },
                    "5": {
                      "count": 0,
                      "percentage": 0,
                      "label": "Slightly Agree",
                      "weighted_value": 67
                    },
                    "6": {
                      "count": 1,
                      "percentage": 50,
                      "label": "Agree",
                      "weighted_value": 83
                    },
                    "7": {
                      "count": 0,
                      "percentage": 0,
                      "label": "Strongly Agree",
                      "weighted_value": 100
                    }
                  }
                }
              },
              "facilitator_did_well_fr": {
                "question_name": "facilitator_did_well_fr",
                "question_text": "What were two things Andy Bernard did well?",
                "question_short_text": "What did Andy Bernard do well?",
                "question_type": "text",
                "category": "facilitators",
                "results": {
                  "total_responses": 2,
                  "responses": [
                    "everything",
                    "nada"
                  ]
                }
              }
            }
          }
        },
        "implementation": {
          "questions": {
            "more_prepared": {
              "question_name": "more_prepared",
              "question_text": "I feel more prepared to teach the material covered in this workshop than before I came.",
              "question_short_text": "Feel prepared to teach (%)",
              "question_type": "likert",
              "category": "implementation",
              "results": {
                "total_responses": 2,
                "weighted_score": 50,
                "agreement_count": 1,
                "agreement_percentage": 50,
                "breakdown": {
                  "1": {
                    "count": 1,
                    "percentage": 50,
                    "label": "Strongly Disagree",
                    "weighted_value": 0
                  },
                  "2": {
                    "count": 0,
                    "percentage": 0,
                    "label": "Disagree",
                    "weighted_value": 17
                  },
                  "3": {
                    "count": 0,
                    "percentage": 0,
                    "label": "Slightly Disagree",
                    "weighted_value": 33
                  },
                  "4": {
                    "count": 0,
                    "percentage": 0,
                    "label": "Neutral",
                    "weighted_value": 50
                  },
                  "5": {
                    "count": 0,
                    "percentage": 0,
                    "label": "Slightly Agree",
                    "weighted_value": 67
                  },
                  "6": {
                    "count": 0,
                    "percentage": 0,
                    "label": "Agree",
                    "weighted_value": 83
                  },
                  "7": {
                    "count": 1,
                    "percentage": 50,
                    "label": "Strongly Agree",
                    "weighted_value": 100
                  }
                }
              }
            },
            "barriers_implementation_curriculum": {
              "question_name": "barriers_implementation_curriculum",
              "question_text": "Please share the main reasons you might not teach this workshop's content in your classroom this year.",
              "question_short_text": "Barriers to implementation",
              "question_type": "multiSelect",
              "category": "implementation",
              "results": {
                "total_respondents": 2,
                "breakdown": {
                  "needs_more_preparation": {
                    "count": 2,
                    "percentage": 100,
                    "label": "I would like more preparation before teaching this content in my classroom"
                  },
                  "time_constraints": {
                    "count": 1,
                    "percentage": 50,
                    "label": "I have limited time to adopt new curriculum"
                  },
                  "lack_admin_support": {
                    "count": 2,
                    "percentage": 100,
                    "label": "I don’t have enough support from my school’s administration"
                  },
                  "limited_student_interest": {
                    "count": 0,
                    "percentage": 0,
                    "label": "My students don’t seem interested in this content"
                  },
                  "none": {
                    "count": 0,
                    "percentage": 0,
                    "label": "None of these"
                  },
                  "other": {
                    "count": 0,
                    "percentage": 0,
                    "label": "Other"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```
