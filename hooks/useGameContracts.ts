'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useGame } from '../context/GameContext';
import { addLog } from '../utils/gameEvents';

// Real Contract Configuration Placeholder
const CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890' as `0x${string}`;

const GAME_CONTRACT_ABI = [
  {
    name: 'rescueSongbeast',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'beastId', type: 'string' },
      { name: 'decryptionProof', type: 'string' }
    ],
    outputs: [{ name: 'success', type: 'bool' }]
  },
  {
    name: 'purchaseItem',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'itemId', type: 'string' },
      { name: 'costInCupcakes', type: 'uint256' }
    ],
    outputs: [{ name: 'success', type: 'bool' }]
  }
] as const;

export function useGameContracts() {
  const { 
    userWallet, 
    setCupcakes, 
    setHasSwordOfTruth, 
    setHasHolyWater,
    setIsTransactionPending,
    setFeedback
  } = useGame();

  const { writeContractAsync } = useWriteContract();

  const [currentTxHash, setCurrentTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [pendingAction, setPendingAction] = useState<{
    type: 'rescue' | 'purchase';
    payload: any;
  } | null>(null);

  // Monitor the transaction receipt live on-chain
  const { data: receipt, isSuccess, isError, error: receiptError } = useWaitForTransactionReceipt({
    hash: currentTxHash,
  });

  // Handle successful transaction confirmations reactively
  useEffect(() => {
    if (isSuccess && receipt && pendingAction) {
      if (pendingAction.type === 'rescue') {
        const { beastId, decryptionProof } = pendingAction.payload;
        addLog(`Blockchain Verified: Proof ${decryptionProof.slice(0, 8)}... accepted.`, "system");
        addLog(`Minted "Spirit Beast Ribbon" NFT to ${userWallet}`, "songbeast");
        setCupcakes((prev) => prev + 10); // On-chain reward
      } else if (pendingAction.type === 'purchase') {
        const { itemId, costInCupcakes } = pendingAction.payload;
        addLog(`Blockchain Transaction Confirmed: Spent ${costInCupcakes} Cupcakes.`, "shop");
        if (itemId === 'SWORD') setHasSwordOfTruth(true);
        if (itemId === 'WATER') setHasHolyWater(true);
        addLog(`Received ${itemId} NFT in wallet!`, "system");
      }

      setIsTransactionPending(false);
      setPendingAction(null);
      setCurrentTxHash(undefined);
    }
  }, [isSuccess, receipt, pendingAction, userWallet, setCupcakes, setHasSwordOfTruth, setHasHolyWater, setIsTransactionPending]);

  // Handle on-chain reverted or failed transaction confirmation
  useEffect(() => {
    if (isError || receiptError) {
      addLog(`Transaction Failed on-chain!`, "system");
      const errMessage = receiptError?.message || "Contract transaction reverted on-chain.";
      setFeedback(`Transaction failed: ${errMessage}`);
      setIsTransactionPending(false);
      setPendingAction(null);
      setCurrentTxHash(undefined);
    }
  }, [isError, receiptError, setIsTransactionPending, setFeedback]);

  // General error handling for wallet rejections, insufficient funds, etc.
  const handleContractError = (err: any) => {
    console.error("Contract Transaction Error:", err);
    let friendlyMessage = "An unexpected transaction error occurred.";
    const errorMessage = err?.message || String(err);

    if (
      errorMessage.includes("UserRejectedRequestError") || 
      errorMessage.includes("User rejected the request") ||
      errorMessage.includes("User rejected") ||
      err?.code === 4001
    ) {
      friendlyMessage = "Wallet connection or transaction rejected by user.";
      addLog("Transaction Rejected: User declined the request in their wallet.", "system");
    } else if (
      errorMessage.includes("InsufficientFundsError") ||
      errorMessage.includes("insufficient funds") ||
      errorMessage.includes("exceeds the balance of the account")
    ) {
      friendlyMessage = "Insufficient funds in your wallet to cover the transaction or gas fees.";
      addLog("Transaction Failed: Insufficient funds.", "system");
    } else if (
      errorMessage.includes("ContractFunctionRevertedError") ||
      errorMessage.includes("revert") ||
      errorMessage.includes("reverted")
    ) {
      friendlyMessage = "Contract execution reverted. Please verify the game conditions.";
      addLog("Transaction Failed: Contract reverted.", "system");
    } else {
      friendlyMessage = `Transaction failed: ${err.shortMessage || err.message || "Unknown error"}`;
      addLog(`Transaction Error: ${friendlyMessage}`, "system");
    }

    setFeedback(friendlyMessage);
  };

  const rescueSongbeastOnChain = async (beastId: string, decryptionProof: string) => {
    addLog(`Initiating blockchain transaction for beast ${beastId}...`, "system");
    setFeedback("");
    setIsTransactionPending(true);

    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: GAME_CONTRACT_ABI,
        functionName: 'rescueSongbeast',
        args: [beastId, decryptionProof],
      });

      addLog(`Transaction submitted: ${hash.slice(0, 10)}... waiting for confirmation.`, "system");
      setPendingAction({ type: 'rescue', payload: { beastId, decryptionProof } });
      setCurrentTxHash(hash);

      return { success: true, txHash: hash };
    } catch (err: any) {
      setIsTransactionPending(false);
      handleContractError(err);
      return { success: false, error: err };
    }
  };

  const purchaseItemOnChain = async (itemId: string, costInCupcakes: number) => {
    addLog(`Requesting on-chain purchase of ${itemId}...`, "system");
    setFeedback("");
    setIsTransactionPending(true);

    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: GAME_CONTRACT_ABI,
        functionName: 'purchaseItem',
        args: [itemId, BigInt(costInCupcakes)],
      });

      addLog(`Transaction submitted: ${hash.slice(0, 10)}... waiting for confirmation.`, "system");
      setPendingAction({ type: 'purchase', payload: { itemId, costInCupcakes } });
      setCurrentTxHash(hash);

      return { success: true, txHash: hash };
    } catch (err: any) {
      setIsTransactionPending(false);
      handleContractError(err);
      return { success: false, error: err };
    }
  };

  return { rescueSongbeastOnChain, purchaseItemOnChain };
}
