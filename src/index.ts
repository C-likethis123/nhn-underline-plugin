import "./css/index.css";

const PREFIX = "toastui-editor-";

function createToolbarItemOption() {
  return {
    name: "underline",
    tooltip: "Underline",
    className: `${PREFIX}toolbar-icons underline`,
    // text: "U",
    command: "underline",
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

/**
 * Color syntax plugin
 * @param {Object} context - plugin context for communicating with editor
 * @param {Object} options - options for plugin
 * @param {Array.<string>} [options.preset] - preset for color palette (ex: ['#181818', '#292929'])
 * @param {boolean} [options.useCustomSyntax=false] - whether use custom syntax or not
 */
export default function colorSyntaxPlugin(context, options = {}) {
  const { eventEmitter, i18n, usageStatistics = true, pmState } = context;

  eventEmitter.listen("focus", (editType) => {
    const containerClassName = `${PREFIX}${
      editType === "markdown" ? "md" : "ww"
    }-container`;

    currentEditorEl = document.querySelector<HTMLElement>(
      `.${containerClassName} .ProseMirror`
    )!;
  });

  const toolbarItem = createToolbarItemOption();

  return {
    markdownCommands: {
      underline: (payload, { tr, selection, schema }, dispatch) => {
        const slice = selection.content();
        const textContent = slice.content.textBetween(
          0,
          slice.content.size,
          "\n"
        );
        const openTag = `<span style="text-decoration: underline">`;
        const closeTag = `</span>`;
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
      },
    },
    wysiwygCommands: {
      underline: (payload, { tr, selection, schema }, dispatch) => {
        const { from, to } = selection;
        const attrs = { htmlAttrs: { style: `text-decoration: underline` } };
        const mark = schema.marks.span.create(attrs);

        tr.addMark(from, to, mark);
        dispatch!(tr);

        return true;
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
