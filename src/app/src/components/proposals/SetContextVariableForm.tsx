import React from 'react';
import './proposalsCSS/SetContextVariableForm.css';  // Import the CSS file
import { ProposalData } from './CreateProposalPopup'; // No need to import FormGroup
interface SetContextVariableFormProps {
  proposalForm: ProposalData;
  handleContextVariableChange: (
    index: number,
    field: 'key' | 'value',
    value: string,
  ) => void;
  removeContextVariable: (index: number) => void;
  addContextVariable: () => void;
}

export default function SetContextVariableForm({
  proposalForm,
  handleContextVariableChange,
  removeContextVariable,
  addContextVariable,
}: SetContextVariableFormProps) {
  return (
    <>
      <div className="scroll-wrapper"> 
        {proposalForm.contextVariables.map(
          (variable: { key: string; value: string }, index: number) => (
            <div
              key={index}
              className="context-variable-container" 
            >
              <div className="form-group"> 
                <input
                  type="text"
                  placeholder="key"
                  value={variable.key}
                  onChange={(e) =>
                    handleContextVariableChange(index, 'key', e.target.value)
                  }
                  required
                />
              </div>
              <div className="form-group"> 
                <input
                  type="text"
                  placeholder="value"
                  value={variable.value}
                  onChange={(e) =>
                    handleContextVariableChange(index, 'value', e.target.value)
                  }
                  required
                />
              </div>
            </div>
          ),
        )}
      </div>
    </>
  );
}
