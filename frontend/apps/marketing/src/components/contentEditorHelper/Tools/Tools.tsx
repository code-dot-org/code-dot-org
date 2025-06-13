import {BodyTwoText} from '@code-dot-org/component-library/typography';

type ContentEditorToolsProps = {
  isDraftModeEnabled: boolean;
  previewLabel: string;
};

const ContentEditorTools = ({
  isDraftModeEnabled,
  previewLabel,
}: ContentEditorToolsProps) => {
  const draftModeText = isDraftModeEnabled
    ? `${previewLabel} (Draft)`
    : `${previewLabel} (Published)`;

  return (
    <>
      <BodyTwoText>
        <strong>Viewing {draftModeText}</strong>
      </BodyTwoText>
    </>
  );
};

export default ContentEditorTools;
