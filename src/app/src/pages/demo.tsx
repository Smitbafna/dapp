import {
  clearAppEndpoint,
  clearJWT,
  getAccessToken,
  getAppEndpointKey,
  getRefreshToken,
  NodeEvent,
  ResponseData,
  SubscriptionsClient,
} from '@calimero-is-near/calimero-p2p-sdk';
import React, { useEffect, useState, useRef } from 'react';
import '../styles/HomePage.css'; 
import {
  getWsSubscriptionsClient,
  LogicApiDataSource,
} from '../api/dataSource/LogicApiDataSource';
import {
  ApproveProposalRequest,
  ApproveProposalResponse,
  CreateProposalRequest,
  CreateProposalResponse,
  GetProposalMessagesRequest,
  GetProposalMessagesResponse,
  SendProposalMessageRequest,
  SendProposalMessageResponse,
  ProposalActionType,
  ExternalFunctionCallAction,
  TransferAction,
} from '../api/clientApi';
import { getContextId, getStorageApplicationId } from '../utils/node';
import {
  clearApplicationId,
  getJWTObject,
  getStorageExecutorPublicKey,
} from '../utils/storage';
import { useNavigate } from 'react-router-dom';
import { ContextApiDataSource } from '../api/dataSource/ContractApiDataSource';
import {
  ApprovalsCount,
  ContextVariables,
  ContractProposal,
} from '../api/contractApi';
import { Buffer } from 'buffer';
import bs58 from 'bs58';
import CreateProposalPopup, {
  ProposalData,
} from '../components/proposals/CreateProposalPopup';
import Actions from '../components/proposal/Actions';




export default function HomePage() {
  const navigate = useNavigate();
  const url = getAppEndpointKey();
  const applicationId = getStorageApplicationId();
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const [createProposalLoading, setCreateProposalLoading] = useState(false);
  const [proposals, setProposals] = useState<ContractProposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<ContractProposal>();
  const [selectedProposalApprovals, setSelectedProposalApprovals] = useState<
    null | number
  >(null);
  const [proposalCount, setProposalCount] = useState<number>(0);
  const [approveProposalLoading, setApproveProposalLoading] = useState(false);
  const [hasAlerted, setHasAlerted] = useState<boolean>(false);
  const lastExecutedProposalRef = useRef<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contextVariables, setContextVariables] = useState<ContextVariables[]>(
    [],
  );
  useEffect(() => {
    if (!url || !applicationId || !accessToken || !refreshToken) {
      navigate('/auth');
    }
  }, [accessToken, applicationId, navigate, refreshToken, url]);

  async function fetchProposalMessages(proposalId: String) {
    const params: GetProposalMessagesRequest = {
      proposal_id: proposalId,
    };
    const result: ResponseData<GetProposalMessagesResponse> =
      await new LogicApiDataSource().getProposalMessages(params);
    if (result?.error) {
      console.error('Error:', result.error);
      window.alert(`${result.error.message}`);
      return;
    }
  }

  async function sendProposalMessage(request: SendProposalMessageRequest) {
    const params: SendProposalMessageRequest = {
      proposal_id: request.proposal_id,
      message: {
        id: request.message.id,
        proposal_id: request.proposal_id,
        author: request.message.author,
        text: request.message.text,
        created_at: new Date().toISOString(),
      },
    };
    const result: ResponseData<SendProposalMessageResponse> =
      await new LogicApiDataSource().sendProposalMessage(params);
    if (result?.error) {
      console.error('Error:', result.error);
      window.alert(`${result.error.message}`);
      return;
    }
  }

  async function createProposal(formData: ProposalData) {
    setCreateProposalLoading(true);
    let request: CreateProposalRequest;

    try {
      console.log('Action type:', formData.actionType);

      switch (formData.actionType) {
        case 'Cross contract call': {
          const argsObject = formData.arguments.reduce(
            (acc, curr) => {
              if (curr.key && curr.value) {
                acc[curr.key] = curr.value;
              }
              return acc;
            },
            {} as Record<string, any>,
          );

          console.log(
            'Creating ExternalFunctionCall proposal with args:',
            argsObject,
          );

          request = {
            action_type: ProposalActionType.ExternalFunctionCall,
            params: {
              receiver_id: formData.contractId,
              method_name: formData.methodName,
              args: JSON.stringify(argsObject),
              deposit: formData.deposit || '0',
            },
          };

          console.log(
            'Final request structure:',
            JSON.stringify(request, null, 2),
          );
          break;
        }

        case 'Transfer': {
          request = {
            action_type: ProposalActionType.Transfer,
            params: {
              receiver_id: formData.receiverId,
              amount: formData.amount,
            },
          };
          break;
        }

        case 'Set context variable': {
          request = {
            action_type: ProposalActionType.SetContextValue,
            params: {
              key: formData.contextVariables[0].key,
              value: formData.contextVariables[0].value,
            },
          };
          break;
        }

        case 'Change number of approvals needed': {
          request = {
            action_type: ProposalActionType.SetNumApprovals,
            params: {
              num_approvals: Number(formData.minApprovals),
            },
          };
          break;
        }

        case 'Change number of maximum active proposals': {
          request = {
            action_type: ProposalActionType.SetActiveProposalsLimit,
            params: {
              active_proposals_limit: Number(formData.maxActiveProposals),
            },
          };
          break;
        }

        default:
          throw new Error('Invalid action type');
      }

      console.log('Request:', request);

      const result: ResponseData<CreateProposalResponse> =
        await new LogicApiDataSource().createProposal(request);

      if (result?.error) {
        console.error('Error:', result.error);
        window.alert(`${result.error.message}`);
        return;
      }

      if (result?.data) {
        window.alert(`Proposal created successfully`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error creating proposal:', error);
      window.alert(`Error creating proposal: ${error.message}`);
    } finally {
      setCreateProposalLoading(false);
    }
  }

  const getProposals = async () => {
    const result: ResponseData<ContractProposal[]> =
      await new ContextApiDataSource().getContractProposals({
        offset: 0,
        limit: 10,
      });
    if (result?.error) {
      console.error('Error:', result.error);
      setProposals([]);
    } else {
      // @ts-ignore - we know the data structure has a nested data property
      const proposalsData = result.data?.data || [];

      if (selectedProposal && proposals.length > 0) {
        const stillExists = proposalsData.some(
          (proposal: any) => proposal.id === selectedProposal.id,
        );

        if (
          !stillExists &&
          lastExecutedProposalRef.current !== selectedProposal.id
        ) {
          window.alert(`Proposal with id: ${selectedProposal.id} was executed`);
          lastExecutedProposalRef.current = selectedProposal.id;
          setSelectedProposal(undefined);
        }
      }

      setProposals(proposalsData);
    }
  };

  useEffect(() => {
    if (selectedProposal) {
      lastExecutedProposalRef.current = null;
    }
  }, [selectedProposal]);

  const [approvers, setApprovers] = useState<string[]>([]);

  const getApprovers = async () => {
    if (selectedProposal) {
      const result = await new ContextApiDataSource().getProposalApprovals(
        selectedProposal.id,
      );
      // @ts-ignore
      setApprovers(result?.data.data ?? []);
    }
  };

  const getProposalApprovals = async () => {
    if (selectedProposal) {
      const result: ResponseData<ApprovalsCount> =
        await new ContextApiDataSource().getProposalApprovals(
          selectedProposal?.id,
        );
      if (result?.error) {
        console.error('Error:', result.error);
      } else {
        // @ts-ignore
        setSelectedProposalApprovals(result.data.data.num_approvals);
      }
    }
  };

  async function getNumOfProposals() {
    const result: ResponseData<number> =
      await new ContextApiDataSource().getNumOfProposals();
    if (result?.error) {
      console.error('Error:', result.error);
    } else {
      // @ts-ignore
      setProposalCount(result.data);
    }
  }

  async function getContextVariables() {
    const result: ResponseData<ContextVariables[]> =
      await new ContextApiDataSource().getContextVariables();
    if (result?.error) {
      console.error('Error:', result.error);
    } else {
      // @ts-ignore
      setContextVariables(result.data);
    }
  }

  useEffect(() => {
    const setProposalData = async () => {
      await getProposalApprovals();
      await getProposals();
      await getNumOfProposals();
      await getApprovers();
    };
    setProposalData();
    const intervalId = setInterval(setProposalData, 5000);
    return () => clearInterval(intervalId);
  }, [selectedProposal]);

  async function approveProposal(proposalId: string) {
    setApproveProposalLoading(true);
    let request: ApproveProposalRequest = {
      proposal_id: proposalId,
    };

    const result: ResponseData<ApproveProposalResponse> =
      await new LogicApiDataSource().approveProposal(request);
    if (result?.error) {
      console.error('Error:', result.error);
      window.alert(`${result.error.message}`);
      setApproveProposalLoading(false);
      return;
    }
    setApproveProposalLoading(false);
    window.alert(`Proposal approved successfully`);
  }

  async function getContextDetails() {
    //TODO implement this function
  }

  async function getContextMembers() {
    //TODO implement this function
  }

  async function getContextMembersCount() {
    //TODO implement this function
  }

  // const observeNodeEvents = async () => {
  //   let subscriptionsClient: SubscriptionsClient = getWsSubscriptionsClient();
  //   await subscriptionsClient.connect();
  //   subscriptionsClient.subscribe([getContextId()]);

  //   subscriptionsClient?.addCallback((data: NodeEvent) => {
  //     if (data.data.events && data.data.events.length > 0) {
  //       let currentValue = String.fromCharCode(...data.data.events[0].data);
  //       let currentValueInt = isNaN(parseInt(currentValue))
  //         ? 0
  //         : parseInt(currentValue);
  //       console.log('currentValueInt', currentValueInt);
  //     }
  //   });
  // };

  // useEffect(() => {
  //   observeNodeEvents();
  // }, []);

  const deleteProposal = async (proposalId: string) => {
    try {
      // Decode the base58 proposal ID to bytes
      const bytes = bs58.decode(proposalId);
      // Convert to hex string
      const proposalIdHex = Buffer.from(bytes).toString('hex');

      const request: CreateProposalRequest = {
        action_type: ProposalActionType.DeleteProposal,
        params: {
          proposal_id: proposalIdHex,
        },
      };
      const result: ResponseData<CreateProposalResponse> =
        await new LogicApiDataSource().createProposal(request);

      if (result?.error) {
        console.error('Error:', result.error);
        window.alert(`${result.error.message}`);
        return;
      }

      if (result?.data) {
        window.alert(`Delete proposal created successfully`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error deleting proposal:', error);
      window.alert(`Error deleting proposal: ${error.message}`);
    }
  };

  const logout = () => {
    clearAppEndpoint();
    clearJWT();
    clearApplicationId();
    navigate('/auth');
  };

  // Add this helper function to check if current user is the author
  const isCurrentUserAuthor = (proposal: ContractProposal): boolean => {
    const currentUserKey = getJWTObject()?.executor_public_key;
    return proposal.author_id === currentUserKey;
  };

  return (
    <div className="full-page-center">
      <div className="text-style">
  <span>Blockchain proposals demo application</span>
</div>

<div className="context-variables-container">
        <div className="flex-container">
        <button className="button-sm" onClick={() => getContextVariables()}>
  Get Context Variables
</button>

        </div>
        <div className="flex-container context-variables">
          <h3 className="title">Context variables:</h3>
          {contextVariables.length > 0 ? (
            <div className="styled-table">
            <table>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {contextVariables.map((variable) => (
                  <tr key={variable.key}>
                    <td>{variable.key}</td>
                    <td>{variable.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          ) : (
            <div>No context variables</div>
          )}
        </div>
        </div>
      <div> Proposals </div>

      <button
  className="button-sm"
  onClick={() => setIsModalOpen(true)}
  disabled={createProposalLoading}
>
  {createProposalLoading ? 'Loading...' : 'Create new proposal'}
</button>


      {isModalOpen && (
        <CreateProposalPopup
          setIsModalOpen={setIsModalOpen}
          createProposal={createProposal}
        />
      )}
      <div className="proposals-wrapper">
        <div className="flex-container proposal-data">
          <h3 className="title">Number of proposals:</h3>
          <span>{proposalCount}</span>
        </div>
        <select
          value={selectedProposal ? selectedProposal.id : 'Select Proposal'}
          onChange={(e) =>
            setSelectedProposal(proposals.find((p) => p.id === e.target.value))
          }
          className="select-dropdown"
        >
          <option value="">Select a proposal</option>
          {proposals &&
            proposals.map((proposal) => (
              <option key={proposal.id} value={proposal.id}>
                {proposal.id}
              </option>
            ))}
        </select>
        {selectedProposal && (
          <div className="proposal-data">
            <div className="flex-container">
              <h3 className="title">Proposal ID:</h3>
              <span>{selectedProposal.id}</span>
            </div>
            <div className="flex-container">
              <h3 className="title">Author ID:</h3>
              <span>{selectedProposal.author_id}</span>
            </div>
            <div className="flex-container">
              <h3 className="title">Number of approvals:</h3>
              <span>{selectedProposalApprovals}</span>
            </div>
            <div className="">
              <h3 className="title">Approvers:</h3>
              {approvers.length !== 0 ? (
                approvers.map((a, i) => (
                  <>
                    <br />
                    <span key={a}>
                      {i + 1}. {a}
                    </span>
                  </>
                ))
              ) : (
                <span>No approvers</span>
              )}
            </div>
            <h3 className="title actions-title">Actions</h3>
            <Actions actions={selectedProposal.actions} />
            <div className="flex-container center">
            <button 
  className="button-sm" 
  onClick={() => approveProposal(selectedProposal.id)}
>
  {approveProposalLoading ? 'Loading...' : 'Approve proposal'}
</button>

<button 
  className="button-sm" 
  onClick={() => {
    fetchProposalMessages(selectedProposal.id);
  }}
>
  Get Messages
</button>

<button 
  className="button-sm" 
  onClick={() => {
    sendProposalMessage({
      proposal_id: selectedProposal.id,
      message: {
        id: 'test' + Math.random(),
        proposal_id: selectedProposal.id,
        author: getJWTObject()?.executor_public_key,
        text: 'test' + Math.random(),
        created_at: new Date().toISOString(),
      },
    } as SendProposalMessageRequest);
  }}
>
  Send Message
</button>

              {isCurrentUserAuthor(selectedProposal) && (
                <button 
                className="button-sm" 
                onClick={() => {
                  deleteProposal(selectedProposal.id);
                }}
              >
                Delete Proposal
              </button>
              
              )}
            </div>
          </div>
        )}
      </div>
      <button 
  className="logout-button" 
  onClick={logout}
>
  Logout
</button>

</div>
  );
}