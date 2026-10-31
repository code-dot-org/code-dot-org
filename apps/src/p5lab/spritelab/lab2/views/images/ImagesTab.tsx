// The Images tab: the project's images down the left, the one being worked
// on large in the middle, and the way to make or remake it in a pane at the
// right. A picture is the image the moment it lands; there is no dialog and
// no Keep.

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import PixelEditorModal from '@cdo/apps/pixelEditor/PixelEditorModal';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  GeneratedImageResult,
  UploadImageFunction,
} from '../../ai/images/imageGeneration';
import {ImageSubject, ImageType} from '../../ai/images/types';
import {onTrimsUpdated, trimAnimationListImages} from '../../imageTrim';
import {DEFAULT_IMAGE_STYLE} from '../../levelMode';
import {BACKGROUND_GROUND_COLOR, blankPaintImage} from '../../paintBlank';
import SentenceScene from '../sentence/SentenceScene';

import ImageFrame from './ImageFrame';
import ImageList, {DraftEntry} from './ImageList';
import MakePane from './MakePane';
import {listProjectImages, ProjectImage} from './projectImages';
import useImageWriter, {ImageTarget} from './useImageWriter';

import styles from './images-tab.module.scss';

interface ImagesTabProps {
  uploadImage?: UploadImageFunction;
  /** Drop every reference to a deleted image (called after the removal). */
  onDeleteImage: (name: string) => void;
  /** The level is about one image of this kind: the tab opens on it, or on
      the place it will go. */
  lockedImageType?: ImageType;
  lockedImageSubject?: ImageSubject;
  /** Recorded on every image made here. */
  imageRole?: string;
  /** Generations the student has left on this level; unlimited when
      unset. */
  generationsLeft?: number;
  /** A generation request is leaving. */
  onGenerate?: () => void;
  /** Students may add images and draw on them (free play). */
  editingOffered?: boolean;
  /** The level requires a rating on every generated picture. */
  verdictRequired?: boolean;
  /** The right pane's width, px: the preview column's. */
  paneWidth: number;
}

const DRAFT_ID = 'draft';
// The pane's width before the preview column has reported its own.
const DEFAULT_PANE_WIDTH = 280;

const ImagesTab: React.FunctionComponent<ImagesTabProps> = ({
  uploadImage,
  onDeleteImage,
  lockedImageType,
  lockedImageSubject,
  imageRole,
  generationsLeft,
  onGenerate,
  editingOffered,
  verdictRequired,
  paneWidth,
}) => {
  const animationList = useAppSelector(state => state.animationList);
  // Thumbnails land as the engine trims; re-list when they do.
  const [trimVersion, setTrimVersion] = useState(0);
  useEffect(() => onTrimsUpdated(() => setTrimVersion(v => v + 1)), []);
  useEffect(() => {
    trimAnimationListImages(animationList);
  }, [animationList]);
  const images = useMemo(
    () => listProjectImages(animationList),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animationList, trimVersion]
  );
  const writer = useImageWriter({uploadImage, imageRole, onDeleteImage});

  const [draft, setDraft] = useState<DraftEntry | null>(null);
  const [chosenId, setChosenId] = useState<string | null>(null);
  // Counts sessions: one image's run of generations, which the scene's
  // state lives for. A new image made from the draft keeps its session.
  const [session, setSession] = useState(0);
  const startSession = useCallback(
    (id: string | null) => {
      writer.endSession();
      setChosenId(id);
      setSession(s => s + 1);
    },
    [writer]
  );
  const startDraft = useCallback(
    (imageType: ImageType, subject?: ImageSubject) => {
      setDraft({id: DRAFT_ID, imageType, subject});
      startSession(DRAFT_ID);
    },
    [startSession]
  );

  // Where the tab opens: a level about one image opens on that image, or on
  // the place it will go; otherwise on the first image, if any.
  const imagesRef = useRef(images);
  imagesRef.current = images;
  useEffect(() => {
    const current = imagesRef.current;
    if (!lockedImageType) {
      setChosenId(current[0]?.key ?? null);
      return;
    }
    const own = imageRole
      ? current.find(image => image.props.role === imageRole)
      : current.find(image => image.imageType === lockedImageType);
    if (own) {
      setChosenId(own.key);
    } else {
      startDraft(lockedImageType, lockedImageSubject);
    }
    // Once, as the tab mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A chosen image that is gone (deleted) gives way to the first image
  // left, or to a fresh draft on a level about one image.
  useEffect(() => {
    if (
      chosenId === null ||
      (chosenId === DRAFT_ID && draft) ||
      images.some(image => image.key === chosenId)
    ) {
      return;
    }
    if (images[0]) {
      startSession(images[0].key);
    } else if (lockedImageType) {
      startDraft(lockedImageType, lockedImageSubject);
    } else {
      startSession(null);
    }
  }, [
    chosenId,
    draft,
    images,
    lockedImageType,
    lockedImageSubject,
    startSession,
    startDraft,
  ]);

  const chosenImage: ProjectImage | null =
    images.find(image => image.key === chosenId) ?? null;
  const chosenDraft = chosenId === DRAFT_ID ? draft : null;
  // The kind the scene makes: the image's own, or the draft's.
  const kind = chosenImage
    ? {imageType: chosenImage.imageType, subject: chosenImage.subject}
    : chosenDraft
    ? {imageType: chosenDraft.imageType, subject: chosenDraft.subject}
    : null;

  // What a landing picture writes to: the chosen image, or a new one of the
  // picture's kind. A ref, so a slow upload lands where it was aimed.
  const chosenKeyRef = useRef(chosenId);
  chosenKeyRef.current = chosenImage?.key ?? null;
  const land = useCallback(
    async (target: ImageTarget, write: () => Promise<string>) => {
      const key = await write();
      if (!target.key) {
        setDraft(null);
        setChosenId(key);
      }
    },
    []
  );
  const handleKeep = useCallback(
    (result: GeneratedImageResult) => {
      const target: ImageTarget = {
        key: chosenKeyRef.current,
        imageType: result.generation.imageType,
        subject: result.generation.subject,
      };
      return land(target, () => writer.acceptGenerated(target, result));
    },
    [writer, land]
  );

  // Drawing: the pixel editor over the tab, on the image or a blank.
  const [painting, setPainting] = useState<ImageTarget | null>(null);
  const paintSource = useMemo(() => {
    if (!painting) {
      return null;
    }
    const existing = painting.key
      ? images.find(image => image.key === painting.key)
      : undefined;
    if (existing?.src) {
      return {
        imageUrl: existing.src,
        pixelGridSize: existing.props.pixelGridSize,
        recentColors: existing.props.recentColors,
      };
    }
    const blank = blankPaintImage(painting.imageType, DEFAULT_IMAGE_STYLE);
    return {imageUrl: blank.dataURI, pixelGridSize: blank.pixelGridSize};
    // The editor's source is fixed when it opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [painting]);
  // Character sets are sheets of frames; the editor paints one image.
  const drawOffered =
    !!editingOffered && !!kind && !chosenImage?.sheet && !painting;

  const deleteOffered = !!editingOffered;
  const paneWidthPx = paneWidth || DEFAULT_PANE_WIDTH;

  return (
    <div className={styles.tab}>
      <ImageList
        images={images}
        draft={draft}
        chosenId={chosenId}
        onChoose={id => {
          if (id === chosenId) {
            return;
          }
          // A draft left for an image holds nothing worth keeping.
          if (id !== DRAFT_ID) {
            setDraft(null);
          }
          startSession(id);
        }}
        onNew={
          editingOffered
            ? () => {
                if (draft) {
                  startSession(DRAFT_ID);
                } else {
                  startDraft('sprite', 'character');
                }
              }
            : undefined
        }
        onDelete={deleteOffered ? writer.deleteImage : undefined}
      />
      {kind ? (
        <SentenceScene
          key={session}
          imageType={kind.imageType}
          imageSubject={kind.subject}
          typeChoice={!!chosenDraft && !lockedImageType}
          generationsLeft={generationsLeft}
          verdictRequired={verdictRequired}
          onGenerateStart={onGenerate}
          onKeep={handleKeep}
          keepOnResult
          method="tab"
          layout={parts => (
            <>
              <ImageFrame
                image={chosenImage}
                draftKind={chosenDraft ?? undefined}
                live={
                  parts.mode === 'generating' || parts.frameFilled
                    ? parts.frame
                    : undefined
                }
                beside={parts.alternatives}
                under={parts.underFrame}
              />
              <MakePane
                parts={parts}
                width={paneWidthPx}
                overwriteWarns={!!chosenImage && !chosenImage.props.generation}
                onDraw={
                  drawOffered
                    ? () =>
                        setPainting({
                          key: chosenImage?.key ?? null,
                          imageType: parts.draft.imageType,
                          subject: parts.draft.subject,
                        })
                    : undefined
                }
                drawLabel={chosenImage ? 'Edit this image' : 'Draw my own'}
              />
            </>
          )}
        />
      ) : (
        <>
          <ImageFrame image={null} />
          <section
            className={styles.pane}
            style={{width: paneWidthPx}}
            aria-label="Make your picture"
          >
            <p className={styles.headline}>
              {editingOffered
                ? 'Press + to make an image.'
                : 'This level has no images to make.'}
            </p>
          </section>
        </>
      )}
      {painting && paintSource && (
        <PixelEditorModal
          title={painting.key ? 'Edit image' : 'Draw image'}
          imageUrl={paintSource.imageUrl}
          knownPixelGrid={paintSource.pixelGridSize}
          initialRecentColors={paintSource.recentColors}
          opaqueGround={
            painting.imageType === 'background'
              ? BACKGROUND_GROUND_COLOR
              : undefined
          }
          onSave={async (dataURI, meta) => {
            const target = painting;
            setPainting(null);
            await land(target, () => writer.saveEdited(target, dataURI, meta));
          }}
          onCancel={() => setPainting(null)}
        />
      )}
    </div>
  );
};

export default ImagesTab;
