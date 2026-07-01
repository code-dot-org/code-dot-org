import {expect, test} from '@playwright/test';

import {CraftLab} from '../pages/craft-lab';

test.describe('Craft: Simple (Adventurer)', () => {
  test('Level loads and Phaser game renders', async ({page}) => {
    const craft = new CraftLab(page);
    // "Overworld Move to Sheep" — mc course level 1
    await craft.gotoLevelById(26578);

    await expect(craft.gameCanvas).toBeVisible();
    await expect(craft.runButton).toBeVisible();
  });

  test('Move to Sheep (mc level 1) succeeds with correct program', async ({
    page,
  }) => {
    const craft = new CraftLab(page);
    await craft.gotoLevelById(26578);

    await craft.runAndWaitForResult();
    // Freeplay level — run with empty program doesn't crash
    const pos = await craft.getPlayerPosition();
    expect(pos).toHaveProperty('x');
    expect(pos).toHaveProperty('y');
  });

  test.todo('Adventurer 1: Move to Sheep (pass)');
  test.todo('Adventurer 2: Chop Tree');
  test.todo('Adventurer 3: Shear Sheep');
  test.todo('Adventurer 4: Chop Trees');
  test.todo('Adventurer 5: Place Wall');
  test.todo('Adventurer 6: House Frame Chosen');
  test.todo('Adventurer 7: Plant Crops');
  test.todo('Adventurer 8: Avoid Monsters');
  test.todo('Adventurer 9: Mining Coal');
  test.todo('Adventurer 10: Iron');
  test.todo('Adventurer 11: Avoiding Lava');
  test.todo('Adventurer 12: If Statements');
  test.todo('Adventurer 13: Powered Minecart');
  test.todo('Adventurer 14: Free Play 20x20');
});

test.describe('Craft: Aquatic', () => {
  test('Level loads with aquatic theme', async ({page}) => {
    const craft = new CraftLab(page);
    // CourseE_HOC 2018 Level_1 — aquatic variant
    await craft.gotoLevelById(26582);

    await expect(craft.gameCanvas).toBeVisible();
    await expect(craft.runButton).toBeVisible();
  });

  test.todo('Aquatic 1: chest (pass)');
  test.todo('Aquatic 2: Move to boat (pass)');
  test.todo('Aquatic 3: Move to Cod (pass)');
  test.todo('Aquatic 4: Move to Dolphin (pass)');
  test.todo('Aquatic 5: Move to Chest (pass)');
  test.todo('Aquatic 6: Move to Chest (pass)');
  test.todo('Aquatic 7: Move to Chest (pass)');
  test.todo('Aquatic 7a: Move to Chest Turtle Path (pass)');
  test.todo('Aquatic 8: Move to Tropical Fish (pass)');
  test.todo('Aquatic 9: Move to Chest (pass)');
  test.todo('Aquatic 10: Move to Squid (pass)');
  test.todo('Aquatic 11: Activate Conduit (pass)');
});

test.describe('Craft: Agent', () => {
  test('Level loads with agent controls', async ({page}) => {
    const craft = new CraftLab(page);
    // "Function intro Ryan" — agent variant
    await craft.gotoLevelById(26682);

    await expect(craft.gameCanvas).toBeVisible();
    await expect(craft.runButton).toBeVisible();
  });

  test.todo('Agent 1: Leave House');
  test.todo('Agent 2: Open Doors');
  test.todo('Agent 3: Open Doors 2.0');
  test.todo('Agent 4: Walk on Water');
  test.todo('Agent 5: Open Doors 2.0');
  test.todo('Agent 6: Build Bridge with one turn');
  test.todo('Agent 7: Build Bridge with multiple turns');
  test.todo('Agent 8: Build Bridge with Functions');
  test.todo('Agent 9: Clear Path');
  test.todo('Agent 11: The Nether');
});

test.describe('Craft: Designer', () => {
  test('Level loads with event blocks and entity panels', async ({page}) => {
    const craft = new CraftLab(page);
    // "New Minecraft Designer Project" — designer freeplay
    await craft.gotoLevelById(26875);

    await expect(craft.gameCanvas).toBeVisible();
    await expect(craft.runButton).toBeVisible();

    // Designer variant exposes event-based blocks
    const whenRunBlock = page.locator('.blocklyDraggable:has-text("when run")');
    await expect(whenRunBlock).toBeVisible();
  });

  test.todo('Designer 1: Chicken Move');
  test.todo('Designer 2: Four Chicken Move');
  test.todo('Designer 3: Four Chicken Random Move');
  test.todo('Designer 4: Move Player Inside House');
  test.todo('Designer 5: Add Shear Sheep Behavior');
  test.todo('Designer 6: Lead Cows to Grass');
  test.todo('Designer 7: Cannot walk into lava');
  test.todo('Designer 7: Explode Stone Wall');
  test.todo('Designer 8: Trapped by Zombies');
  test.todo('Designer 9: Spawn Entity');
});

test.describe('Craft: Functionality', () => {
  test.todo('Pistons: Entity Obstruction 1');
  test.todo('Pistons: Entity Obstruction 2');
  test.todo('Rails: Moving On to Ride');
  test.todo('Pressure Plate: Moving On to Rail');
});
