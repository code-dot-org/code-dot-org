import React, {useCallback, useMemo} from 'react';
import isHotkey from 'is-hotkey';
import {Editable, withReact, useSlate, Slate} from 'slate-react';
import {
  Editor,
  Transforms,
  createEditor,
  Descendant,
  Element as SlateElement
} from 'slate';
import {serialize} from 'remark-slate';
import './codeReviewStyles.scss';

// import {Button, Icon, Toolbar} from '../components';

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code'
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

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
      <Slate editor={editor} value={initialValue} onChange={onChange}>
        <div style={{borderBottom: '1px solid #59cad3'}}>
          <button
            onMouseDown={event => {
              event.preventDefault();
              toggleBlock(editor, 'code_block');
            }}
          >
            code
          </button>
        </div>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Enter some rich text…"
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
    Transforms.unwrapNodes(editor, {match: n => n.type === format});
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
  if (!selection) return false;

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
  const style = {textAlign: element.align};
  switch (element.type) {
    case 'code_block':
      return (
        <pre {...attributes}>
          <code>{children}</code>
        </pre>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};

const Leaf = ({attributes, children}) => {
  return <span {...attributes}>{children}</span>;
};

const initialValue = [
  {
    type: 'paragraph',
    children: [{text: ''}]
  }
];

export default SlateExampleTextArea;
