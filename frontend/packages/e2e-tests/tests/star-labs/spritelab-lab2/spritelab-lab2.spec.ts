import {expect, test} from '../../fixtures';
import {fakeImageGeneration} from '../../shared/fake-image-generation';

import {SpriteLab2} from './spritelab-lab2';

/**
 * Plays the ui-test-spritelab-lab2 unit through as one student: a character
 * made from words and rated, set as the player and steered, a world built
 * from blocks, a jump to a second scene, and free play at the end. The image
 * cache and the AI gateway are faked, so every picture is the same one and
 * nothing leaves the box.
 */
test.describe('Sprite Lab in Lab2 unit', () => {
  test('a student plays the unit through', async ({page, signInAsNewUser}) => {
    test.setTimeout(180_000);
    await signInAsNewUser({type: 'student', name: 'spritelab'});
    const lab = new SpriteLab2(page);
    const pictures = await fakeImageGeneration(page);

    // Level 1: a character from words, kept and rated.
    await lab.gotoUnitLevel(1);
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

    // Level 2: set as player under when run, then run.
    await lab.waitForReady();
    await expect(lab.placeholder).toBeVisible();
    await lab.dragFlyoutBlockTo('as player', lab.placeholder);
    await lab.expectObjectiveDone('set as player');
    await lab.run();
    await lab.steerUntilDone('Right', 'arrow keys');
    await lab.continueButton.click();

    // Level 3: a block on the world grid, then run. Its first step needs an
    // object picture, made on a level this unit leaves out, so Continue never
    // unlocks; the test goes to level 4 by its address.
    await lab.waitForReady();
    await expect(lab.worldGrid).toBeVisible();
    await lab.itemsToPlace
      .getByRole('radio', {name: /block$/})
      .first()
      .click();
    await lab.worldGrid.getByRole('gridcell').nth(45).click();
    await lab.expectObjectiveDone('Add blocks');
    await lab.run();
    await lab.gotoUnitLevel(4);

    // Level 4: go to the second scene. The level asks for go to scene under
    // a when touches event, built on levels this unit leaves out, so that
    // step stays undone and the test moves on by address. Under when run,
    // the game reaches Scene 2 as soon as it runs, which completes the other
    // step.
    await lab.dragFlyoutBlockUnder('go to scene', 'when run');
    await lab.run();
    await lab.expectObjectiveDone('Scene 2');
    await lab.gotoUnitLevel(5);

    // Level 5: free play offers every editor.
    for (const editor of ['Images', 'World', 'Code'] as const) {
      await expect(lab.editorButton(editor)).toBeVisible();
    }
  });
});
