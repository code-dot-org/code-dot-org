# Sprite Lab in Lab2 level settings (level_config)

<!-- Generated from the zod schema. Do not edit by hand; see the test that writes it. -->

A Sprite Lab in Lab2 level stores its settings in one property,
`level_config`, inside the level file's `properties`. The schema is
`apps/src/p5lab/spritelab/lab2/levelConfig/schema.ts`.

A level that sets nothing (`{}`) is plain Sprite Lab: the Code tab and the
game, one scene, no World tab. Each feature is a group the level adds, and
the group's settings exist only inside it: `images` turns on the Images
tab, `world` the World tab, and `scenes`, `blocks`, `objectives`,
`callouts` and `instructions` their own features. A group with nothing
in it (`{}`) turns the feature on with its defaults. Leave out everything
a level does not need.

Some settings are kept outside `level_config`, as other level properties:
the toolbox (`toolbox_definition`), the instructions text
(`long_instructions`), the starting project (`start_sources` or a project
template), and Lab2's own properties.

## Settings

- `focus` (one of `code`, `images`, `world`, `play`; optional): Opens on. Where the level opens. Code when not set.
- `edits` (list; each item: one of `code`, `images`, `world`; optional): Student can change. Turns on: Limit what the student can change. Code, and the Images and World tabs the level turns on, when not set.
- `images` (group; optional): Images. Turns on: Images tab. The student works with images on the Images tab.
  - `makes` (group; optional): The image this level makes. Turns on: This level makes an image. The student makes one image of a set type, which the level records with a role.
    - `type` (one of `sprite`, `background`, `block`; required): Type. The kind of image the student makes on this level.
    - `subject` (one of `character`, `object`; optional): Subject. For a sprite: a character can be animated, an object is one still picture. Character when not set.
    - `role` (text; optional): Role. A name recorded on the image, such as "hero". Later levels use it to find this image.
  - `makeFirst` (true or false; optional): Make the image first. The level opens on the Images tab to make its image, then goes on to where it opens.
  - `onlyThisImage` (true or false; optional): Only this image. The student sees only the image this level makes, with no adding or deleting.
  - `canAdd` (true or false; optional; default true): Can add images.
  - `canDelete` (true or false; optional; default true): Can delete images. Turn off when a later level depends on an image made earlier.
  - `kinds` (list; each item: one of `sprite`, `background`, `block`; optional): Kinds listed. The kinds of image the tab lists. Every kind when not set.
  - `paintTools` (one of `all`, `limited`; optional): Paint tools. Limited is a fixed set of colors and one brush, for a level that is not about painting. All when not set.
  - `generationLimit` (number; optional): Generation limit. How many pictures the student can generate in one visit. No limit when not set.
  - `explainAi` (true or false; optional): Explain how AI made it. After the first picture made in a visit, the level offers the story of how AI made it.
  - `upload` (true or false; optional): Upload. The student can upload an image.
  - `source` (one of `cached`, `live`; optional): Picture source. Cached pictures come from the published set; live asks the model, for levelbuilders only. Cached when not set.
  - `starters` (list; optional): Starter images. Images the level gives the project on arrival, when it has none of that name or role yet.
    - each item (Starter image):
      - `name` (text; required): Name.
      - `imageType` (one of `sprite`, `background`, `block`; required): Type.
      - `role` (text; optional): Role.
      - `src` (text; required): Picture URL.
      - `frameSize` (group; required): Size in pixels.
        - `x` (number; required): Width.
        - `y` (number; required): Height.
      - `pixelGridSize` (number; optional): Pixel size. For pixel art: the size of one drawn pixel in the file, so previews upscale it with hard edges.
- `world` (group; optional): World. Turns on: World tab. The student places images on a grid on the World tab.
  - `palette` (list of names; optional): Palette roles. The roles of the images the student can place. The level's own image when not set.
  - `keepsOneOf` (list of names; optional): Keeps at least one of. For each of these roles, the last square showing it cannot be erased until another is placed.
- `scenes` (group; optional): Scenes. Turns on: Scenes. The level sets up scenes, or lets the student make their own.
  - `starting` (list; optional): Scenes the level sets up. The level makes sure the project has these. The first is the scene the level opens, and the student is kept to these.
    - each item (Scene):
      - `id` (text; required): Id. What the go to scene block stores. "scene-1" is the scene every project starts with.
      - `name` (text; required): Name. What the student sees, when the level creates the scene.
      - `code` (JSON; optional): Starting code. The scene's code when the level creates it.
      - `world` (group; optional): Premade world. Turns on: The scene starts with a premade world.
        - `pattern` (list; each item: text; required): Pattern. One line for each row, the floor last. B is a block, S is the player, and a dot is empty.
        - `roles` (map to text; optional): Pattern letters. More letters, each standing for the newest sprite with a role, such as F for "friend".
      - `editable` (true or false; optional): Student can open it. For a second scene: the student can open it in the editor.
  - `canChange` (true or false; optional): Student can change scenes. The student can add, rename, reorder and delete scenes.
- `blocks` (group; optional): Code scaffolding. Turns on: Code scaffolding. Blocks the level adds or locks, the block catalog, and where dropdowns start.
  - `addOnArrival` (list; optional): Blocks added on arrival. Added to the first scene when the student arrives, if it has none of that kind.
    - each item (Block):
      - shape: A placeholder under a stack
        - `attachTo` (name, one of the names the editor page supplies as "toolboxBlockTypes"; required): Under the stack whose top block is.
        - `data` (name, a name found at "blocks.addOnArrival.*.data" in the settings; optional): Tag. The top block's tag, when one stack of the type is meant.
        - `shadow` (JSON; required): Placeholder block.
      - shape: Empty room under a stack
        - `attachTo` (name, one of the names the editor page supplies as "toolboxBlockTypes"; required): Under the stack whose top block is.
        - `data` (name, a name found at "blocks.addOnArrival.*.data" in the settings; optional): Tag.
        - `room` (group; required): Room.
          - `type` (name, one of the names the editor page supplies as "toolboxBlockTypes"; required): Room for a block of type.
      - shape: A new stack
  - `lockEarlier` (true or false; optional): Lock earlier blocks. Blocks built on earlier levels cannot be deleted here.
  - `catalog` (true or false; optional): Block catalog. New blocks start out of the toolbox, and the student adds them from Discover blocks.
  - `alwaysInToolbox` (list of names, each one of the names the editor page supplies as "toolboxBlockTypes"; optional): Always in the toolbox. With the catalog: blocks that are in the toolbox from the start.
  - `dropdownsStartOn` (map to one of the shapes below; optional): Dropdowns start on. The role each image dropdown starts on, by image kind (sprite, background, block) or by block type.
- `objectives` (group; optional): Checklist. Turns on: Checklist. Steps the student does before they can continue.
  - `title` (markdown text; optional): Title.
  - `steps` (list; optional): Steps. The student continues once every step is done. With no steps they can continue from the start.
    - each item (Step):
      - `text` (markdown text; required): Text.
      - `check` (one of the shapes below; required): Done when.
        - `kind: "image"`: Made an image
          - `imageType` (one of `sprite`, `background`, `block`; required): Type.
        - `kind: "generated"`: Generated a picture
          - `imageType` (one of `sprite`, `background`, `block`; optional): Type. Any type when not set.
        - `kind: "block"`: Uses a block
          - `type` (name, one of the names the editor page supplies as "toolboxBlockTypes"; required): Block type. One block type, or any of several.
            - shape
            - shape
          - `under` (name, one of the names the editor page supplies as "toolboxBlockTypes"; optional): Under a top block of type.
          - `data` (name, a name found at "blocks.addOnArrival.*.data" in the settings; optional): Under the stack tagged. The tag of a stack the level adds.
          - `fields` (map to text; optional): Field values.
          - `scene` (name, a name found at "scenes.starting.*.id" in the settings; optional): In scene. The open scene when not set.
        - `kind: "world"`: Placed in the world
          - `role` (text; optional): Shows an image with role.
          - `changed` (true or false; optional): Changed from the start.
        - `kind: "play"`: Pressed Run
        - `kind: "reach"`: Player reached
          - `role` (text; optional): Touched a sprite with role.
          - `moved` (true or false; optional): Moved or jumped.
        - `kind: "scene"`: Got to a scene
          - `id` (name, a name found at "scenes.starting.*.id" in the settings; required): Scene.
        - `kind: "editing"`: Opened a scene
          - `id` (name, a name found at "scenes.starting.*.id" in the settings; required): Scene.
        - `kind: "rated"`: Rated a picture
      - `shownWhen` (one of the shapes below; optional): Hidden until. Turns on: Hide this step until something is done.
        - `kind: "image"`: Made an image
          - `imageType` (one of `sprite`, `background`, `block`; required): Type.
        - `kind: "generated"`: Generated a picture
          - `imageType` (one of `sprite`, `background`, `block`; optional): Type. Any type when not set.
        - `kind: "block"`: Uses a block
          - `type` (name, one of the names the editor page supplies as "toolboxBlockTypes"; required): Block type. One block type, or any of several.
            - shape
            - shape
          - `under` (name, one of the names the editor page supplies as "toolboxBlockTypes"; optional): Under a top block of type.
          - `data` (name, a name found at "blocks.addOnArrival.*.data" in the settings; optional): Under the stack tagged. The tag of a stack the level adds.
          - `fields` (map to text; optional): Field values.
          - `scene` (name, a name found at "scenes.starting.*.id" in the settings; optional): In scene. The open scene when not set.
        - `kind: "world"`: Placed in the world
          - `role` (text; optional): Shows an image with role.
          - `changed` (true or false; optional): Changed from the start.
        - `kind: "play"`: Pressed Run
        - `kind: "reach"`: Player reached
          - `role` (text; optional): Touched a sprite with role.
          - `moved` (true or false; optional): Moved or jumped.
        - `kind: "scene"`: Got to a scene
          - `id` (name, a name found at "scenes.starting.*.id" in the settings; required): Scene.
        - `kind: "editing"`: Opened a scene
          - `id` (name, a name found at "scenes.starting.*.id" in the settings; required): Scene.
        - `kind: "rated"`: Rated a picture
      - `id` (text; optional): Id. Names the step to the lab's hover and click handling.
  - `collapsedText` (text; optional): Collapsed text. A short line that stays in view when the steps are collapsed.
- `callouts` (list; optional): Callouts. Turns on: Callouts. Bouncing arrows at the tabs, the scene menu or Continue. The first one whose condition holds is shown.
  - each item (Callout):
    - `target` (one of `images-tab`, `world-tab`, `code-tab`, `scene-menu`, `scene-option`, `continue-button`; required): Points at.
    - `scene` (name, a name found at "scenes.starting.*.id" in the settings; optional): Scene. For a scene-option target.
    - `direction` (one of `up`, `down`, `left`; optional): Arrow direction. Up when not set.
    - `fallback` (group; optional): While the target is hidden. Turns on: Point somewhere else while the target is not on the page.
      - `target` (one of `images-tab`, `world-tab`, `code-tab`, `scene-menu`, `scene-option`, `continue-button`; required): Points at.
      - `scene` (name, a name found at "scenes.starting.*.id" in the settings; optional): Scene. For a scene-option target.
      - `direction` (one of `up`, `down`, `left`; optional): Arrow direction. Up when not set.
    - `when` (group; optional): Shown when. Turns on: Only show it at certain times.
      - `done` (list of names, each a name found at "objectives.steps.*" in the settings; optional): After steps. Checklist steps that must be done.
      - `notDone` (list of names, each a name found at "objectives.steps.*" in the settings; optional): Until steps. Checklist steps that must not be done yet.
      - `tabNot` (one of `Code`, `Images`, `World`, `Play`; optional): While not on tab.
      - `sceneNot` (name, a name found at "scenes.starting.*.id" in the settings; optional): While not on scene.
- `noProject` (true or false; optional): No project. The level runs with no project: the student sees the level's own content, and nothing they do is saved. For a demo to play.
- `instructions` (group; optional): Instructions. Turns on: Instructions options.
  - `startCollapsed` (true or false; optional): Start collapsed. The instructions panel starts collapsed to its tab.
  - `freePlayIntro` (true or false; optional): Free play intro. The intro dialog opens the first time the student arrives.

## Rules

- A level opens on `focus`, which is `code` when not set. Unless it is `play`, the student must be able to change that part.
- Without `edits`, the student can change the code, plus images when `images` is set and the world when `world` is set. `edits` limits that list; it can name `images` only with `images` set, and `world` only with `world` set.
- A level that edits only images shows the Images tab alone; a level with `focus: "play"` and `edits: []` shows only the game.
- `images.makes.subject` is for a sprite only.
- A level that sets up scenes (`scenes.starting`) keeps the student to them, so it cannot also set `scenes.canChange`. The first starting scene is always the one the student edits, so it does not set `editable`.
- Names that refer to other settings must match them: a checklist check or callout names a scene by its id in `scenes.starting`, a callout names checklist steps by their position from 0, and a tag names the `data` of a block in `blocks.addOnArrival`.
- Roles (such as "hero" or "treasure") are names an image level records on the image it makes (`images.makes.role`); later levels in the same unit use the same names to find those images.

## Examples

### Plain Sprite Lab

The Code tab and the game.

```json
{}
```

### A level with the World tab

The student also places images on the World grid, from the images in these roles, and cannot erase the last hero.

```json
{
  "world": {
    "palette": [
      "hero",
      "block"
    ],
    "keepsOneOf": [
      "hero"
    ]
  }
}
```

### An image level (quest-builder-2026, level 3)

```json
{
  "focus": "images",
  "edits": [
    "images"
  ],
  "images": {
    "makes": {
      "type": "sprite",
      "role": "hero"
    },
    "onlyThisImage": true,
    "paintTools": "limited",
    "generationLimit": 5,
    "explainAi": true
  },
  "objectives": {
    "title": "**Make a character**",
    "steps": [
      {
        "text": "Select the **+** button.",
        "check": {
          "kind": "image",
          "imageType": "sprite"
        }
      },
      {
        "text": "Make a **prompt** that describes your character, or draw it yourself.",
        "check": {
          "kind": "image",
          "imageType": "sprite"
        }
      },
      {
        "text": "Evaluate the AI’s image with a thumbs up or thumbs down.",
        "check": {
          "kind": "rated"
        },
        "shownWhen": {
          "kind": "generated"
        }
      }
    ]
  }
}
```

### A code level with scaffolding (quest-builder-2026, level 11)

```json
{
  "images": {
    "canAdd": false,
    "canDelete": false,
    "paintTools": "limited",
    "generationLimit": 5
  },
  "world": {
    "palette": [
      "friend",
      "hero",
      "treasure",
      "block"
    ],
    "keepsOneOf": [
      "friend",
      "hero",
      "treasure"
    ]
  },
  "scenes": {
    "starting": [
      {
        "id": "scene-1",
        "name": "Scene 1"
      }
    ]
  },
  "blocks": {
    "addOnArrival": [
      {
        "type": "gamelab_checkTouching",
        "data": "friend-touch",
        "fields": {
          "CONDITION": "\"when\""
        },
        "inputs": {
          "SPRITE1": {
            "shadow": {
              "type": "gamelab_allSpritesWithAnimation"
            }
          },
          "SPRITE2": {
            "shadow": {
              "type": "gamelab_allSpritesWithAnimation"
            }
          }
        },
        "next": {
          "shadow": {
            "type": "spritelab2_placeholder",
            "extraState": {
              "like": {
                "type": "gamelab_spriteSay",
                "fields": {
                  "SPEECH": "Oh!"
                },
                "inputs": {
                  "SPRITE": {
                    "shadow": {
                      "type": "gamelab_allSpritesWithAnimation"
                    }
                  }
                }
              }
            }
          }
        }
      }
    ],
    "lockEarlier": true,
    "dropdownsStartOn": {
      "sprite": "friend",
      "gamelab_checkTouching": [
        "hero",
        "friend"
      ],
      "spritelab2_burst": "friend",
      "gamelab_spriteSay": "hero"
    }
  },
  "objectives": {
    "title": "**When you meet**",
    "steps": [
      {
        "text": "Drag a block under the event **when player touches character**.",
        "check": {
          "kind": "block",
          "type": [
            "spritelab2_burst",
            "spritelab2_playSound",
            "gamelab_spriteSay",
            "spritelab2_setCameraZoom",
            "spritelab2_restartScene"
          ],
          "data": "friend-touch"
        }
      },
      {
        "text": "Select **Run** and go meet them.",
        "check": {
          "kind": "reach",
          "role": "friend"
        }
      }
    ]
  }
}
```

### Free play (quest-builder-2026, level 14)

```json
{
  "images": {},
  "world": {},
  "scenes": {
    "canChange": true
  },
  "blocks": {
    "catalog": true,
    "dropdownsStartOn": {
      "sprite": "hero",
      "spritelab2_beginsBehavior": "friend",
      "gamelab_checkTouching": [
        "hero",
        "treasure"
      ]
    }
  },
  "objectives": {
    "title": "**Free play!**\n\nEverything is unlocked. Finish your game, and finish the lesson when you're done.",
    "collapsedText": "Enjoy free play!"
  },
  "instructions": {
    "startCollapsed": true,
    "freePlayIntro": true
  }
}
```
