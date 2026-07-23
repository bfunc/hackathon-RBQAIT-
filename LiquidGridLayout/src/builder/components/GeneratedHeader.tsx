import { useState } from "react";
import { PencilIcon } from "./icons";

export function GeneratedHeader({ prompt, onEdit }: { prompt: string; onEdit: () => void }) {
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <div className="builder-generated-header">
      <div className="builder-generated-header-row">
        <span className="builder-eyebrow">Generated view</span>
        <div className="builder-header-actions">
          <button type="button" className="builder-link" onClick={() => setShowPrompt((v) => !v)}>
            View source prompt
          </button>
          <button type="button" className="builder-edit-icon" aria-label="Edit prompt" onClick={onEdit}>
            <PencilIcon />
          </button>
        </div>
      </div>
      {showPrompt && <p className="builder-prompt-preview">"{prompt}"</p>}
    </div>
  );
}
