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
 * @property {SerializedAnimationList} initialAnimationList
 * @property {Object} initialGeneratedProperties
 * @property {string} levelGameName
 * @property {string} skinId
 * @property {string} baseUrl
 * @property {string} app
 * @property {boolean} droplet
 * @property {'.min'|''} pretty - todo: no longer used?
 * @property {Level|Artist|Blockly} level
 * @property {boolean} showUnusedBlocks
 * @property {boolean} fullWidth
 * @property {boolean} noHeader
 * @property {boolean} noFooter
 * @property {boolean} smallFooter
 * @property {boolean} codeStudioLogo
 * @property {boolean} hasI18n
 * @property {boolean} whiteBackground
 * @property {Object[]} callouts
 * @property {string} channel
 * @property {boolean} readonlyWorkspace
 * @property {boolean} isExternalProjectLevel
 * @property {boolean} isLegacyShare
 * @property {boolean} legacyShareStyle
 * @property {PostMileStoneMode} postMilestoneMode
 * @property {string} puzzleRatingsUrl
 * @property {string} authoredHintViewRequestsUrl
 * @property {?} authoredHintsUsedIds
 * @property {number} serverLevelId
 * @property {number} serverProjectLevelId
 * @property {number} serverScriptLevelId
 * @property {string} gameDisplayName
 * @property {boolean} publicCaching
 * @property {?boolean} is13Plus - Will be true if the user is 13 or older,
 *           false if they are 12 or younger, and undefined if we don't know
 *           (such as when they are not signed in).
 * @property {boolean} verifiedTeacher
 * @property {boolean} hasContainedLevels
 * @property {boolean} hideSource
 * @property {string} share
 * @property {string} labUserId
 * @property {string} firebaseName
 * @property {string} firebaseAuthToken
 * @property {string} firebaseChannelIdSuffix
 * @property {boolean} isSignedIn
 * @property {boolean} pinWorkspaceToBottom
 * @property {boolean} hasVerticalScrollbars
 * @property {boolean} showExampleTestButtons
 * @property {ReportOptions} report
 * @property {boolean} sendToPhone
 * @property {string} send_to_phone_url
 * @property {CopyrightStrings} copyrightStrings
 * @property {string} teacherMarkdown
 * @property {DialogOptions} dialog
 * @property {string} locale
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
 * @property {boolean} editCode
 * @property {boolean} embed
 * @property {boolean} isK1
 * @property {boolean} isProjectLevel
 * @property {boolean} skipInstructionsPopup
 * @property {boolean} disableParamEditing
 * @property {boolean} disableVariableEditing
 * @property {boolean} useModalFunctionEditor
 * @property {boolean} useContractEditor
 * @property {boolean} contractHighlight
 * @property {boolean} contractCollapse
 * @property {boolean} examplesHighlight
 * @property {boolean} examplesCollapse
 * @property {boolean} definitionHighlight
 * @property {boolean} definitionCollapse
 * @property {boolean} freePlay
 * @property {number} appWidth
 * @property {number} appHeight
 * @property {number} sliderSpeed
 * @property {string} calloutJson
 * @property {boolean} disableExamples
 * @property {boolean} showTurtleBeforeRun
 * @property {boolean} autocompletePaletteApisOnly
 * @property {boolean} textModeAtStart
 * @property {boolean} designModeAtStart
 * @property {boolean} hideDesignMode
 * @property {boolean} beginnerMode
 * @property {string} levelId
 * @property {number} puzzle_number
 * @property {number} stage_total
 * @property {boolean} iframeEmbed
 * @property {?} lastAttempt
 * @property {boolean} submittable
 * @property {boolean} final_level
 * @property {array} levelVideos
 * @property {string} mapReference
 * @property {array} referenceLinks
 */

/**
 * @typedef {Object} Artist
 * @property {string} startDirection
 * @property {number} initialX
 * @property {number} initialY
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
