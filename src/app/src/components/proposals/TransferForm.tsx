import React from 'react';
import { ProposalData } from './CreateProposalPopup'; // No need to import FormGroup
interface TransferFormProps {
  proposalForm: ProposalData;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}

export default function TransferForm({
  proposalForm,
  handleInputChange,
}: TransferFormProps) {
  return (
    <>
      <div className="form-group"> {/* Use form-group class instead of FormGroup */}
        <label htmlFor="receiverId">Receiver ID</label>
        <input
          type="text"
          id="receiverId"
          name="receiverId"
          placeholder="account address"
          value={proposalForm.receiverId}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="form-group"> {/* Use form-group class instead of FormGroup */}
        <label htmlFor="amount">Amount</label>
        <input
          type="text"
          id="amount"
          name="amount"
          placeholder="10"
          value={proposalForm.amount}
          onChange={handleInputChange}
          required
        />
      </div>
    </>
  );
}
