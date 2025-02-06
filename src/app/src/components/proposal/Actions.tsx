import React from 'react';
import './Actions.css';

interface FunctionCallProps {
  receiver_id: string;
  method_name: string;
  args: string;
  deposit: number;
  gas: number;
}

interface ContextValueProps {
  key: number[];
  value: number[];
}

interface ApprovalsParams {
  num_approvals: number;
}

interface LimitParams {
  active_proposals_limit: number;
}

interface TransferParams {
  receiver_id: string;
  amount: number;
}

interface Action {
  scope: string;
  params:
    | LimitParams
    | TransferParams
    | ApprovalsParams
    | ContextValueProps
    | FunctionCallProps;
}

interface ActionsProps {
  actions: Action[];
}

interface GridListProps {
  columns: number;
  bgColor?: boolean;
  children: React.ReactNode; // Add children here
}

const GridList: React.FC<GridListProps> = ({ columns, bgColor, children }) => {
  return (
    <div
      className={`grid-list ${bgColor ? 'bg-color' : ''}`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      data-columns={columns}
    >
      {children}
    </div>
  );
};

export default function Actions({ actions }: ActionsProps) {
  const getColumnCount = (scope: string) => {
    switch (scope) {
      case 'Transfer':
      case 'SetContextValue':
        return 3;
      case 'SetActiveProposalsLimit':
      case 'SetNumApprovals':
        return 2;
      case 'ExternalFunctionCall':
        return 5;
      default:
        return 1;
    }
  };

  const renderActionContent = (action: Action) => {
    switch (action.scope) {
      case 'Transfer':
        return (
          <>
            <div>Scope</div>
            <div>Amount</div>
            <div>Receiver ID</div>
          </>
        );
      case 'SetContextValue':
        return (
          <>
            <div>Scope</div>
            <div>Key</div>
            <div>Value ID</div>
          </>
        );
      case 'SetActiveProposalsLimit':
        return (
          <>
            <div>Scope</div>
            <div>Active Proposals Limit</div>
          </>
        );
      case 'SetNumApprovals':
        return (
          <>
            <div>Scope</div>
            <div>Number of Approvals</div>
          </>
        );
      case 'ExternalFunctionCall':
        return (
          <>
            <div>Scope</div>
            <div>Receiver ID</div>
            <div>Method</div>
            <div>Deposit</div>
            <div>Gas</div>
          </>
        );
      default:
        return <div>Scope</div>;
    }
  };

  const renderActionValues = (action: Action) => {
    switch (action.scope) {
      case 'Transfer':
        const transferParams = action.params as TransferParams;
        return (
          <>
            <div>{action.scope}</div>
            <div>{transferParams.amount}</div>
            <div>{transferParams.receiver_id}</div>
          </>
        );
      case 'SetContextValue':
        const contextValueParams = action.params as ContextValueProps;
        return (
          <>
            <div>{action.scope}</div>
            <div>{String.fromCharCode(...contextValueParams.key)}</div>
            <div>{String.fromCharCode(...contextValueParams.value)}</div>
          </>
        );
      case 'SetActiveProposalsLimit':
        const limitParams = action.params as LimitParams;
        return (
          <>
            <div>{action.scope}</div>
            <div>{limitParams.active_proposals_limit}</div>
          </>
        );
      case 'SetNumApprovals':
        const approvalParams = action.params as ApprovalsParams;
        return (
          <>
            <div>{action.scope}</div>
            <div>{approvalParams.num_approvals}</div>
          </>
        );
      case 'ExternalFunctionCall':
        const functionParams = action.params as FunctionCallProps;
        return (
          <>
            <div>{action.scope}</div>
            <div>{functionParams.receiver_id}</div>
            <div>{functionParams.method_name}</div>
            <div>{functionParams.deposit}</div>
            <div>{functionParams.gas}</div>
          </>
        );
      default:
        return <div>{action.scope}</div>;
    }
  };

  return (
    <>
      <GridList columns={getColumnCount(actions[0].scope)} bgColor>
        {renderActionContent(actions[0])}
      </GridList>
      <div>
        {actions.map((action, index) => (
          <GridList key={index} columns={getColumnCount(action.scope)}>
            {renderActionValues(action)}
          </GridList>
        ))}
      </div>
    </>
  );
}
