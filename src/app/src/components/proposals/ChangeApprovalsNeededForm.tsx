import React from 'react';
import { ProposalData } from './CreateProposalPopup';
import './proposalsCSS/ChangeApprovalsNeededForm.css'; // Import the CSS file

interface ChangeApprovalsNeededFormProps {
  proposalForm: ProposalData;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}

export default function ChangeApprovalsNeededForm({
  proposalForm,
  handleInputChange,
}: ChangeApprovalsNeededFormProps) {
  return (
    <div className="form-group">
      <label htmlFor="minApprovals">Minimum Approvals Required</label>
      <input
        type="number"
        id="minApprovals"
        name="minApprovals"
        placeholder="2"
        value={proposalForm.minApprovals}
        onChange={handleInputChange}
        min="1"
        required
      />
    </div>
  );
}
