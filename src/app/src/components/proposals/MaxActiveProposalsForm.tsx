import React from 'react';
import { ProposalData } from './CreateProposalPopup'; // No need to import FormGroup

interface MaxActiveProposalsFormProps {
  proposalForm: ProposalData;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}

export default function MaxActiveProposalsForm({
  proposalForm,
  handleInputChange,
}: MaxActiveProposalsFormProps) {
  return (
    <div className="form-group"> {/* Use the class directly instead of FormGroup */}
      <label htmlFor="maxActiveProposals">Maximum Active Proposals</label>
      <input
        type="number"
        id="maxActiveProposals"
        name="maxActiveProposals"
        placeholder="10"
        value={proposalForm.maxActiveProposals}
        onChange={handleInputChange}
        min="1"
        required
      />
    </div>
  );
}
