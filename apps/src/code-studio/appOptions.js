/* JSDoc annotations for appOptions and related object types. */

/**
 * Object representing everything in window.appOptions.
 *
 * @typedef {Object} AppOptionsConfig
 * @property {boolean} embedded
 * @property {string} scriptName
 * @property {string} stagePosition
 * @property {string} levelPosition
 * @property {AutoplayVideo} autoplayVideo
 * @property {?} initialAnimationList
 * @property {string} levelGameName
 * @property {string} skinId
 * @property {string} baseUrl
 * @property {string} app
 * @property {?} droplet
 * @property {?} pretty
 * @property {Level|Artist|Blockly} level
 * @property {?} showUnusedBlocks
 * @property {?} fullWidth
 * @property {?} noHeader
 * @property {?} noFooter
 * @property {?} smallFooter
 * @property {?} codeStudioLogo
 * @property {?} hasI18n
 * @property {?} whiteBackground
 * @property {?} callouts
 * @property {?} channel
 * @property {?} readonlyWorkspace
 * @property {?} isExternalProjectLevel
 * @property {?} isChannelBacked
 * @property {?} isLegacyShare
 * @property {?} postMilestone
 * @property {?} postFinalMilestone
 * @property {?} puzzleRatingsUrl
 * @property {?} authoredHintViewRequestsUrl
 * @property {?} authoredHintsUsedIds
 * @property {?} serverLevelId
 * @property {?} serverProjectLevelId
 * @property {?} gameDisplayName
 * @property {?} publicCaching
 * @property {?boolean} is13Plus - Will be true if the user is 13 or older,
 *           false if they are 12 or younger, and undefined if we don't know
 *           (such as when they are not signed in).
 * @property {?} hasContainedLevels
 * @property {?} hideSource
 * @property {?} share
 * @property {?} labUserId
 * @property {?} firebaseName
 * @property {?} firebaseAuthToken
 * @property {?} firebaseChannelIdSuffix
 * @property {?} isSignedIn
 * @property {?} pinWorkspaceToBottom
 * @property {?} hasVerticalScrollbars
 * @property {?} showExampleTestButtons
 * @property {?} rackEnv
 * @property {ReportOptions} report
 * @property {boolean} sendToPhone
 * @property {string} send_to_phone_url
 * @property {CopyrightStrings} copyrightStrings
 * @property {?} teacherMarkdown
 * @property {DialogOptions} dialog
 * @property {?} locale
 */

/**
 * @typedef {Object} ReportOptions
 * @property {FallbackResponse} fallback_response
 * @property {MilestoneReport} lastReport
 * @property {?} callback
 * @property {?} sublevelCallback
 */

/**
 * @typedef {Object} FallbackResponse
 * @property {MilestoneResponse} success
 * @property {MilestoneResponse} failure
 */

/**
 * @typedef {Object} Level
 * @property {string} skin
 * @property {?} editCode
 * @property {?} embed
 * @property {?} isK1
 * @property {?} isProjectLevel
 * @property {?} skipInstructionsPopup
 * @property {?} disableParamEditing
 * @property {?} disableVariableEditing
 * @property {?} useModalFunctionEditor
 * @property {?} useContractEditor
 * @property {?} contractHighlight
 * @property {?} contractCollapse
 * @property {?} examplesHighlight
 * @property {?} examplesCollapse
 * @property {?} definitionHighlight
 * @property {?} definitionCollapse
 * @property {?} freePlay
 * @property {?} appWidth
 * @property {?} appHeight
 * @property {?} sliderSpeed
 * @property {?} calloutJson
 * @property {?} disableExamples
 * @property {?} showTurtleBeforeRun
 * @property {?} autocompletePaletteApisOnly
 * @property {?} textModeAtStart
 * @property {?} designModeAtStart
 * @property {?} hideDesignMode
 * @property {?} beginnerMode
 * @property {?} levelId
 * @property {?} puzzle_number
 * @property {?} stage_total
 * @property {?} iframeEmbed
 * @property {?} lastAttempt
 * @property {?} submittable
 * @property {boolean} final_level
 */

/**
 * @typedef {Object} Artist
 * @property {string} startDirection
 * @property {number} x
 * @property {number} y
 * @property predraw_blocks
 * @property images
 * @property free_play
 * @property permitted_errors
 * @property impressive
 * @property discard_background
 * @property shapeways_url
 * @property disable_sharing
 */

/**
 * @typedef {Object} Blockly
 * @property levelUrl
 * @property skin
 * @property initializationBlocks
 * @property startBlocks
 * @property toolboxBlocks
 * @property requiredBlocks
 * @property recommendedBlocks
 * @property solutionBlocks
 * @property aniGifUrl
 * @property isK1
 * @property skipInstructionsPopup
 * @property neverAutoplayVideo
 * @property scrollbars
 * @property ideal
 * @property minWorkspaceHeight
 * @property stepSpeed
 * @property sliderSpeed
 * @property disableParamEditing
 * @property disableVariableEditing
 * @property disableProcedureAutopopulate
 * @property use_modalFunctionEditor
 * @property useContractEditor
 * @property defaultNumExampleBlocks
 * @property openFunctionDefinition
 * @property contractHighlight
 * @property contractCollapse
 * @property examplesHighlight
 * @property examplesCollapse
 * @property examplesRequired
 * @property definitionHighlight
 * @property definitionCollapse
 * @property disableExamples
 * @property projectTemplateLevelName
 * @property hideShareAndRemix
 * @property isProjectLevel
 * @property editCode
 * @property codeFunctions
 * @property paletteCategoryAtStart
 * @property failureMessageOverride
 * @property dropletTooltipsDisabled
 * @property lockZeroParamFunctions
 * @property containedLevelNames
 * @property encryptedExamples
 * @property disableIfElseEditing
 */

/**
 * @typedef {Object} CopyrightStrings
 * @property {string} thank_you
 * @property {string} help_from_html
 * @property {string} art_from_html
 * @property {string} code_from_html
 * @property {string} powered_by_aws
 * @property {string} trademark
 */

/**
 * @typedef {Object} DialogOptions
 * @property {boolean} skipSound
 * @property {string} preTitle
 * @property {FallbackResponse} fallbackResponse
 * @property {function} callback
 * @property {function} sublevelCallback
 * @property {string} app
 * @property {?} level
 * @property {boolean} shouldShowDialog
 */

/**
 * @typedef {Object} LiveMilestoneResponse
 * @augments MilestoneResponse
 * @property {?} timestamp
 * @property {{message: ?, type: ?, contents: ?}} share_failure
 * @property {number} hints_used - used by gamification.
 * @property {string} save_to_gallery_url - URL to save this submission to the gallery.
 * @property {string} level_source
 * @property {string} level_source_id
 * @property {string} level_source_image_url
 */

/**
 * @typedef {Object} MilestoneResponse
 * @property {?} script_id
 * @property {?} level_id
 * @property {?} total_lines
 * @property {AutoplayVideo} video_info
 * @property {string} redirect - path to 'next' level in the stage/script sequence.
 * @property {{previous: {position: number, name: string}}} stage_changing
 * @property {boolean} end_of_stage_experience
 * @property {HintViewRequest[]} hint_view_requests
 * @property {string} hint_view_request_url
 * @property {string} message
 * @property {boolean} puzzle_ratings_enabled
 */

/**
 * @typedef {{feedback_type: TestResult, feedback_xml: string}} HintViewRequest
 */
