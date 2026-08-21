// What Web Lab tells the tutor about the project.
//
// The filtering is the substance: what a model is shown, and what it is not.
// Getting it wrong either wastes the context window on a CSV or shows a student
// the validation code that grades them.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource, ProjectFile} from '@code-dot-org/core/api';

import {projectSourceCode, webLabContext} from '../context';

const file = (over: Partial<ProjectFile>): ProjectFile =>
  ({
    id: '1',
    name: 'index.html',
    language: 'html',
    contents: '<p>hi</p>',
    folderId: '0',
    ...over,
  }) as ProjectFile;

const project = (files: ProjectFile[], folders = {}): MultiFileSource =>
  ({
    files: Object.fromEntries(files.map(f => [f.id, f])),
    folders,
  }) as MultiFileSource;

describe('projectSourceCode', () => {
  it('names each file and fences its contents', () => {
    expect(projectSourceCode(project([file({})]))).toBe(
      'filename: /index.html\n```\n<p>hi</p>\n```',
    );
  });

  it('shows every text file, not only the open one', () => {
    // A question about a stylesheet is usually a question about the markup it
    // selects; a tutor shown one file answers about the file, not the page.
    const out = projectSourceCode(
      project([
        file({id: '1', name: 'index.html'}),
        file({id: '2', name: 'style.css', contents: 'p {}'}),
      ]),
    );

    expect(out).toContain('/index.html');
    expect(out).toContain('/style.css');
  });

  it('includes the folders a file lives in', () => {
    // Two files called index.html in different folders are otherwise the same
    // file as far as the model can tell.
    const out = projectSourceCode(
      project([file({folderId: '7'})], {
        '7': {id: '7', name: 'pages', parentId: '0'},
      }),
    );

    expect(out).toContain('filename: /pages/index.html');
  });

  it('leaves out the lesson machinery', () => {
    // Validation code grades the student; showing it to their tutor is showing
    // it to them.
    const out = projectSourceCode(
      project([
        file({id: '1', name: 'index.html'}),
        file({id: '2', name: 'check.js', type: 'validation'}),
        file({id: '3', name: 'runner.js', type: 'system_support'}),
      ]),
    );

    expect(out).toContain('index.html');
    expect(out).not.toContain('check.js');
    expect(out).not.toContain('runner.js');
  });

  it('leaves out prose and data, which are not the program', () => {
    const out = projectSourceCode(
      project([
        file({id: '1', name: 'index.html'}),
        file({id: '2', name: 'notes.md', contents: '# notes'}),
        file({id: '3', name: 'data.csv', contents: 'a,b'}),
        file({id: '4', name: 'readme.txt', contents: 'hello'}),
      ]),
    );

    expect(out).toContain('index.html');
    for (const left of ['notes.md', 'data.csv', 'readme.txt']) {
      expect(out).not.toContain(left);
    }
  });

  it('names an image rather than showing its bytes', () => {
    // An uploaded file lives in the assets backend and has no text contents at
    // all; the model needs to know the page has one.
    const out = projectSourceCode(
      project([
        file({
          id: '1',
          name: 'cat.png',
          contents: '',
          url: 'https://x/cat.png',
        }),
      ]),
    );

    expect(out).toBe('image: /cat.png');
  });

  it('is undefined for a project with nothing readable in it', () => {
    // Rather than an empty code fence, which would tell the model the student
    // has written an empty file.
    expect(projectSourceCode(undefined)).toBeUndefined();
    expect(projectSourceCode(project([]))).toBeUndefined();
    expect(
      projectSourceCode(project([file({name: 'notes.md'})])),
    ).toBeUndefined();
  });
});

describe('webLabContext', () => {
  it('carries the instructions and what the student has done', () => {
    expect(
      webLabContext({
        source: project([file({})]),
        longInstructions: 'Make a page.',
        hasRun: false,
        hasEdited: true,
      }),
    ).toMatchObject({
      longInstructions: 'Make a page.',
      hasRun: false,
      hasEdited: true,
    });
  });
});
