import { Editor } from "@tiptap/vue-3";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Heading from "@tiptap/extension-heading";
import Strike from "@tiptap/extension-strike";
import Text from "@tiptap/extension-text";
import TaskList from "@tiptap/extension-task-list";
import History from "@tiptap/extension-history";
import TaskItem from "@tiptap/extension-task-item";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import CharacterCount from "@tiptap/extension-character-count";
import FontFamily from "@tiptap/extension-font-family";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";

function createEditor(): Editor {
  return new Editor({
    injectCSS: false,
    autofocus: true,
    extensions: [
      Document,
      Paragraph,
      Heading,
      Strike,
      Text,
      TaskList,
      History,
      TaskItem.configure({
        nested: true,
      }),
      Bold,
      Italic,
      BulletList,
      OrderedList,
      ListItem,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Underline,
      Subscript,
      Superscript,
      CharacterCount.configure({
        limit: 10000,
      }),
      FontFamily,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
  });
}

export default createEditor;
