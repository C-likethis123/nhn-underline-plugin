import "./css/index.css";

const PREFIX = "toastui-editor-";

function createApplyButton(text) {
  const button = document.createElement("button");

  button.setAttribute("type", "button");
  button.textContent = text;

  return button;
}

function createToolbarItemOption(container) {
  return {
    name: "underline",
    tooltip: "Underline",
    className: `${PREFIX}toolbar-icons underline`,
    popup: {
      className: `${PREFIX}popup-underline`,
      body: container,
      style: { width: "auto" },
    },
  };
}

function createSelection(tr, selection, SelectionClass, openTag, closeTag) {
  const { mapping, doc } = tr;
  const { from, to, empty } = selection;
  const mappedFrom = mapping.map(from) + openTag.length;
  const mappedTo = mapping.map(to) - closeTag.length;

  return empty
    ? SelectionClass.create(doc, mappedTo, mappedTo)
    : SelectionClass.create(doc, mappedFrom, mappedTo);
}

let currentEditorEl;

// @TODO: add custom syntax for plugin
/**
 * Color syntax plugin
 * @param {Object} context - plugin context for communicating with editor
 * @param {Object} options - options for plugin
 * @param {Array.<string>} [options.preset] - preset for color palette (ex: ['#181818', '#292929'])
 * @param {boolean} [options.useCustomSyntax=false] - whether use custom syntax or not
 */
export default function colorSyntaxPlugin(context, options = {}) {
  const { eventEmitter, i18n, usageStatistics = true, pmState } = context;
  const container = document.createElement("div");

  const button = createApplyButton(i18n.get("OK"));

  eventEmitter.listen("focus", (editType) => {
    const containerClassName = `${PREFIX}${
      editType === "markdown" ? "md" : "ww"
    }-container`;

    currentEditorEl = document.querySelector<HTMLElement>(
      `.${containerClassName} .ProseMirror`
    )!;
  });

  container.addEventListener("click", (ev) => {
    console.log(ev);
    if ((ev.target as HTMLElement).getAttribute("type") === "button") {
      eventEmitter.emit("command", "color", { selectedColor: "blue" });
      eventEmitter.emit("closePopup");
      // force the current editor to focus for preventing to lose focus
      currentEditorEl.focus();
    }
  });

  container.appendChild(button);

  const toolbarItem = createToolbarItemOption(container);

  return {
    markdownCommands: {
      color: ({ selectedColor }, { tr, selection, schema }, dispatch) => {
        if (selectedColor) {
          const slice = selection.content();
          const textContent = slice.content.textBetween(
            0,
            slice.content.size,
            "\n"
          );
          const openTag = `<u style="color: ${selectedColor}`;
          const closeTag = `</u>`;
          const colored = `${openTag}${textContent}${closeTag}`;

          tr.replaceSelectionWith(schema.text(colored)).setSelection(
            createSelection(
              tr,
              selection,
              pmState.TextSelection,
              openTag,
              closeTag
            )
          );

          dispatch!(tr);

          return true;
        }
        return false;
      },
    },
    wysiwygCommands: {
      color: ({ selectedColor }, { tr, selection, schema }, dispatch) => {
        if (selectedColor) {
          const { from, to } = selection;
          const attrs = { htmlAttrs: { style: `text-decoration: underline` } };
          const mark = schema.marks.span.create(attrs);

          tr.addMark(from, to, mark);
          dispatch!(tr);

          return true;
        }
        return false;
      },
    },
    toolbarItems: [
      {
        groupIndex: 0,
        itemIndex: 3,
        item: toolbarItem,
      },
    ],
    toHTMLRenderers: {
      htmlInline: {
        // @ts-expect-error
        span(node: MdLikeNode, { entering }: Context) {
          return entering
            ? { type: "openTag", tagName: "span", attributes: node.attrs }
            : { type: "closeTag", tagName: "span" };
        },
      },
    },
  };
}
