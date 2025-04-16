import {
  documentToReactComponents,
  Options,
} from '@contentful/rich-text-react-renderer';
import {
  BLOCKS,
  INLINES,
  MARKS,
  Document,
  Block,
  Inline,
  Text,
  Mark,
} from '@contentful/rich-text-types';
import {EntryFields} from 'contentful';
import {ReactNode} from 'react';

import Link from '@code-dot-org/component-library/link';
import SimpleList, {
  SimpleListItem,
} from '@code-dot-org/component-library/list/simpleList';
import {
  BodyTwoText,
  StrongText,
} from '@code-dot-org/component-library/typography';

import moduleStyles from './richText.module.scss';

export interface RichTextProps {
  content?: EntryFields.RichText | Document;
}

export type RichTextNode =
  | Block
  | Inline
  | (Text & {
      content?: RichTextNode;
    });

const extractNodeContent = (node: RichTextNode): ReactNode[] => {
  const getContent = (): ReactNode[] =>
    Array.isArray(node.content)
      ? node.content.map(extractNodeContent).flat()
      : [];

  const isBold = (node: Text): boolean =>
    node.marks.some(({type}: Mark) => type === MARKS.BOLD);

  switch (node.nodeType) {
    case 'text':
      return node.value
        ? [
            isBold(node) ? (
              <StrongText key={node.value}>{node.value}</StrongText>
            ) : (
              node.value
            ),
          ]
        : [];
    case INLINES.HYPERLINK: {
      const linkContent = getContent();
      return [
        <Link key={linkContent.join('-') + node.data.uri} href={node.data.uri}>
          {linkContent}
        </Link>,
      ];
    }
    default:
      return getContent();
  }
};

const richTextRenderOptions: Options = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (paragraphNode: RichTextNode) => {
      const paragraphContent = extractNodeContent(paragraphNode);
      // The Rich Text Editor wraps each line in a <p> tag, which acts as a spacer.
      // Replaces empty paragraphs with a <br /> To comply with HTML a11y guidelines.
      return paragraphContent.length ? (
        <BodyTwoText>{paragraphContent}</BodyTwoText>
      ) : (
        <br />
      );
    },
    [BLOCKS.UL_LIST]: (listNode: Block | Inline) => (
      <SimpleList
        items={listNode.content.map(
          (itemNode: RichTextNode): SimpleListItem => {
            const listItemContent = extractNodeContent(itemNode);
            return {key: listItemContent.join('-'), label: listItemContent};
          },
        )}
      />
    ),
  },
};

const RichText: React.FC<RichTextProps> = ({content}) =>
  content ? (
    <div className={moduleStyles.richText}>
      {documentToReactComponents(content, richTextRenderOptions)}
    </div>
  ) : (
    <em>
      <strong>📄 Rich Text placeholder.</strong> Please bind a "Rich Text"
      content type field in the Content sidebar.
    </em>
  );

export default RichText;
