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
import MuiBox from '@mui/material/Box';
import MuiList from '@mui/material/List';
import MuiListItem from '@mui/material/ListItem';
import MuiTable from '@mui/material/Table';
import MuiTableCell from '@mui/material/TableCell';
import MuiTableContainer from '@mui/material/TableContainer';
import MuiTableHead from '@mui/material/TableHead';
import MuiTableRow from '@mui/material/TableRow';
import {EntryFields} from 'contentful';
import {ReactNode} from 'react';

import Link from '@/components/contentful/link';
import Paragraph from '@/components/contentful/paragraph';

import {
  richTextContainerStyles,
  richTextListStyles,
  richTextParagraphStyles,
  richTextTableStyles,
} from './richTextStyles';

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

  switch (node.nodeType) {
    case 'text': {
      if (!node.value) return [];

      return [
        node.marks.reduce((value: ReactNode, {type}: Mark) => {
          switch (type) {
            case MARKS.BOLD:
              return <strong key={type + value}>{value}</strong>;
            case MARKS.ITALIC:
              return <em key={type + value}>{value}</em>;
            default:
              return value;
          }
        }, node.value),
      ];
    }
    case INLINES.HYPERLINK: {
      const linkContent = getContent();
      return [
        <Link
          removeMarginBottom
          isLinkExternal={false}
          key={linkContent.join('-') + node.data.uri}
          href={node.data.uri}
        >
          {linkContent}
        </Link>,
      ];
    }
    default:
      return getContent();
  }
};

const richTextRenderOptions: Options = {
  preserveWhitespace: true,
  renderNode: {
    [BLOCKS.PARAGRAPH]: (paragraphNode: RichTextNode) => {
      const paragraphContent = extractNodeContent(paragraphNode);
      // The Rich Text Editor wraps each line in a <p> tag, which acts as a spacer.
      // Replaces empty paragraphs with a <br /> To comply with HTML a11y guidelines.
      return paragraphContent.some(content => content) ? (
        <Paragraph
          sx={richTextParagraphStyles}
          color="primary"
          visualAppearance="body-two"
          removeMarginBottom
          isStrong={false}
        >
          {paragraphContent}
        </Paragraph>
      ) : (
        <br />
      );
    },
    [BLOCKS.UL_LIST]: (listNode: Block | Inline) => (
      <>
        <MuiList
          component="ul"
          sx={{...richTextListStyles, listStyleType: 'disc'}}
        >
          {listNode.content.map((itemNode: RichTextNode, index) => (
            <MuiListItem key={index}>
              <Paragraph removeMarginBottom>
                {extractNodeContent(itemNode)}
              </Paragraph>
            </MuiListItem>
          ))}
        </MuiList>
        <br />
      </>
    ),
    [BLOCKS.OL_LIST]: (listNode: Block | Inline) => (
      <>
        <MuiList
          component="ol"
          sx={{...richTextListStyles, listStyleType: 'decimal'}}
        >
          {listNode.content.map((itemNode: RichTextNode, index) => (
            <MuiListItem key={index} sx={{display: 'list-item'}}>
              <Paragraph removeMarginBottom sx={richTextParagraphStyles}>
                {extractNodeContent(itemNode)}
              </Paragraph>
            </MuiListItem>
          ))}
        </MuiList>
        <br />
      </>
    ),
    [BLOCKS.TABLE]: (tableNode: Block | Inline) => {
      if (!('content' in tableNode)) return null;
      const rows = tableNode.content.filter(
        (row): row is Block => row.nodeType === BLOCKS.TABLE_ROW,
      );

      const [headerRow, ...bodyRows] = rows;
      return (
        <MuiTableContainer sx={richTextTableStyles}>
          <MuiTable>
            <MuiTableHead>
              <MuiTableRow>
                {(('content' in headerRow && headerRow.content) || []).map(
                  (cell: RichTextNode, i: number) => (
                    <MuiTableCell key={`header-cell-${i}`}>
                      {extractNodeContent(cell)}
                    </MuiTableCell>
                  ),
                )}
              </MuiTableRow>
            </MuiTableHead>
            <tbody>
              {bodyRows.map((row, rowIndex) => (
                <MuiTableRow key={`row-${rowIndex}`}>
                  {(('content' in row && row.content) || []).map(
                    (cell: RichTextNode, cellIndex: number) => (
                      <MuiTableCell key={`cell-${cellIndex}`}>
                        {extractNodeContent(cell)}
                      </MuiTableCell>
                    ),
                  )}
                </MuiTableRow>
              ))}
            </tbody>
          </MuiTable>
        </MuiTableContainer>
      );
    },
  },
};

const RichText: React.FC<RichTextProps> = ({content}) =>
  content ? (
    <MuiBox sx={richTextContainerStyles}>
      {documentToReactComponents(content, richTextRenderOptions)}
    </MuiBox>
  ) : (
    <em>
      <strong>📄 Rich Text placeholder.</strong> Please bind a "Rich Text"
      content type field in the Content sidebar.
    </em>
  );

export default RichText;
