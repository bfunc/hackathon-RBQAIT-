// Tracks the widget type currently being dragged from the palette. RGL's
// onDropDragOver callback only receives the native DragEvent — dataTransfer
// payloads aren't reliably readable during dragover across browsers — so we
// stash the type here on dragstart instead, to size the drop preview per
// widget type (e.g. the AI builder needs more room than a text widget).
export const dragState: { type: string | null } = { type: null };
