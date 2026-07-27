import React from 'react';
import './StepIndicator.css';

export interface Step {
  number: number;
  label: string;
}

export interface StepIndicatorProps {
  steps: Step[];
  currentStep: number; // 1-indexed
  onStepClick?: (stepNumber: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick
}) => {
  return (
    <div className="step-indicator">
      {steps.map((step, idx) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;

        return (
          <React.Fragment key={step.number}>
            <div
              className={`step-item ${isActive ? 'step-active' : ''} ${isCompleted ? 'step-completed' : ''}`}
              onClick={() => isCompleted && onStepClick && onStepClick(step.number)}
            >
              <div className="step-circle">{step.number}</div>
              <span className="step-label">{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`step-connector ${isCompleted ? 'connector-active' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
