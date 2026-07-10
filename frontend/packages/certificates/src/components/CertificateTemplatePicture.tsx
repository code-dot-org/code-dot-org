import type {Ref} from 'react';

function getTemplateImageUrl(templateFilename: string): string {
  return `/blockly/media/certificates/${templateFilename}`;
}

function getTemplateImageMimeType(templateFilename: string): string {
  if (templateFilename.endsWith('.jpg')) {
    return 'image/jpeg';
  }

  return 'image/png';
}

export function CertificateTemplatePicture({
  imageRef,
  templateFilename,
}: {
  imageRef?: Ref<HTMLImageElement>;
  templateFilename: string;
}) {
  const templateImageUrl = getTemplateImageUrl(templateFilename);

  return (
    <picture style={{display: 'block', height: '100%', width: '100%'}}>
      <source
        srcSet={templateImageUrl}
        type={getTemplateImageMimeType(templateFilename)}
      />
      <img
        alt=""
        aria-hidden="true"
        crossOrigin="anonymous"
        data-testid="certificate-template-image"
        ref={imageRef}
        src={templateImageUrl}
        style={{display: 'block', height: '100%', width: '100%'}}
      />
    </picture>
  );
}
