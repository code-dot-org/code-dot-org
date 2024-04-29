/* eslint-disable */

// This is a generated file and SHOULD NOT BE EDITED MANUALLY!!
// Contents are generated as part of grunt build
// Source of truth is lib/cdo/shared_constants.rb and files in lib/cdo/shared_constants/

export const ArtistAutorunOptions = {
  "full_auto_run": "FULL_AUTO_RUN"
};

export const LevelKind = {
  "peer_review": "peer_review",
  "assessment": "assessment",
  "puzzle": "puzzle",
  "unplugged": "unplugged",
  "level": "level",
  "stage_extras": "stage_extras"
};

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
};

export const SectionLoginType = {
  "word": "word",
  "picture": "picture",
  "email": "email",
  "google_classroom": "google_classroom",
  "clever": "clever",
  "lti_v1": "lti_v1"
};

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
];

export const PlGradeValue = 'pl';

export const PostMilestoneMode = {
  "all": "all",
  "successful_runs_and_final_level_only": "successful_runs_and_final_level_only",
  "final_level_only": "final_level_only"
};

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
  "thebadguys"
];

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
  "applab",
  "gamelab",
  "spritelab"
];

export const ConditionallyPublishableProjectTypes = [
  "applab",
  "gamelab"
];

export const AbuseConstants = {
  "ABUSE_THRESHOLD": 15
};

export const ErrorSeverityLevels = {
  "WARN": 2,
  "ERROR": 3,
  "FATAL": 4
};

export const RestrictedPublishProjectTypes = [
  "spritelab"
];

export const RubricUnderstandingLevels = {
  "EXTENSIVE": 3,
  "CONVINCING": 2,
  "LIMITED": 1,
  "NONE": 0
};

export const RubricAiEvaluationStatus = {
  "QUEUED": 0,
  "RUNNING": 1,
  "SUCCESS": 2,
  "FAILURE": 1000,
  "PII_VIOLATION": 1001,
  "PROFANITY_VIOLATION": 1002,
  "REQUEST_TOO_LARGE": 1003
};

export const EmailLinks = {
  "PRIVACY_POLICY_URL": "https://code.org/privacy",
  "CONTACT_US_URL": "https://code.org/contact",
  "TOS_URL": "https://code.org/tos",
  "STUDENT_PRIVACY_PLEDGE_URL": "https://studentprivacypledge.org/signatories/",
  "COMMON_SENSE_MEDIA_URL": "https://privacy.commonsense.org/evaluation/code.org",
  "CDO_SUPPORT_MAILTO": "mailto:support@code.org"
};

export const ChildAccountComplianceStates = {
  "LOCKED_OUT": "l",
  "REQUEST_SENT": "s",
  "PERMISSION_GRANTED": "g"
};

export const CensusConstants = {
  "CURRENT_CENSUS_SCHOOL_YEAR": 2023
};

export const DanceSongManifestFilename = 'songManifest2024_v2.json';

export const AiTutorInteractionStatus = {
  "ERROR": "error",
  "PII_VIOLATION": "pii_violation",
  "PROFANITY_VIOLATION": "profanity_violation",
  "OK": "ok",
  "UNKNOWN": "unknown"
};

export const AiTutorTypes = {
  "COMPILATION": "compilation",
  "VALIDATION": "validation",
  "GENERAL_CHAT": "general_chat"
};

export const PiiTypes = {
  "EMAIL": "email",
  "PHONE": "phone",
  "ADDRESS": "address"
};

export const FeaturedProjectStatus = {
  "active": "active",
  "bookmarked": "bookmarked",
  "archived": "archived"
};

export const FeaturedProjectConstants = {
  "MAX_REQUESTS_PER_CATEGORY": 15
};

export const LmsLinks = {
  "INTEGRATION_GUIDE_URL": "https://support.code.org/hc/en-us/articles/23120014459405-Learning-Management-System-LMS-and-Single-Sign-On-SSO-Integrations-and-Support-for-Code-org",
  "INSTALL_INSTRUCTIONS_URL": "https://support.code.org/hc/en-us/articles/23621907533965-Install-Code-org-Integrations-for-your-Learning-Management-System",
  "INSTALL_GUIDE_FOR_CANVAS_URL": "https://support.code.org/hc/en-us/articles/23123273783437-Install-the-Code-org-Integration-for-Canvas",
  "ROSTER_SYNC_INSTRUCTIONS_URL": "https://support.code.org/hc/en-us/articles/23621978654605-Sync-Rosters-with-your-Learning-Management-System",
  "INTEGRATION_EARLY_ACCESS_URL": "https://docs.google.com/forms/d/e/1FAIpQLScjfVR4CZs8Utf5vI4mz3e1q8vdH6RNIgTUWygZXN0oovBSQg/viewform",
  "INTEGRATION_BUG_REPORT_URL": "https://support.code.org/hc/en-us/requests/new?ticket_form_id=14998494738829&tf_23889708=lms_eaf",
  "ADDITIONAL_FEEDBACK_URL": "https://studio.code.org/form/lms_integration_modal_feedback",
  "SUPPORTED_METHODS_URL": "https://github.com/code-dot-org/code-dot-org/blob/staging/docs/lti-integration.md#option-2-manual-entry"
};

export const UserTypes = {
  "STUDENT": "student",
  "TEACHER": "teacher"
};
