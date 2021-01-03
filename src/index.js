/**
 * @fileoverview Code for the font size plugin
 * @author Chow Jia Ying <chowjiaying211@gmail.com>
 *
 * This is a plugin to support underlining in the TUI Editor.
 *
 */

import "./index.css"

const underlineRegex = /^<u>.*<\/u>$/
const underlineContentRegex = /<u>([^~]*)<\/u>/g

function applyUnderlineTag(selectedText) {
  const matchUnderlineStyle = selectedText.match(underlineRegex)
  let result

  if (matchUnderlineStyle) {
    result = selectedText.replace(underlineContentRegex, "$1")
  } else {
    result = `<u>${selectedText}</u>`
  }

  return {
    result,
    to: result.length,
  }
}

function initUI(editor) {
  const toolbar = editor.getUI().getToolbar()
  const italicIndex = toolbar.indexOfItem("italic")
  const underlineIndex = italicIndex + 1

  toolbar.insertItem(underlineIndex, {
    type: "button",
    options: {
      name: "underline",
      className: "tui-underline",
      event: "underline",
      tooltip: "Underline",
    },
  })
  const underlineButton = toolbar.getItem(underlineIndex).el

  return underlineButton
}

function initUIEvents(editor, underlineButton) {
  underlineButton.addEventListener("click", () => editor.exec("underline"))
}

/**
 * Underline plugin
 * @param {Editor|Viewer} editor - instance of Editor or Viewer
 */

export default function underline(editor) {
  // add commands for editor
  const underlineButton = initUI(editor)

  initUIEvents(editor, underlineButton)
  editor.addCommand("wysiwyg", {
    name: "underline",
    exec(wwe) {
      const sq = wwe.getEditor()
      const isUnderlined = sq.hasFormat("U")
      const tableSelectionManager = wwe.componentManager.getManager(
        "tableSelection",
      )

      if (
        sq.hasFormat("table") &&
        tableSelectionManager.getSelectedCells().length
      ) {
        tableSelectionManager.styleToSelectedCells((squire) =>
          squire.underline(),
        )
      }
      if (isUnderlined) {
        sq.removeUnderline()
      } else {
        sq.underline()
      }
    },
  })

  editor.addCommand("markdown", {
    name: "underline",
    exec(md) {
      const cm = md.getEditor()
      const rangeFrom = md.getCursor("from")
      const rangeTo = md.getCursor("to")
      const selectedText = cm.getSelection()
      const { result, to } = applyUnderlineTag(selectedText)

      cm.replaceSelection(result)

      // move cursor
      const newStart = { line: rangeFrom.line, ch: rangeFrom.ch }
      const newEnd = {
        line: rangeTo.line,
        ch: rangeFrom.line === rangeTo.line ? rangeTo.ch + to : to,
      }

      cm.setSelection(newStart, newEnd)
      md.focus()
    },
  })
}
