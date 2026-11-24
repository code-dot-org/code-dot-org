import {expect, test} from '../../fixtures';
import {fakeImageGeneration} from '../../shared/fake-image-generation';

import {SpriteLab2} from './spritelab-lab2';

/**
 * Plays the ui-test-spritelab-lab2 unit through as one student, finishing
 * every level's checklist: the demo, a character, the player, an object, a
 * world, a touch event, a friend, a second touch event, a jump to a second
 * scene, and free play. The image cache and the AI gateway are faked, so
 * every picture is the same one and nothing leaves the box.
 */
test.describe('Sprite Lab in Lab2 unit', () => {
  test('a student plays the unit through', async ({page, signInAsNewUser}) => {
    test.setTimeout(300_000);
    await signInAsNewUser({type: 'student', name: 'spritelab'});
    const lab = new SpriteLab2(page);
    const pictures = await fakeImageGeneration(page);

    // Level 1: the demo opens straight into its game, with no editors;
    // reaching the crystal takes a run to the right with jumps up the ledges.
    await lab.gotoUnitLevel(1);
    await lab.steerWithKeysUntilDone('crystal', {jump: true});
    await lab.continueButton.click();

    // Level 2: a character from words, kept and rated.
    await lab.waitForReady();
    await expect(lab.imagesTab).toBeVisible();
    await lab.newImageButton.click();
    await page.getByRole('menuitem', {name: 'Character'}).click();
    await lab.word('cat').click();
    await lab.animatedSwitch.uncheck();
    await lab.generateButton.click();
    await lab.readLearningStory();
    await expect(lab.goodButton).toBeVisible({timeout: 30_000});
    expect(pictures()).toBeGreaterThan(0);
    await lab.goodButton.click();
    await page.getByRole('button', {name: 'Done'}).click();
    await lab.expectObjectiveDone('Evaluate');
    await lab.continueButton.click();

    // Level 3: set as player under when run, then run, steered with the
    // on-screen controls.
    await lab.waitForReady();
    await expect(lab.placeholder).toBeVisible();
    await lab.dragFlyoutBlockTo('as player', lab.placeholder);
    await lab.expectObjectiveDone('set as player');
    await lab.run();
    await lab.steerUntilDone('Right', 'arrow keys');
    await lab.continueButton.click();

    // Level 4: an object from words.
    await lab.waitForReady();
    await lab.newImageButton.click();
    await page.getByRole('menuitem', {name: 'Object'}).click();
    await lab.firstWordChoice.click();
    await lab.generateButton.click();
    await lab.expectObjectiveDone('new object', {timeout: 30_000});
    await lab.continueButton.click();

    // Level 5: the object and a block placed on the world grid, then a run
    // to the object.
    await lab.waitForReady();
    await expect(lab.worldGrid).toBeVisible();
    await lab.placeInWorld(lab.spriteToPlace(2), lab.floorCell(3));
    await lab.expectObjectiveDone('place your object');
    await lab.placeInWorld(
      lab.blockToPlace,
      lab.worldGrid.getByRole('gridcell').nth(9),
    );
    await lab.expectObjectiveDone('Add blocks');
    await lab.run();
    await lab.steerWithKeysUntilDone('jump to your object');
    await lab.continueButton.click();

    // Level 6: a block under when touches for the object, then a run to it.
    await lab.waitForReady();
    await lab.dragFlyoutBlockTo('say', lab.placeholder);
    await lab.expectObjectiveDone('when touches');
    await lab.run();
    await lab.steerWithKeysUntilDone('jump to your object');
    await lab.continueButton.click();

    // Level 7: a friend from words, placed on the world grid past the
    // object.
    await lab.waitForReady();
    await lab.newImageButton.click();
    await page.getByRole('menuitem', {name: 'Character'}).click();
    await lab.word('dog').click();
    await lab.generateButton.click();
    await lab.expectObjectiveDone('new character', {timeout: 30_000});
    await lab.editorButton('World').click();
    await lab.placeInWorld(lab.spriteToPlace(3), lab.floorCell(6));
    await lab.expectObjectiveDone('copies');
    await lab.continueButton.click();

    // Level 8: a block under when player touches character, then a run to
    // the friend.
    await lab.waitForReady();
    await lab.dragFlyoutBlockTo('say', lab.placeholder);
    await lab.expectObjectiveDone('when player touches');
    await lab.run();
    await lab.steerWithKeysUntilDone('go meet them');
    await lab.continueButton.click();

    // Level 9: go to scene under the touches event for the object, then a
    // run that touches the object and reaches Scene 2.
    await lab.waitForReady();
    await lab.dragFlyoutBlockTo('go to scene', lab.placeholder);
    await lab.expectObjectiveDone('go to scene');
    await lab.run();
    await lab.steerWithKeysUntilDone('Scene 2');
    await lab.continueButton.click();

    // Level 10: free play offers every editor.
    await lab.waitForReady();
    for (const editor of ['Images', 'World', 'Code'] as const) {
      await expect(lab.editorButton(editor)).toBeVisible();
    }
  });
});
