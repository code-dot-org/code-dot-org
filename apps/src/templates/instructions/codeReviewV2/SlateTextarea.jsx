import React, {useCallback, useMemo} from 'react';
import PropTypes from 'prop-types';
import isHotkey from 'is-hotkey';
import {Editable, withReact, Slate} from 'slate-react';
import {Editor, Transforms, createEditor, Element as SlateElement} from 'slate';
import {serialize} from 'remark-slate';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import '@cdo/apps/templates/instructions/codeReviewV2/slateTextArea.scss';

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code'
};

const SlateExampleTextArea = () => {
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withReact(createEditor()), []);

  const onChange = value => {
    console.log(value);
    console.log(value.map(v => serialize(v)).join(''));
  };

  return (
    <div style={{border: '1px solid #59cad3'}}>
      <Slate
        editor={editor}
        value={initialValue}
        onChange={onChange}
        style={{minHeight: '100px'}}
      >
        <div style={{borderBottom: '1px solid #59cad3'}}>
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
          placeholder="Add a comment to the review"
          className="editable-text-area"
          spellCheck
          autoFocus
          onKeyDown={event => {
            for (const hotkey in HOTKEYS) {
              if (isHotkey(hotkey, event)) {
                event.preventDefault();
                const mark = HOTKEYS[hotkey];
                toggleMark(editor, mark);
              }
            }
          }}
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

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
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

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
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
  codeButton: {
    padding: '5px'
  }
};

export default SlateExampleTextArea;
