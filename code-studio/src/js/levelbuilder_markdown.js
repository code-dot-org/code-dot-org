/**
 * @file Main entry point for scripts used only in levelbuilder when editing
 *       DSL-defined levels.
 */
/* global $ */
'use strict';
var initializeEmbeddedMarkdownEditor = require('./initializeEmbeddedMarkdownEditor');

// Initialize markdown editors on page load
$(document).ready(function () {
  initializeEmbeddedMarkdownEditor(
    $('#level_dsl_text'),
    'level_markdown_textarea',
    $('#markdown-preview'),
    'markdown');
  initializeEmbeddedMarkdownEditor(
    $('#level_dsl_text'),
    'level_teacher_markdown_textarea',
    $('#teacher-markdown-preview'),
    'teacher_markdown');
});
