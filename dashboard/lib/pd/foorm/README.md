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