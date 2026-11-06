import Checkbox from '@code-dot-org/component-library/checkbox';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import TextField from '@code-dot-org/component-library/textField';
import {Typography} from '@mui/material';
import React, {useMemo, useState} from 'react';

import {
  IMAGE_SUBJECTS,
  IMAGE_TYPE_LABELS,
  IMAGE_TYPES,
  ImageSubject,
  imageKindLabel,
  ImageType,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';
import {LevelModeKind} from '@cdo/apps/p5lab/spritelab/lab2/levelMode';

import {
  fieldApplies,
  getKind,
  getPaletteRoles,
  KIND_LABELS,
  LEVEL_MODE_KINDS,
  LevelModeObject,
  parsePaletteRoles,
  setImageFirst,
  setImageRole,
  setImageSubject,
  setImageType,
  setKind,
  setPaletteRoles,
  tabsForKind,
} from './spritelabMode';

import moduleStyles from './edit-spritelab-mode.module.scss';

interface SpritelabModeFieldsProps {
  mode: LevelModeObject;
  // Saved values that were not valid and are dropped from the mode.
  removed: string[];
  usesLab2: boolean;
  onChange: (mode: LevelModeObject) => void;
}

const NO_KIND = '';
const NO_IMAGE_TYPE = '';

const KIND_ITEMS = [
  {value: NO_KIND, text: 'None'},
  ...LEVEL_MODE_KINDS.map(kind => ({
    value: kind,
    text: KIND_LABELS[kind],
  })),
];

const IMAGE_TYPES_ITEMS = IMAGE_TYPES.map(imageType => ({
  value: imageType,
  text: IMAGE_TYPE_LABELS[imageType],
}));

// Only a world level can leave the type unset, where it means the palette
// goes by role instead. On a kind that makes an image, no type means no plus
// button, so the placeholder is there to be replaced, not chosen.
function imageTypeItems(kind: LevelModeKind | undefined, chosen: unknown) {
  if (kind === 'world') {
    return [
      {value: NO_IMAGE_TYPE, text: 'None: use palette role'},
      ...IMAGE_TYPES_ITEMS,
    ];
  }
  if (chosen === undefined) {
    return [
      {value: NO_IMAGE_TYPE, text: 'Choose a type', disabled: true},
      ...IMAGE_TYPES_ITEMS,
    ];
  }
  return IMAGE_TYPES_ITEMS;
}

const IMAGE_SUBJECT_ITEMS = IMAGE_SUBJECTS.map(subject => ({
  value: subject,
  text: imageKindLabel('sprite', subject),
}));

function useTypedText(saved: string, normalize: (text: string) => string) {
  const [text, setText] = useState(saved);
  if (normalize(text) !== saved) {
    setText(saved);
  }
  return [text, setText] as const;
}

const SpritelabModeFields: React.FunctionComponent<
  SpritelabModeFieldsProps
> = ({mode, removed, usesLab2, onChange}) => {
  const kind = getKind(mode);
  const [paletteRolesText, setPaletteRolesText] = useTypedText(
    getPaletteRoles(mode).join(', '),
    text => parsePaletteRoles(text).join(', ')
  );
  const [imageRoleText, setImageRoleText] = useTypedText(
    (mode.imageRole as string) ?? '',
    text => text.trim()
  );

  const kindHelper = useMemo(() => {
    let helpText = kind
      ? `Students see these tabs: ${tabsForKind(
          kind,
          mode.imageFirst === true
        )}.`
      : 'Without a mode students see Images, Code and Play, and can edit scenes.';
    if (kind === 'freeplay') {
      helpText +=
        ' In free play, students have unlimited image generations, can draw and edit images, can edit scenes, and the instructions start collapsed.';
    }
    return helpText;
  }, [kind, mode.imageFirst]);

  const showImageType = fieldApplies(mode, 'imageType');
  const showImageSubject = fieldApplies(mode, 'imageSubject');
  const showImageRole = fieldApplies(mode, 'imageRole');
  const showPaletteRoles = fieldApplies(mode, 'paletteRoles');
  const showImageFirst = fieldApplies(mode, 'imageFirst');

  // The palette lists images in the palette roles but preselects the level's
  // image role, so a role the palette omits will select a hidden image. A
  // background selects nothing, so it cannot disagree.
  const paletteConflict =
    showPaletteRoles &&
    getPaletteRoles(mode).length > 0 &&
    typeof mode.imageType === 'string' &&
    mode.imageType !== 'background' &&
    !getPaletteRoles(mode).includes(mode.imageRole as string);

  // A world level is the one kind that can leave the type unset, but only
  // while it has no Images tab.
  const typeMissing =
    showImageType &&
    mode.imageType === undefined &&
    (kind !== 'world' || mode.imageFirst === true);

  const imageTypeHelper = useMemo(() => {
    if (kind !== 'world') {
      return 'The Images tab offers only this type, and the user can only make one image.';
    }
    if (mode.imageType === undefined) {
      return getPaletteRoles(mode).length > 0
        ? 'With no type the palette includes the palette roles below, and students start on the first image of the first role.'
        : 'With no type and no palette roles the palette offers every image in the project, with none selected to start.';
    }
    // A world cell holds a sprite or a block, so nothing matches a background.
    if (mode.imageType === 'background') {
      return 'A background neither narrows the palette nor selects anything to start, but does filter the Images tab if image-first is on.';
    }
    return 'The World palette offers only this level’s image of this type.';
  }, [kind, mode]);

  return (
    <div>
      {!usesLab2 && (
        <Typography variant="body4" className={moduleStyles.descriptionText}>
          <Typography variant="strong">
            These settings affect only the Lab 2 version of Sprite Lab. Enable
            Lab 2 for them to do anything.
          </Typography>
        </Typography>
      )}
      {removed.length > 0 && (
        <Typography variant="body4" className={moduleStyles.warningText}>
          These saved values are not valid for Sprite Lab 2 and will be removed
          when you save: {removed.join('; ')}
        </Typography>
      )}
      <div className={moduleStyles.fieldArea}>
        <SimpleDropdown
          labelText="Kind"
          name="spritelab_mode_kind"
          items={KIND_ITEMS}
          selectedValue={kind ?? NO_KIND}
          onChange={event =>
            onChange(
              setKind(
                mode,
                event.target.value === NO_KIND
                  ? undefined
                  : (event.target.value as LevelModeKind)
              )
            )
          }
          helperMessage={kindHelper}
          size="s"
        />
      </div>
      {showImageType && (
        <div className={moduleStyles.fieldArea}>
          <SimpleDropdown
            labelText="Image type"
            name="spritelab_mode_image_type"
            items={imageTypeItems(kind, mode.imageType)}
            selectedValue={(mode.imageType as string) ?? NO_IMAGE_TYPE}
            onChange={event =>
              onChange(
                setImageType(
                  mode,
                  event.target.value === NO_IMAGE_TYPE
                    ? undefined
                    : (event.target.value as ImageType)
                )
              )
            }
            helperMessage={imageTypeHelper}
            errorMessage={
              paletteConflict
                ? 'Image role must be one of the palette roles, or the palette preselects an image it does not offer.'
                : typeMissing
                ? 'Pick a type. Without one there is no image to make.'
                : undefined
            }
            size="s"
          />
        </div>
      )}
      {showImageSubject && (
        <div className={moduleStyles.fieldArea}>
          <SimpleDropdown
            labelText="Image subject"
            name="spritelab_mode_image_subject"
            items={IMAGE_SUBJECT_ITEMS}
            selectedValue={(mode.imageSubject as string) ?? 'character'}
            onChange={event =>
              onChange(
                setImageSubject(mode, event.target.value as ImageSubject)
              )
            }
            helperMessage="A character can be drawn as an animated set; an object is one still picture."
            size="s"
          />
        </div>
      )}
      {showImageRole && (
        <div className={moduleStyles.fieldArea}>
          <TextField
            label="Image role"
            name="spritelab_mode_image_role"
            value={imageRoleText}
            onChange={event => {
              setImageRoleText(event.target.value);
              onChange(setImageRole(mode, event.target.value));
            }}
            helperMessage="Tagged on every image this level makes. Later levels can use image_role_defaults to set which role(s) blockly dropdowns should start on."
            size="s"
          />
        </div>
      )}
      {showPaletteRoles && (
        <div className={moduleStyles.fieldArea}>
          <TextField
            label="Palette roles"
            name="spritelab_mode_palette_roles"
            value={paletteRolesText}
            onChange={event => {
              setPaletteRolesText(event.target.value);
              onChange(setPaletteRoles(mode, event.target.value));
            }}
            helperMessage="Comma separated. The palette offers images in these roles instead of one image, and the first role listed is what students place first."
            size="s"
          />
        </div>
      )}
      {showImageFirst && (
        <div className={moduleStyles.booleanField}>
          <Checkbox
            name="spritelab_mode_image_first"
            label="Enable the Images tab and start on it."
            checked={mode.imageFirst === true}
            onChange={event =>
              onChange(setImageFirst(mode, event.target.checked))
            }
            size="s"
          />
        </div>
      )}
    </div>
  );
};

export default SpritelabModeFields;
