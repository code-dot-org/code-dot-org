/** @file Test of searchAssetsTest.js. */

import {searchAssets} from '@cdo/apps/code-studio/assets/searchAssets';
import soundLibrary from '@cdo/apps/code-studio/soundLibrary.json';

import testAnimationLibrary from '../p5lab/testAnimationLibrary.json';

describe('search assets from animation library', function () {
  it('searchAssets searches the animation library in a category', function () {
    const maxResults = 5;
    const pageCount = 0;
    const searchedData = searchAssets(
      'hip',
      'animals',
      testAnimationLibrary,
      pageCount,
      maxResults
    );

    expect(searchedData.pageCount).toEqual(1);
    expect(searchedData.results.length).toEqual(4);
    expect(searchedData.results[0].name).toEqual('hippo');
    expect(searchedData.results[1].name).toEqual('hippo_gray');
    expect(searchedData.results[2].name).toEqual('hippo_square');
    expect(searchedData.results[3].name).toEqual('hippo_token');
  });

  it('searchAssets searches the animation library without a category', function () {
    const maxResults = 5;
    const pageCount = 0;
    const searchedData = searchAssets(
      'hip',
      '',
      testAnimationLibrary,
      pageCount,
      maxResults
    );

    expect(searchedData.pageCount).toEqual(1);
    expect(searchedData.results.length).toEqual(5);
    expect(searchedData.results[0].name).toEqual('hippo');
    expect(searchedData.results[1].name).toEqual('hippo_gray');
    expect(searchedData.results[2].name).toEqual('hippo_square');
    expect(searchedData.results[3].name).toEqual('hippo_token');
    expect(searchedData.results[4].name).toEqual('hip');
  });

  it('searchAssets searches the sound library with a cateogry', function () {
    const maxResults = 5;
    const pageCount = 0;
    const searchedData = searchAssets(
      'click',
      'objects',
      soundLibrary,
      pageCount,
      maxResults
    );

    expect(searchedData.pageCount).toEqual(1);
    expect(searchedData.results.length).toEqual(2);
    expect(searchedData.results[0].name).toEqual('click');
    expect(searchedData.results[1].name).toEqual('metal_click');
  });

  it('searchAssets finds results where search term is not at the begining', function () {
    const maxResults = 5;
    const pageCount = 0;
    const searchedData = searchAssets(
      'square',
      '',
      testAnimationLibrary,
      pageCount,
      maxResults
    );

    expect(searchedData.results.length).toEqual(5);
    expect(searchedData.results[0].name).toEqual('elephant_square');
    expect(searchedData.results[1].name).toEqual('giraffe_square');
    expect(searchedData.results[2].name).toEqual('hippo_square');
    expect(searchedData.results[3].name).toEqual('monkey_square');
    expect(searchedData.results[4].name).toEqual('panda_square');
  });

  it('searchAssets searches the sound library without a cateogry, using multiple pages', function () {
    const maxResults = 1;
    const pageCount = 0;
    const searchedData = searchAssets(
      'click',
      '',
      soundLibrary,
      pageCount,
      maxResults
    );

    expect(searchedData.pageCount).toEqual(407);
    expect(searchedData.results.length).toEqual(1);
    expect(searchedData.results[0].name).toEqual(
      'lighthearted_bonus_objective_1'
    );
  });

  it('searchAssets searches the sound library getting page 2 results', function () {
    const maxResults = 1;
    const pageCount = 1;
    const searchedData = searchAssets(
      'click',
      '',
      soundLibrary,
      pageCount,
      maxResults
    );

    expect(searchedData.pageCount).toEqual(407);
    expect(searchedData.results.length).toEqual(1);
    expect(searchedData.results[0].name).toEqual(
      'lighthearted_bonus_objective_2'
    );
  });

  it('can search non-latin characters', function () {
    const maxResults = 3;
    const pageCount = 0;

    var searchedData = searchAssets(
      'медведь',
      '',
      testAnimationLibrary,
      pageCount,
      maxResults
    );
    expect(searchedData.results.length).toEqual(2);

    searchedData = searchAssets(
      'медведь с рыбой',
      '',
      testAnimationLibrary,
      pageCount,
      maxResults
    );
    expect(searchedData.results.length).toEqual(1);
  });
});
