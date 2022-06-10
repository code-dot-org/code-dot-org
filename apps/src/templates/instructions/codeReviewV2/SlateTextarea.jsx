import React, {useCallback, useMemo} from 'react';
import PropTypes from 'prop-types';
import javalabMsg from '@cdo/javalab/locale';
import {Editable, withReact, Slate} from 'slate-react';
import {Editor, Transforms, createEditor, Element as SlateElement} from 'slate';
import {serialize} from 'remark-slate';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';
import '@cdo/apps/templates/instructions/codeReviewV2/slateTextArea.scss';

const SlateExampleTextArea = ({handleChange}) => {
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withReact(createEditor()), []);

  const onChange = value => {
    console.log(value);
    const markdownValue = value.map(v => serialize(v)).join('');
    console.log(markdownValue);
    handleChange(markdownValue);
  };

  return (
    <div style={styles.wrapper}>
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
  );
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);

  if (isActive) {
    Transforms.unwrapNodes(editor, {
      match: n => n.type === format,
      split: true
    });
  } else {
    Transforms.wrapNodes(editor, {
      type: format,
      children: []
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
        n[blockType] === format
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
  element: PropTypes.object
};

const Leaf = ({attributes, children}) => {
  return <span {...attributes}>{children}</span>;
};
Leaf.propTypes = {
  attributes: PropTypes.object,
  children: PropTypes.node
};

const initialValue = [
  {
    type: 'paragraph',
    children: [{text: ''}]
  }
];

const styles = {
  wrapper: {
    border: `1px solid ${color.light_teal}`,
    borderRadius: '5px'
  },
  codeButton: {
    padding: '5px'
  },
  buttonsArea: {
    borderBottom: `1px solid ${color.light_gray}`,
    margin: '0 5px'
  }
};

SlateExampleTextArea.propTypes = {
  handleChange: PropTypes.func
};

export default SlateExampleTextArea;
