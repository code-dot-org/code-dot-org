/* eslint-disable */

// This is a generated file and SHOULD NOT BE EDITED MANUALLY!!
// Contents are generated as part of grunt build
// Source of truth is lib/cdo/shared_constants.rb and files in lib/cdo/shared_constants/

export const DefaultLocale = 'en-US' as const;

export const LocaleFallbacks = {
  "en-IN": "en-US",
  "es-ES": "es-MX",
  "es-LA": "es-MX",
  "pt-PT": "pt-BR"
} as const;

export const LocalizeToI18nLocales = {
  "ar": "ar-SA",
  "cs": "cs-CZ",
  "de": "de-DE",
  "en-IN": "en-IN",
  "en": "en-US",
  "es": "es-ES",
  "es-MX": "es-MX",
  "es-LA": "es-LA",
  "fa": "fa-IR",
  "fr": "fr-FR",
  "gu": "gu-IN",
  "hi": "hi-IN",
  "id": "id-ID",
  "it": "it-IT",
  "ja": "ja-JP",
  "kn": "kn-IN",
  "ko": "ko-KR",
  "mr": "mr-IN",
  "or": "or-IN",
  "pl": "pl-PL",
  "pt-BR": "pt-BR",
  "pt": "pt-PT",
  "ru": "ru-RU",
  "sk": "sk-SK",
  "ta": "ta-IN",
  "te": "te-IN",
  "th": "th-TH",
  "tr": "tr-TR",
  "uk": "uk-UA",
  "zh-Hans": "zh-CN",
  "zh-TW": "zh-TW"
} as const;

export const GlobalEditionDefaultRegion = 'us' as const;

export const GlobalEditionExcludedPaths = [
  "/assets/",
  "/shared/",
  "/api/hour/",
  "/users/auth/",
  "/lti/",
  "/restricted/",
  "/health_check",
  "/home/health_check"
] as const;

export const ArtistAutorunOptions = {
  "full_auto_run": "FULL_AUTO_RUN"
} as const;

export const LevelKind = {
  "peer_review": "peer_review",
  "assessment": "assessment",
  "puzzle": "puzzle",
  "unplugged": "unplugged",
  "level": "level",
  "stage_extras": "stage_extras"
} as const;

export const LevelStatus = {
  "not_tried": "not_tried",
  "submitted": "submitted",
  "perfect": "perfect",
  "passed": "passed",
  "attempted": "attempted",
  "review_accepted": "review_accepted",
  "review_rejected": "review_rejected",
  "dots_disabled": "dots_disabled",
  "free_play_complete": "free_play_complete",
  "completed_assessment": "completed_assessment"
} as const;

export const UserLevelInteractions = {
  "click_continue": "click_continue",
  "click_finish": "click_finish",
  "click_help_and_tips": "click_help_and_tips",
  "click_keep_working": "click_keep_working",
  "click_run": "click_run",
  "click_submit": "click_submit",
  "click_validate": "click_validate",
  "code_execution_error": "code_execution_error"
} as const;

export const SectionLoginType = {
  "word": "word",
  "picture": "picture",
  "email": "email",
  "google_classroom": "google_classroom",
  "clever": "clever",
  "lti_v1": "lti_v1"
} as const;

export const StudentGradeLevels = [
  "K",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "Other"
] as const;

export const PlGradeValue = 'pl' as const;

export const PostMilestoneMode = {
  "all": "all",
  "successful_runs_and_final_level_only": "successful_runs_and_final_level_only",
  "final_level_only": "final_level_only"
} as const;

export const AlwaysPublishableProjectTypes = [
  "artist",
  "frozen",
  "playlab",
  "gumball",
  "iceage",
  "infinity",
  "minecraft_adventurer",
  "minecraft_designer",
  "minecraft_hero",
  "minecraft_aquatic",
  "starwars",
  "starwarsblocks",
  "starwarsblocks_hour",
  "flappy",
  "bounce",
  "sports",
  "basketball",
  "artist_k1",
  "playlab_k1",
  "dance",
  "poetry",
  "poetry_hoc",
  "thebadguys",
  "music",
  "pythonlab"
] as const;

export const AllPublishableProjectTypes = [
  "artist",
  "frozen",
  "playlab",
  "gumball",
  "iceage",
  "infinity",
  "minecraft_adventurer",
  "minecraft_designer",
  "minecraft_hero",
  "minecraft_aquatic",
  "starwars",
  "starwarsblocks",
  "starwarsblocks_hour",
  "flappy",
  "bounce",
  "sports",
  "basketball",
  "artist_k1",
  "playlab_k1",
  "dance",
  "poetry",
  "poetry_hoc",
  "thebadguys",
  "music",
  "pythonlab",
  "applab",
  "gamelab",
  "spritelab"
] as const;

export const ConditionallyPublishableProjectTypes = [
  "applab",
  "gamelab"
] as const;

export const AbuseConstants = {
  "ABUSE_THRESHOLD": 15
} as const;

export const ErrorSeverityLevels = {
  "WARN": 2,
  "ERROR": 3,
  "FATAL": 4
} as const;

export const RestrictedPublishProjectTypes = [
  "spritelab"
] as const;

export const RubricUnderstandingLevels = {
  "EXTENSIVE": 3,
  "CONVINCING": 2,
  "LIMITED": 1,
  "NONE": 0
} as const;

export const RubricAiEvaluationStatus = {
  "QUEUED": 0,
  "RUNNING": 1,
  "SUCCESS": 2,
  "FAILURE": 1000,
  "PII_VIOLATION": 1001,
  "PROFANITY_VIOLATION": 1002,
  "REQUEST_TOO_LARGE": 1003,
  "STUDENT_LIMIT_EXCEEDED": 1004,
  "TEACHER_LIMIT_EXCEEDED": 1005
} as const;

export const RubricAiEvaluationLimits = {
  "STUDENT_LIMIT": 10,
  "TEACHER_LIMIT": 10
} as const;

export const EmailLinks = {
  "PRIVACY_POLICY_URL": "https://code.org/privacy",
  "CONTACT_US_URL": "https://code.org/contact",
  "TOS_URL": "https://code.org/tos",
  "STUDENT_PRIVACY_PLEDGE_URL": "https://studentprivacypledge.org/signatories/",
  "COMMON_SENSE_MEDIA_URL": "https://privacy.commonsense.org/evaluation/code.org",
  "CDO_SUPPORT_MAILTO": "mailto:support@code.org"
} as const;

export const ChildAccountComplianceStates = {
  "GRACE_PERIOD": "p",
  "LOCKED_OUT": "l",
  "PERMISSION_GRANTED": "g"
} as const;

export const DanceSongManifestFilename = 'songManifest2026.json' as const;

export const AiEvaluationTypes = {
  "SINGLE_STUDENT": "single_student",
  "SECTION_SUMMARY": "section_summary"
} as const;

export const AiInteractionStatus = {
  "ERROR": "error",
  "PII_VIOLATION": "pii_violation",
  "PROFANITY_VIOLATION": "profanity_violation",
  "USER_INPUT_TOO_LARGE": "user_input_too_large",
  "MODEL_TIMEOUT": "model_timeout",
  "MODEL_RATE_LIMITED": "model_rate_limited",
  "OK": "ok",
  "UNKNOWN": "unknown"
} as const;

export const LessonObjectiveReflectionValues = {
  "UNSURE": "unsure",
  "LOST": "lost",
  "CONFIDENT": "confident"
} as const;

export const PracticeProblemTypes = {
  "MULTIPLE_CHOICE_MULTI": "multiple_choice_multi_select",
  "MULTIPLE_CHOICE_SINGLE": "multiple_choice_single_select",
  "MATCH": "match",
  "SORT": "sort",
  "SCRAMBLE": "scramble"
} as const;

export const PracticeProblemDeliveryContext = {
  "AI_TUTOR_LESSON_DEEP_DIVE": "ai_tutor_lesson_deep_dive"
} as const;

export const ChallengeTypes = {
  "VIDEO": "video",
  "WHITEBOARD": "whiteboard"
} as const;

export const AiTutorTypes = {
  "COMPILATION": "compilation",
  "VALIDATION": "validation",
  "GENERAL_CHAT": "general_chat",
  "COMPLETION": "completion",
  "GENERIC_HELP": "generic_help"
} as const;

export const AiRequestExecutionStatus = {
  "NOT_STARTED": 0,
  "QUEUED": 1,
  "RUNNING": 2,
  "SUCCESS": 3,
  "FAILURE": 1000,
  "USER_PROFANITY": 1001,
  "USER_PII": 1002,
  "MODEL_PROFANITY": 1003,
  "MODEL_PII": 1004,
  "USER_INPUT_TOO_LARGE": 1005,
  "MODEL_TIMEOUT": 1006,
  "MODEL_IMAGE_FLAGGED": 1007,
  "MODEL_RATE_LIMITED": 1008,
  "MODEL_CONTENT_FILTERED": 1009
} as const;

export const StudentWorkEvaluationStatus = {
  "NO_ATTEMPT": "no_attempt",
  "STUDENT_PROFANITY": "student_profanity",
  "STUDENT_PII": "student_pii",
  "ALL_COMPLETE_CORRECT": "all_complete_correct",
  "PARTIAL_COMPLETE_CORRECT": "partial_complete_correct",
  "INCOMPLETE_INCORRECT": "incomplete_incorrect",
  "NOT_EVALUATED": "not_evaluated"
} as const;

export const AiChatModelIds = {
  "MISTRAL": "gen-ai-mistral-7b-inst-v01",
  "CHATGPT": "gpt-4o-mini",
  "LEARNLM": "learnlm-2.0-flash-experimental",
  "GEMINI_2_0_FLASH": "gemini-2.0-flash",
  "GEMINI_2_5_FLASH": "gemini-2.5-flash",
  "GEMINI_2_5_FLASH_LITE": "gemini-2.5-flash-lite",
  "GEMINI_2_5_PRO": "gemini-2.5-pro",
  "GEMINI_2_5_FLASH_IMAGE": "gemini-2.5-flash-image"
} as const;

export const AiChatClientTypes = {
  "AI_CHAT_LAB": "ai-chat-lab",
  "AI_TUTOR": "ai-tutor",
  "FLOW_LAB": "flow-lab",
  "LESSON_DEEP_DIVE": "lesson-deep-dive"
} as const;

export const AiChatReadTimeouts = {
  "ai-chat-lab": 30,
  "ai-tutor": 30,
  "flow-lab": 60,
  "lesson-deep-dive": 60
} as const;

export const AiChatTeacherFeedback = {
  "CLEAN_DISAGREE": "clean_disagree",
  "PROFANITY_AGREE": "profanity_agree",
  "PROFANITY_DISAGREE": "profanity_disagree"
} as const;

export const AiChatAccessLevels = {
  "ENABLED": "enabled",
  "DISABLED": "disabled",
  "ESSENTIAL_ONLY": "essential_only"
} as const;

export const AiChatToolsDependency = {
  "ESSENTIAL": "essential",
  "AVAILABLE": "available",
  "NONE": "none"
} as const;

export const FeaturedProjectStatus = {
  "active": "active",
  "bookmarked": "bookmarked",
  "archived": "archived"
} as const;

export const FeaturedProjectConstants = {
  "MAX_REQUESTS_PER_CATEGORY": 15
} as const;

export const CapLinks = {
  "PARENTAL_CONSENT_GUIDE_URL": "https://support.code.org/hc/en-us/articles/15465423491085-How-do-I-obtain-parent-or-guardian-permission-for-student-accounts"
} as const;

export const LmsLinks = {
  "INTEGRATION_GUIDE_URL": "https://support.code.org/hc/en-us/articles/23120014459405-Learning-Management-System-LMS-and-Single-Sign-On-SSO-Integrations-and-Support-for-Code-org",
  "INSTALL_INSTRUCTIONS_URL": "https://support.code.org/hc/en-us/articles/23621907533965-Install-Code-org-Integrations-for-your-Learning-Management-System",
  "ROSTER_SYNC_INSTRUCTIONS_URL": "https://support.code.org/hc/en-us/articles/23621978654605-Sync-Rosters-with-your-Learning-Management-System",
  "ADDITIONAL_FEEDBACK_URL": "https://studio.code.org/form/lms_integration_modal_feedback",
  "SUPPORTED_METHODS_URL": "https://github.com/code-dot-org/code-dot-org/blob/staging/docs/lti-integration.md#option-2-manual-entry"
} as const;

export const UserTypes = {
  "STUDENT": "student",
  "TEACHER": "teacher"
} as const;

export const NonSchoolOptions = {
  "SELECT_A_SCHOOL": "selectASchool",
  "CLICK_TO_ADD": "clickToAdd",
  "NO_SCHOOL_SETTING": "noSchoolSetting"
} as const;

export const UsStates = {
  "AL": "Alabama",
  "AK": "Alaska",
  "AZ": "Arizona",
  "AR": "Arkansas",
  "CA": "California",
  "CO": "Colorado",
  "CT": "Connecticut",
  "DE": "Delaware",
  "FL": "Florida",
  "GA": "Georgia",
  "HI": "Hawaii",
  "ID": "Idaho",
  "IL": "Illinois",
  "IN": "Indiana",
  "IA": "Iowa",
  "KS": "Kansas",
  "KY": "Kentucky",
  "LA": "Louisiana",
  "ME": "Maine",
  "MD": "Maryland",
  "MA": "Massachusetts",
  "MI": "Michigan",
  "MN": "Minnesota",
  "MS": "Mississippi",
  "MO": "Missouri",
  "MT": "Montana",
  "NE": "Nebraska",
  "NV": "Nevada",
  "NH": "New Hampshire",
  "NJ": "New Jersey",
  "NM": "New Mexico",
  "NY": "New York",
  "NC": "North Carolina",
  "ND": "North Dakota",
  "OH": "Ohio",
  "OK": "Oklahoma",
  "OR": "Oregon",
  "PA": "Pennsylvania",
  "RI": "Rhode Island",
  "SC": "South Carolina",
  "SD": "South Dakota",
  "TN": "Tennessee",
  "TX": "Texas",
  "UT": "Utah",
  "VT": "Vermont",
  "VA": "Virginia",
  "WA": "Washington",
  "DC": "Washington, D.C.",
  "WV": "West Virginia",
  "WI": "Wisconsin",
  "WY": "Wyoming"
} as const;

export const ProjectSubmissionStatus = {
  "CAN_SUBMIT": "can_submit",
  "ALREADY_SUBMITTED": "already_submitted",
  "PROJECT_TYPE_NOT_ALLOWED": "project_type_not_allowed",
  "RESTRICTED_SHARE_MODE": "restricted_share_mode",
  "SHARING_DISABLED": "sharing_disabled",
  "OWNER_TOO_NEW": "owner_too_new",
  "PROJECT_TOO_NEW": "project_too_new"
} as const;

export const EducatorRoles = [
  {
    "value": "classroom_teacher",
    "label": "Classroom Teacher",
    "category": "educator"
  },
  {
    "value": "stem_tech_teacher",
    "label": "STEM/Technology Teacher",
    "category": "educator"
  },
  {
    "value": "subject_area_teacher",
    "label": "Subject Area Teacher",
    "category": "educator"
  },
  {
    "value": "librarian_media_specialist",
    "label": "Librarian/Media Specialist",
    "category": "educator"
  },
  {
    "value": "homeschool_teacher",
    "label": "Homeschool Teacher",
    "category": "educator"
  },
  {
    "value": "school_admin",
    "label": "School Administrator",
    "category": "admin"
  },
  {
    "value": "district_admin",
    "label": "District Administrator",
    "category": "admin"
  },
  {
    "value": "parent",
    "label": "Parent",
    "category": "other"
  },
  {
    "value": "other",
    "label": "Other",
    "category": "other"
  }
] as const;

export const ResourceEmbeddabilityOptions = {
  "EMBED_AND_RESOURCE_DROPDOWN": {
    "value": "embed_and_resource_dropdown",
    "label": "AI TA knowledge base and resource dropdown"
  },
  "EMBED_ONLY": {
    "value": "embed_only",
    "label": "AI TA knowledge base only"
  },
  "RESOURCE_DROPDOWN_ONLY": {
    "value": "resource_dropdown_only",
    "label": "Resource dropdown only"
  }
} as const;

export const AiDiffContext = {
  "LESSON": "lesson",
  "UNIT": "unit",
  "COURSE": "course",
  "GENERAL": "general",
  "LEVEL": "level",
  "PROGRESS": "progress"
} as const;

export const AiDiffAssociation = {
  "LESSON": "lesson",
  "UNIT": "unit",
  "COURSE": "course",
  "SECTION": "section"
} as const;

export const AiDiffArtifactType = {
  "EXIT_TICKET": "AidiffExitTicket",
  "LESSON_HOOK": "AidiffLessonHook"
} as const;

export const DisallowedRoutes = [
  "/admin/",
  "/api/",
  "/blockly/",
  "/dashboardapi/",
  "/join/",
  "/milestone/",
  "/projects/",
  "/sections/",
  "/r/",
  "/c/",
  "/oauth_sign_out/",
  "/certificates/"
] as const;

export const BubbleChoiceCustomModes = {
  "MUSIC_DANCE_AI": "music_dance_ai"
} as const;

export const BubbleChoiceNavigationTypes = {
  "PARENT": "parent",
  "NEXT_LEVEL": "next_level"
} as const;

export const AllowedHostnameSuffixes = [
  "api.themoviedb.org",
  "api.disneyapi.dev",
  "api.coinlayer.com",
  "pro-api.coinmarketcap.com",
  "api.exchangeratesapi.io",
  "currencyapi.com",
  "moneyconvert.net",
  "quandl.com",
  "api.blizzard.com",
  "api.nookipedia.com",
  "api.mojang.com",
  "api.scryfall.com",
  "api.sportsdata.io",
  "ch.tetr.io",
  "deckofcardsapi.com",
  "openlibrary.org",
  "opentdb.com",
  "pokeapi.co",
  "roblox.com",
  "runescape.com",
  "sessionserver.mojang.com",
  "stats.minecraftservers.org",
  "textures.minecraft.net",
  "thecatapi.com",
  "thedogapi.com",
  "official-joke-api.appspot.com",
  "api.census.gov",
  "api.energidataservice.dk",
  "api.fda.gov",
  "api.nal.usda.gov",
  "api.si.edu",
  "api-v3.mbta.com",
  "data.austintexas.gov",
  "data.cityofchicago.org",
  "data.gv.at",
  "rejseplanen.dk",
  "transitchicago.com",
  "vpic.nhtsa.dot.gov",
  "api.congress.gov",
  "api.nasa.gov",
  "api.open-notify.org",
  "api.spacexdata.com",
  "data.nasa.gov",
  "hubblesite.org",
  "images-api.nasa.gov",
  "api.open-meteo.com",
  "api.weather.gov",
  "api.weatherapi.com",
  "api.openweathermap.org",
  "api.waqi.info",
  "dataservice.accuweather.com",
  "data.weather.gov.hk",
  "noaa.gov",
  "api.foursquare.com",
  "api.opencagedata.com",
  "api.openrouteservice.org",
  "api.zippopotam.us",
  "restcountries.com",
  "worldclockapi.com",
  "worldtimeapi.org",
  "api.mathjs.org",
  "qrng.anu.edu.au",
  "random.org",
  "api.wolframalpha.com",
  "api.github.com",
  "io.adafruit.com",
  "maker.ifttt.com",
  "googleapis.com",
  "api.rebrandly.com",
  "api.spotify.com",
  "itunes.apple.com",
  "pixabay.com",
  "wikipedia.org",
  "xeno-canto.org",
  "api.datamuse.com",
  "gutendex.com",
  "api.scripture.api.bible",
  "api.adviceslip.com",
  "api.amadeus.com",
  "api.arasaac.org",
  "api.randomuser.me",
  "api.thingspeak.com",
  "api.spoonacular.com",
  "native-land.ca",
  "perenual.com",
  "serpapi.com",
  "newsapi.org",
  "isenseproject.org",
  "lakeside-cs.org",
  "code.org",
  "api.pegelalarm.at",
  "bnefoodtrucks.com.au",
  "covidtracking.com",
  "cryptonator.com",
  "open.mapquestapi.com",
  "swapi.dev"
] as const;

export const AllowedImageHostnameSuffixes = [
  "picsum.photos",
  "images.code.org",
  "upload.wikimedia.org"
] as const;

export const AllowedFontHostnames = [
  "fonts.googleapis.com",
  "fonts.gstatic.com"
] as const;

export const SafeAndSupportedImageTypes = [
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp"
] as const;
