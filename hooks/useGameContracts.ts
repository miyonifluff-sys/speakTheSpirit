'use client';

import { useGame } from '../context/GameContext';

export function useGameContracts() {
  const { userWallet, addLog, setCupcakes, setHasSwordOfTruth, setHasHolyWater } = useGame();

  const rescueSongbeastOnChain = async (beastId: string, decryptionProof: string) => {
    addLog(`Initiating blockchain transaction for beast ${beastId}...`, "system");
    
    // SIMULATION: In a real app, this is where wagmi/ethers would call a smart contract.
    return new Promise((resolve) => {
      setTimeout(() => {
        addLog(`Blockchain Verified: Proof ${decryptionProof.slice(0,8)}... accepted.`, "system");
        addLog(`Minted "Spirit Beast Ribbon" NFT to ${userWallet}`, "songbeast");
        setCupcakes(prev => prev + 10); // On-chain reward
        resolve({ success: true, txHash: "0xabc123..." });
      }, 2000);
    });
  };

  const purchaseItemOnChain = async (itemId: string, costInCupcakes: number) => {
    addLog(`Requesting on-chain purchase of ${itemId}...`, "system");

    return new Promise((resolve) => {
      setTimeout(() => {
        addLog(`Blockchain Transaction Confirmed: Spent ${costInCupcakes} Cupcakes.`, "shop");
        if (itemId === 'SWORD') setHasSwordOfTruth(true);
        if (itemId === 'WATER') setHasHolyWater(true);
        addLog(`Received ${itemId} NFT in wallet!`, "system");
        resolve({ success: true, txHash: "0xdef456..." });
      }, 1500);
    });
  };

  return { rescueSongbeastOnChain, purchaseItemOnChain };
}
