# Mainline Blockly Manual Testing
Whenever the mainline `blockly` package version is being upgraded or updates are added that impact Google Blockly labs, manual testing should be included to ensure there are no regressions or issues with the version bump or update.

The following is a manual test checklist to follow and is not exhaustive. The estimated time to complete the following checklist is 15-20 minutes.

# For All Mainline Blockly Labs
Currently, the mainline Blockly labs are: Dance, Poetry, Music, Flappy, Bounce.
- Page loads - check for errors and unexpected warnings in console - keep console open throughout manual testing process. Look out for deprecation warnings.
- Context menu works.
    - Right-click anywhere on workspace to open context menu menu (Paste, Undo, Redo, Enable Keyboard Navigation, Turn on dark mode, Modern Theme, Enable High Contrast Theme, etc).
    - Right-click on a block to open a different context menu (Copy, Duplicate, Collapse Block, Disable Block, Delete Block).
- The different themes are rendered properly (Modern, High Contrast, Protanopia, Deuteranopia, Tritanopia, and each of these can be combined with dark mode). There are 10 different themes in all.
    - In particular, check High Contrast since font size changes and pay particular attention to custom fields such as the location picker field in the 'make new_sprite at_' in Poetry Lab or the patterns field in the 'play drums' block in music lab.
- Drag any block from toolbox. Block connects to other blocks. When you delete the block, the trashcan animates. Note that custom fields to look at for are included in specific lab sections below.
- Click on the 'Show Code' button and confirm generated code looks correct (modal).
- Click and drag a block to replace a ['shadow block'](https://developers.google.com/blockly/guides/configure/web/toolbox#shadow_blocks). Then remove the block and the shadow block is displayed.
- Drag blocks to different locations in workspace, save the program by clicking on 'Run', then refresh the browser. The blocks appear with their x/y positions maintained.
- Drag blocks to workspace but don't attach blocks to the program. When the program is run, an svg frame should surround unused blocks.
- When unused blocks are dragged to a different location in workspace, the svg frame should be removed. The svg frame appears around unused blocks when the program is run.

# Dance Lab
Create a new Dance Lab project: [[local]](http://localhost-studio.code.org:3000/projects/dance/new) [[production]](https://studio.code.org/projects/dance/new)
- Check blocks that contain different types of fields such as dropdown menus, text inputs and number inputs.
- Check blocks that contain multiple fields, for example,  '_alternate every_measures_between_and_'.
- 'set background color' block should have a field that when click displays a 7x10 color grid while the 'set all tint' block's grid is 3x3.
    - The block has a shadow block so that the color picking block cannot be removed, but another block (e.g., `random color`) can be placed over the color picking block.
- Check functions. Compare with function definition blocks on production.
    - Once you create a drag out a function definition block, a 'do something' block should appear in Toolbox under 'Functions'. Once the function definition is removed from workspace, the 'do something' block should also be removed.
    - Function definition blocks also have a gray SVG frame surrounding them.
- Go to this Dance Party level: [[local]](http://localhost-studio.code.org:3000/s/dance-2019/lessons/1/levels/1) [[production]](https://studio.code.org/s/dance-2019/lessons/1/levels/1).
Check the block in the toolbox, in particular, that the dropdown field for type of dancer has only 2 options. Then click and drag a block to workspace and check the two dropdown menus again to see if the options and value are correctly displayed.

# Flappy
Create a new Flappy project: [[local]](http://localhost-studio.code.org:3000/projects/flappy/new) [[production]](https://studio.code.org/projects/flappy/new)
- Event blocks, for example, 'when hit the ground', have fixed x/y position for blocks on workspace.

# Bounce and related skins
Create a new Bounce project: [[local_bounce]](http://localhost-studio.code.org:3000/projects/bounce/new) [[production_bounce]](https://studio.code.org/projects/bounce/new)

Create a new Basketball project: [[local_basketball]](http://localhost-studio.code.org:3000/projects/basketball/new) [[production_basketball]](https://studio.code.org/projects/basketball/new)

Create a new Sports project: [[local_sports]](http://localhost-studio.code.org:3000/projects/sports/new) [[production_sports]](https://studio.code.org/projects/sports/new)
- Has 'skins' that are very similar - Sports and Basketball projects.
- In Basketball, the 'set hand' block has 3 hands.
- In Sports, the 'set player' block has 3 hands + 2 items.

# Poetry
Create a new Poetry project: [[local_poetry]](http://localhost-studio.code.org:3000/projects/poetry/new) [[production_poetry]](https://studio.code.org/projects/poetry/new)

Create a new Poetry HOC project: [[local_poetry_hoc]](http://localhost-studio.code.org:3000/projects/poetry_hoc/new) [[production_poetry_hoc]](https://studio.code.org/projects/poetry_hoc/new)
- Check 2 versions of Poetry lab - poetry and poetry_hoc
- Check shadow blocks, for example, 'set title' block. Most blocks that accept text have shadow blocks. You will have to remove an actual block that is covering the shadow block to see the shadow block.
- Check variables - variable picker (purple block with '???') with customized options - look for custom modals to rename variables.
- Under 'Effects', check the 'set background to' block. Its dropdown field is grid and includes a 'More' link. When 'More is clicked, modal opens to choose background to add to assets. Note that in July 2023, the 'More' button will change to 'Backgrounds'.
- Check 'make new_sprite at_' block.
    - Click on the animation dropdown, then click on Costumes button which should take you to Costumes tab.
    - Click on location field, then confirm you can select new location of animation.


# Music Lab
Create a new Music Lab project: [[local]](http://localhost-studio.code.org:3000/projects/music/new) [[production]](https://studio.code.org/projects/music/new)
- Note that functions in music lab DO NOT have svg frames - check that function call ('do something') is added to toolbox once a function is defined.
- Check the three Play blocks which contain customized fields - fieldSounds, fieldChords, and fieldPattern.

# Pools
Check pools for Dancelab, Poetry at [[local]](http://localhost-studio.code.org:3000/pools) [[levelbuilder]](https://levelbuilder-studio.code.org/pools)
- Click on Dancelab and Poetry pools
    - Scroll down each pool page and make sure all blocks are rendered.
- Check at least one block link under 'Edit an existing block'. You should see a read-only workspace for each block - config and generated code.
- To be able to click on a block edit link, you need levelbuilder permission. Instructions to add levelbuilder permissions - [[local]](https://docs.google.com/presentation/d/1mEcbvOkACycBl9-yj5O8YoE6a7LuuinG4iYg0AWKgnc/edit#slide=id.g1029aa55fcd_0_28) [[levelbuilder]](https://docs.google.com/presentation/d/1mEcbvOkACycBl9-yj5O8YoE6a7LuuinG4iYg0AWKgnc/edit#slide=id.g1029aa55fcd_0_37)

# Instructions in Levels
When checking levels below that include blocks, check the instructions in a RTL language as well. Using language dropdown at bottom left corner of page, select the first language in dropdown which is RTL.

Check that blocks are rendered as expected and check with different themes.

- First level of dance lab: [[local]](http://localhost-studio.code.org:3000/s/dance-2019/lessons/1/levels/1) [[production]](https://studio.code.org/s/dance-2019/lessons/1/levels/1)
    - This level includes embedded blocks in instructions.
- First level in poem art: [[local]](http://localhost-studio.code.org:3000/s/poem-art-2021/lessons/1/levels/1) [[production]](https://studio.code.org/s/poem-art-2021/lessons/1/levels/1)
    - This level includes blocks in hint
- First level in flappy: [[local]](http://localhost-studio.code.org:3000/s/flappy/1) [[production]](https://studio.code.org/s/flappy/1)
    - First fail the level, then you should get a hint which includes a block.
