import React from 'react';
import { ProposalData } from './CreateProposalPopup';
import './proposalsCSS/CrossContractCallForm.css'; // Import the CSS file

interface CrossContractCallFormProps {
  proposalForm: ProposalData;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleArgumentChange: (
    index: number,
    field: 'key' | 'value',
    value: string,
  ) => void;
  removeArgument: (index: number) => void;
  addArgument: () => void;
}

export default function CrossContractCallForm({
  proposalForm,
  handleInputChange,
  handleArgumentChange,
  removeArgument,
  addArgument,
}: CrossContractCallFormProps) {
  return (
    <>
      <div className="form-group">
        <label htmlFor="contractId">Contract ID</label>
        <input
          type="text"
          id="contractId"
          name="contractId"
          placeholder="contract address"
          value={proposalForm.contractId}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="methodName">Method Name</label>
        <input
          type="text"
          id="methodName"
          name="methodName"
          placeholder="create_post"
          value={proposalForm.methodName}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="deposit">Deposit</label>
        <input
          type="text"
          id="deposit"
          name="deposit"
          value={proposalForm.deposit}
          onChange={handleInputChange}
          placeholder="0"
          required
        />
      </div>
      <div className="form-group">
        <label>Arguments</label>
        <div className="scroll-wrapper">
          {proposalForm.arguments.map(
            (arg: { key: string; value: string }, index: number) => (
              <div className="argument-wrapper" key={index}>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="key"
                    value={arg.key}
                    onChange={(e) =>
                      handleArgumentChange(index, 'key', e.target.value)
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="value"
                    value={arg.value}
                    onChange={(e) =>
                      handleArgumentChange(index, 'value', e.target.value)
                    }
                    required
                  />
                </div>
                <button
                  className="button-sm"
                  type="button"
                  onClick={() => removeArgument(index)}
                >
                  Remove
                </button>
              </div>
            ),
          )}
        </div>
        <button className="button-sm" type="button" onClick={addArgument}>
          Add Argument
        </button>
      </div>
    </>
  );
}

