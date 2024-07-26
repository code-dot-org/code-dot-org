#!/usr/bin/env ruby

require 'json'

require_relative '../../../../../dashboard/config/environment'
require_relative '../../../../../dashboard/app/models/concerns/text_to_speech'
require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_out_base'
require_relative '../text_to_speech'

module I18n
  module Resources
    module Apps
      module TextToSpeech
        class SyncOut < I18n::Utils::SyncOutBase
          METRIC_CONTEXT = 'update_i18n_static_messages'.freeze
          TTS_LOCALES = ::TextToSpeech::VOICES.keys.freeze

          # TODO: (elijah) formalize a process for flagging these strings somewhere in apps code,
          # rather than maintaining this ugly manual Hash
          LABS_FEEDBACK_MESSAGE_KEYS = {
            common: %w[
              emptyBlocksErrorMsg
              emptyFunctionBlocksErrorMsg
              errorEmptyFunctionBlockModal
              errorGenericLintError
              errorIncompleteBlockInFunction
              errorParamInputUnattached
              errorQuestionMarksInNumberField
              errorUnusedFunction
              errorUnusedParam
              extraTopBlocks
              hintPromptInline
              keepPlaying
              levelIncompleteError
              missingRecommendedBlocksErrorMsg
              missingRequiredBlocksErrorMsg
              nestedForSameVariable
              nextPuzzle
              recommendedBlockContextualHintTitle
              shareFailure
              tooMuchWork
              tryAgain
              tryBlocksBelowFeedback
            ],
            craft: %w[
              generatedCodeDescription
              reinfFeedbackMsg
            ],
            dance: %w[
              danceFeedbackNeedNewDancer
              danceFeedbackNoDancers
              danceFeedbackNoBackground
              danceFeedbackTooManyDancers
              danceFeedbackUseSetSize
              danceFeedbackUseSetTint
              danceFeedbackUseStartMapping
              danceFeedbackStartNewMove
              danceFeedbackNeedDifferentDance
              danceFeedbackNeedEveryTwoMeasures
              danceFeedbackNeedMakeANewDancer
              danceFeedbackKeyEvent
              danceFeedbackDidntPress
              danceFeedbackPressedKey
              danceFeedbackNeedTwoDancers
              danceFeedbackOnlyOneDancerMoved
              danceFeedbackNeedLead
              danceFeedbackNeedBackup
              danceFeedbackSetSize
            ],
            jigsaw: %w[
              reinfFeedbackMsg
            ],
            maze: %w[
              collectorCollectedNothing
              collectorCollectedTooMany
              didNotCollectEverything
              didNotPlantEverywhere
              flowerEmptyError
              honeycombFullError
              insufficientHoney
              insufficientNectar
              notAtFlowerError
              notAtHoneycombError
              plantInNonSoilError
              uncheckedCloudError
              uncheckedPurpleError
            ],
            studio: %w[
              hoc2015_shareGame
              shareGame
            ],
            turtle: %w[
              lengthFeedback
              reinfFeedbackMsg
              shareDrawing
            ],
          }.freeze

          def perform
            progress_bar.start

            progress_bar.total = TTS_LOCALES.size * LABS_FEEDBACK_MESSAGE_KEYS.size
            I18nScriptUtils.process_in_threads(TTS_LOCALES) do |locale|
              js_locale = I18nScriptUtils.to_js_locale(locale)

              LABS_FEEDBACK_MESSAGE_KEYS.each do |lab, message_keys|
                lab_i18n_file_path = CDO.dir("apps/i18n/#{lab}/#{js_locale}.json")
                next unless File.exist?(lab_i18n_file_path)

                localized_messages = JSON.load_file(lab_i18n_file_path)
                next if localized_messages.empty?

                message_keys.each do |message_key|
                  localized_message = localized_messages[message_key]
                  next unless localized_message

                  tts_message_l10n = mutex.synchronize {::TextToSpeech.sanitize(localized_message)}
                  tts_file_path = ::TextToSpeech.tts_path(localized_message, localized_message, locale: locale)

                  ::TextToSpeech.tts_upload_to_s3(tts_message_l10n, 'message', tts_file_path, METRIC_CONTEXT, locale: locale)
                end
              ensure
                mutex.synchronize {progress_bar.increment}
              end
            end

            progress_bar.finish
          end
        end
      end
    end
  end
end

I18n::Resources::Apps::TextToSpeech::SyncOut.perform if __FILE__ == $0
