import { Editor, Element, Node, Transforms, Text } from 'slate';
import { ReactEditor } from 'slate-react';

export const paragraphElement = () => ({
  type: 'paragraph',
  children: [{ text: '' }],
});

export const withParagraphs = (editor: ReactEditor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = entry => {
    const [node, path] = entry;

    // If the element is a paragraph, ensure its children are valid.
    if (Element.isElement(node)) {
      if (!node.type) {
        Transforms.setNodes(editor, { type: 'paragraph' }, { at: path });
        return;
      }
      if (!node.type || node.type === 'paragraph') {
        for (const [child, childPath] of Node.children(editor, path)) {
          if (Element.isElement(child) && !editor.isInline(child)) {
            Transforms.unwrapNodes(editor, { at: childPath });
            return;
          }
        }
      }
    }
    if (Editor.isEditor(node)) {
      let lastNode = node.children[node.children.length - 1];
      if (lastNode?.type !== 'paragraph') {
        Transforms.insertNodes(editor, paragraphElement(), {
          at: [...path, node.children.length],
        });
        return;
      }
      for (const [index, childNode] of node.children.entries()) {
        if (Editor.isInline(editor, childNode) || Text.isText(childNode)) {
          Transforms.wrapNodes(
            editor,
            { type: 'paragraph', children: [] },
            { at: [...path, index] }
          );
          return;
        }
      }
    }

    normalizeNode(entry);
  };

  return editor;
};
