import React, {useCallback, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import {Editable, withReact, Slate} from 'slate-react';
import {
  Editor,
  Transforms,
  createEditor,
  Text,
  Element as SlateElement,
} from 'slate';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';
import javalabMsg from '@cdo/javalab/locale';
import CodeReviewError from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewError';
import '@cdo/apps/templates/instructions/codeReviewV2/codeReviewCommentEditor.scss';

const CodeReviewCommentEditor = ({addCodeReviewComment}) => {
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withReact(createEditor()), []);
  const [commentText, setCommentText] = useState('');
  const [displayAddCommentFailure, setDisplayAddCommentFailure] =
    useState(false);
  const [addCommentFailureMessage, setAddCommentFailureMessage] =
    useState(null);

  const onChange = value => {
    const markdownValue = value.map(v => serialize(v)).join('');
    setCommentText(markdownValue);
  };

  const serialize = node => {
    if (Text.isText(node)) {
      return node.text;
    }

    const children = node.children.map(n => serialize(n)).join('');

    switch (node.type) {
      case 'code_block':
        return `\`\`\`\n${children}\n\`\`\`\n`;
      case 'paragraph':
        return `${children}\n`;
      default:
        return children;
    }
  };

  const handleSubmit = () => {
    addCodeReviewComment(commentText, onSubmitSuccess, onSubmitFailure);
  };

  const onSubmitSuccess = () => {
    Transforms.delete(editor, {
      at: {
        anchor: Editor.start(editor, []),
        focus: Editor.end(editor, []),
      },
    });
    setDisplayAddCommentFailure(false);
  };

  const onSubmitFailure = err => {
    if (err.profanityFoundError) {
      setAddCommentFailureMessage(err.profanityFoundError);
    } else {
      setAddCommentFailureMessage(null);
    }
    setDisplayAddCommentFailure(true);
  };

  const isTextEmpty = text => {
    // Extract code block and paragraph portions
    const matches = text.match(/```([^]+)```([^]+)/);
    if (matches && matches.length === 3) {
      return matches[1].trim().length === 0 && matches[2].trim().length === 0;
    }

    return text.trim().length === 0;
  };

  return (
    <>
      <div style={styles.textareaWrapper}>
        <Slate editor={editor} value={initialValue} onChange={onChange}>
          <div style={styles.buttonsArea}>
            <div
              role="button"
              style={styles.codeButton}
              onMouseDown={event => {
                event.preventDefault();
                toggleBlock(editor, 'code_block');
              }}
            >
              <FontAwesome icon="code" />
            </div>
          </div>
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder={javalabMsg.addACommentToReview()}
            className="editable-text-area"
            spellCheck
            autoFocus
          />
        </Slate>
      </div>
      <div style={styles.submit}>
        {displayAddCommentFailure && (
          <CodeReviewError
            messageText={addCommentFailureMessage}
            style={styles.error}
          />
        )}
        <Button
          className="code-review-comment-submit"
          disabled={isTextEmpty(commentText)}
          onClick={handleSubmit}
          text={javalabMsg.submit()}
          color={Button.ButtonColor.brandSecondaryDefault}
          style={styles.submitButton}
        />
      </div>
    </>
  );
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);

  if (isActive) {
    Transforms.unwrapNodes(editor, {
      match: n => n.type === format,
      split: true,
    });
  } else {
    Transforms.wrapNodes(editor, {
      type: format,
      children: [],
    });
  }
};

const isBlockActive = (editor, format, blockType = 'type') => {
  const {selection} = editor;
  if (!selection) {
    return false;
  }

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    })
  );

  return !!match;
};

const Element = ({attributes, children, element}) => {
  switch (element.type) {
    case 'code_block':
      return (
        <pre {...attributes}>
          <code>{children}</code>
        </pre>
      );
    default:
      return <p {...attributes}>{children}</p>;
  }
};
Element.propTypes = {
  attributes: PropTypes.object,
  children: PropTypes.node,
  element: PropTypes.object,
};

const Leaf = ({attributes, children}) => {
  return <span {...attributes}>{children}</span>;
};
Leaf.propTypes = {
  attributes: PropTypes.object,
  children: PropTypes.node,
};

const initialValue = [
  {
    type: 'paragraph',
    children: [{text: ''}],
  },
];

CodeReviewCommentEditor.propTypes = {
  addCodeReviewComment: PropTypes.func.isRequired,
};

export default CodeReviewCommentEditor;

const styles = {
  textareaWrapper: {
    border: `1px solid ${color.light_teal}`,
    borderRadius: '5px',
  },
  codeButton: {
    padding: '5px',
  },
  buttonsArea: {
    borderBottom: `1px solid ${color.light_gray}`,
    margin: '0 5px',
  },
  submit: {
    display: 'flex',
    alignItems: 'end',
    flexDirection: 'column',
  },
  submitButton: {
    marginTop: '10px',
  },
  error: {
    marginTop: '8px',
  },
};
