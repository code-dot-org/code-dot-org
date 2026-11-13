import Checkbox from '@code-dot-org/component-library/checkbox';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import TextField from '@code-dot-org/component-library/textField';
import {Typography} from '@mui/material';
import React, {useMemo, useState} from 'react';

import {ImageSource} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageCache';
import {
  IMAGE_SUBJECTS,
  IMAGE_TYPE_LABELS,
  IMAGE_TYPES,
  ImageSubject,
  imageKindLabel,
  ImageType,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';
import {
  LevelMode,
  LevelModeKind,
} from '@cdo/apps/p5lab/spritelab/lab2/levelMode';

import {
  fieldApplies,
  getPaletteRoles,
  KIND_LABELS,
  LEVEL_MODE_KINDS,
  parsePaletteRoles,
  setImageFirst,
  setEnableImageUpload,
  setImageSource,
  setLearning,
  setImageRole,
  setImageSubject,
  setImageType,
  setKind,
  setOneImage,
  setPaletteRoles,
  tabsForKind,
} from './spritelabMode';

import moduleStyles from './edit-spritelab-mode.module.scss';

interface SpritelabModeFieldsProps {
  mode: Partial<LevelMode>;
  // Saved values that were not valid and are dropped from the mode.
  removed: string[];
  usesLab2: boolean;
  onChange: (mode: Partial<LevelMode>) => void;
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

const IMAGE_TYPE_ITEMS = IMAGE_TYPES.map(imageType => ({
  value: imageType,
  text: IMAGE_TYPE_LABELS[imageType],
}));

function imageTypeItems(kind: LevelModeKind | undefined) {
  return [
    {
      value: NO_IMAGE_TYPE,
      text: kind === 'world' ? 'None: use palette role' : 'None: any type',
    },
    ...IMAGE_TYPE_ITEMS,
  ];
}

const IMAGE_SOURCE_ITEMS = [
  {value: 'cached', text: 'Cached'},
  {value: 'live', text: 'Live'},
];

const IMAGE_SUBJECT_ITEMS = IMAGE_SUBJECTS.map(subject => ({
  value: subject,
  text: imageKindLabel('sprite', subject),
}));

function useTypedText(saved: string, normalize: (text: string) => string) {
  const [text, setText] = useState(saved);
  if (normalize(text) !== normalize(saved)) {
    setText(saved);
  }
  return [text, setText] as const;
}

const SpritelabModeFields: React.FunctionComponent<
  SpritelabModeFieldsProps
> = ({mode, removed, usesLab2, onChange}) => {
  const kind = mode.kind;
  const [paletteRolesText, setPaletteRolesText] = useTypedText(
    getPaletteRoles(mode).join(', '),
    text => parsePaletteRoles(text).join(', ')
  );
  const [imageRoleText, setImageRoleText] = useTypedText(
    mode.imageRole ?? '',
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
  const showOneImage = fieldApplies(mode, 'oneImage');
  const showLearning = fieldApplies(mode, 'learning');
  const showEnableImageUpload = fieldApplies(mode, 'enableImageUpload');
  const uploadKindNote = mode.imageType
    ? `The upload becomes the image type above.`
    : 'Students choose Character, Background, Object or Block.';
  const showImageSource = fieldApplies(mode, 'imageSource');

  // The palette lists images in the palette roles but preselects the level's
  // image role, so a role the palette omits will select a hidden image. A
  // background selects nothing, so it cannot cause a palette conflict. With no
  // image role the selection comes from image_role_defaults, so no image role is valid.
  const paletteConflict =
    showPaletteRoles &&
    getPaletteRoles(mode).length > 0 &&
    mode.imageType !== undefined &&
    mode.imageType !== 'background' &&
    mode.imageRole !== undefined &&
    !getPaletteRoles(mode).includes(mode.imageRole);

  const imageTypeHelper = useMemo(() => {
    if (kind !== 'world') {
      if (mode.imageType === undefined) {
        return mode.oneImage
          ? 'With no type students make one image of whichever kind they pick.'
          : 'With no type students can make images of any kind.';
      }
      return mode.oneImage
        ? 'The Images tab makes only this type, and students make one image of it.'
        : 'The Images tab makes only this type, and students can make as many as they like.';
    }
    if (mode.imageType === undefined) {
      return getPaletteRoles(mode).length > 0
        ? 'With no type the palette includes the palette roles below, and students start on the first image of the first role.'
        : 'With no type and no palette roles the palette offers every image in the project, with none selected to start.';
    }
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
            items={imageTypeItems(kind)}
            selectedValue={mode.imageType ?? NO_IMAGE_TYPE}
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
            selectedValue={mode.imageSubject ?? 'character'}
            onChange={event =>
              onChange(
                setImageSubject(mode, event.target.value as ImageSubject)
              )
            }
            helperMessage="A character can be drawn as an animated set. An object is one still picture."
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
      {showOneImage && (
        <div className={moduleStyles.booleanField}>
          <Checkbox
            name="spritelab_mode_one_image"
            label="Limit students to one image, with no adding or deleting."
            checked={mode.oneImage === true}
            onChange={event =>
              onChange(setOneImage(mode, event.target.checked))
            }
            size="s"
          />
        </div>
      )}
      {showEnableImageUpload && (
        <div className={moduleStyles.booleanField}>
          <Checkbox
            name="spritelab_mode_enable_image_upload"
            label={`Enable image upload. ${uploadKindNote} FOR DEVELOPMENT USE ONLY, NOT FOR USER-FACING LEVELS.`}
            checked={mode.enableImageUpload === true}
            onChange={event =>
              onChange(setEnableImageUpload(mode, event.target.checked))
            }
            size="s"
          />
        </div>
      )}
      {showLearning && (
        <div className={moduleStyles.booleanField}>
          <Checkbox
            name="spritelab_mode_learning"
            label="Show a modal explaining how AI made the picture after the first generation only."
            checked={mode.learning === true}
            onChange={event =>
              onChange(setLearning(mode, event.target.checked))
            }
            size="s"
          />
        </div>
      )}
      {showImageSource && (
        <div className={moduleStyles.fieldArea}>
          <SimpleDropdown
            labelText="Image source"
            name="spritelab_mode_image_source"
            items={IMAGE_SOURCE_ITEMS}
            selectedValue={mode.imageSource ?? 'cached'}
            onChange={event =>
              onChange(setImageSource(mode, event.target.value as ImageSource))
            }
            helperMessage="Cached pictures come from the published set. Live asks the model every time, for a levelbuilder only: students always get cached pictures."
            size="s"
          />
        </div>
      )}
    </div>
  );
};

export default SpritelabModeFields;
