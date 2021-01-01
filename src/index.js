/**
 * @fileoverview Code for the font size plugin
 * @author Chow Jia Ying <chowjiaying211@gmail.com>
 *
 * This is a plugin to support underlining in the TUI Editor.
 *
 */

import "./index.css"

function initUI(editor) {
  const toolbar = editor.getUI().getToolbar()
  const italicIndex = toolbar.indexOfItem("italic")

  toolbar.insertItem(italicIndex + 1, {
    type: "button",
    options: {
      name: "underline",
      className: "tui-underline",
      event: "underline",
      tooltip: "Underline",
    },
  })
}

/**
 * Underline plugin
 * Some code was modified from https://github.com/nhn/tui.editor/blob/master/plugins/color-syntax/src/js/index.js to learn how to make use of the TUI Editor's API to create the plugin
 * @param {Editor|Viewer} editor - instance of Editor or Viewer
 */

export default function underline(editor) {
  // add commands for editor
  initUI(editor)
  editor.addCommand("markdown", {
    name: "underline",
    exec(md) {
      console.log(md)
    },
  })
}
