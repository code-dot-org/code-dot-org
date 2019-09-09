/** @file Test of searchAssetsTest.js. */

import assert from 'assert';
import {searchAssets} from '@cdo/apps/code-studio/assets/searchAssets';
import animationLibrary from '@cdo/apps/p5lab/gamelab/animationLibrary.json';
import soundLibrary from '@cdo/apps/code-studio/soundLibrary.json';

describe('search assets from animation library', function() {
  it('searchAssets searches the animation library in a category', function() {
    const maxResults = 5;
    const pageCount = 0;
    const searchedData = searchAssets(
      'hip',
      'category_animals',
      animationLibrary,
      pageCount,
      maxResults
    );

    assert.equal(searchedData.pageCount, 1);
    assert.equal(searchedData.results.length, 4);
    assert.equal(searchedData.results[0].name, 'hippo');
    assert.equal(searchedData.results[1].name, 'hippo_gray');
    assert.equal(searchedData.results[2].name, 'hippo_square');
    assert.equal(searchedData.results[3].name, 'hippo_token');
  });

  it('searchAssets searches the animation library without a category', function() {
    const maxResults = 5;
    const pageCount = 0;
    const searchedData = searchAssets(
      'hip',
      '',
      animationLibrary,
      pageCount,
      maxResults
    );

    assert.equal(searchedData.pageCount, 1);
    assert.equal(searchedData.results.length, 4);
    assert.equal(searchedData.results[0].name, 'hippo');
    assert.equal(searchedData.results[1].name, 'hippo_gray');
    assert.equal(searchedData.results[2].name, 'hippo_square');
    assert.equal(searchedData.results[3].name, 'hippo_token');
  });

  it('searchAssets searches the sound library with a cateogry', function() {
    const maxResults = 5;
    const pageCount = 0;
    const searchedData = searchAssets(
      'click',
      'category_objects',
      soundLibrary,
      pageCount,
      maxResults
    );

    assert.equal(searchedData.pageCount, 1);
    assert.equal(searchedData.results.length, 2);
    assert.equal(searchedData.results[0].name, 'click');
    assert.equal(searchedData.results[1].name, 'metal_click');
  });

  it('searchAssets finds results where search term is not at the begining', function() {
    const maxResults = 5;
    const pageCount = 0;
    const searchedData = searchAssets(
      'square',
      '',
      animationLibrary,
      pageCount,
      maxResults
    );

    assert.equal(searchedData.results.length, 5);
    assert.equal(searchedData.results[0].name, 'elephant_square');
    assert.equal(searchedData.results[1].name, 'giraffe_square');
    assert.equal(searchedData.results[2].name, 'hippo_square');
    assert.equal(searchedData.results[3].name, 'monkey_square');
    assert.equal(searchedData.results[4].name, 'panda_square');
  });

  it('searchAssets searches the sound library without a cateogry, using multiple pages', function() {
    const maxResults = 1;
    const pageCount = 0;
    const searchedData = searchAssets(
      'click',
      '',
      soundLibrary,
      pageCount,
      maxResults
    );

    assert.equal(searchedData.pageCount, 407);
    assert.equal(searchedData.results.length, 1);
    assert.equal(
      searchedData.results[0].name,
      'lighthearted_bonus_objective_1'
    );
  });

  it('searchAssets searches the sound library getting page 2 results', function() {
    const maxResults = 1;
    const pageCount = 1;
    const searchedData = searchAssets(
      'click',
      '',
      soundLibrary,
      pageCount,
      maxResults
    );

    assert.equal(searchedData.pageCount, 407);
    assert.equal(searchedData.results.length, 1);
    assert.equal(
      searchedData.results[0].name,
      'lighthearted_bonus_objective_2'
    );
  });
});
