/**
 * Taken from https://github.com/nhn/tui.editor/blob/master/libs/toastmark/types
 */
// eslint-disable-next-line prettier/prettier
import type { PluginContext, PluginInfo } from '@toast-ui/editor';

export type BlockNodeType =
  | "document"
  | "list"
  | "blockQuote"
  | "item"
  | "heading"
  | "thematicBreak"
  | "paragraph"
  | "codeBlock"
  | "htmlBlock"
  | "table"
  | "tableHead"
  | "tableBody"
  | "tableRow"
  | "tableCell"
  | "tableDelimRow"
  | "tableDelimCell"
  | "refDef"
  | "customBlock"
  | "frontMatter";

export type InlineNodeType =
  | "code"
  | "text"
  | "emph"
  | "strong"
  | "strike"
  | "link"
  | "image"
  | "htmlInline"
  | "linebreak"
  | "softbreak"
  | "customInline";

export type MdNodeType = BlockNodeType | InlineNodeType;

export type HTMLConvertor = (
  node: MdNode,
  context: Context,
  convertors?: HTMLConvertorMap
) => HTMLToken | HTMLToken[] | null;

export type HTMLConvertorMap = Partial<
  Record<MdNodeType | string, HTMLConvertor>
>;

interface RendererOptions {
  gfm: boolean;
  softbreak: string;
  nodeId: boolean;
  tagFilter: boolean;
  convertors?: HTMLConvertorMap;
}

interface Context {
  entering: boolean;
  leaf: boolean;
  options: Omit<RendererOptions, "convertors">;
  getChildrenText: (node: MdNode) => string;
  skipChildren: () => void;
  origin?: () => ReturnType<HTMLConvertor>;
}

export default function underlinePlugin(context: PluginContext): PluginInfo;
