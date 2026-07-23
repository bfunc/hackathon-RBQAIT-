import { useEffect, useState } from "react";
import { SparkleIcon } from "./components/icons";

const STEPS = ["Analyzing prompt…", "Structuring data…", "Applying styling…"];

export function LoadingState() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 230);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="builder-loading">
      <div className="builder-loading-icon">
        <SparkleIcon />
      </div>
      <p className="builder-loading-text">{STEPS[step]}</p>
      <div className="builder-loading-bar">
        <div className="builder-loading-bar-fill" />
      </div>
    </div>
  );
}
