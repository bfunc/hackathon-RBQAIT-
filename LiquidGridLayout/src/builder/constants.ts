// Single source of truth for the AI builder's default grid footprint —
// used both as the drop size (widgets/registry.tsx) and as the size it
// resets to when "Edit prompt" is used after the tile has been resized.
//
// minW is enforced as a hard floor only while the prompt form is showing
// (BuilderWidget relaxes it to a much smaller floor once a result renders,
// since generated content doesn't need nearly as much width as the Widget
// Type row does).
export const BUILDER_DEFAULT_SIZE = { w: 4, h: 12, minW: 4 };
