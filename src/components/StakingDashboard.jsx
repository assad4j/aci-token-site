// StakingDashboard.jsx
import React from 'react';
import {
  useAccount,
  useConfig,
  useContractRead,
  useWaitForTransaction,
  useNetwork,
  useSwitchNetwork,
} from 'wagmi';
import { writeContract } from 'wagmi/actions';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatUnits, parseUnits } from 'viem';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// --- ERC20 ABI (lecture + approve)
const erc20Abi = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'allowance', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { name: 'symbol', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'approve', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ type: 'bool' }] },
];

// --- ACIStakingMulti ABI (multi-pools)
const stakingAbi = [
  { name: 'stakes', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }, { name: 'poolId', type: 'uint256' }], outputs: [{ name: 'amount', type: 'uint256' }, { name: 'lastUpdate', type: 'uint256' }, { name: 'depositTime', type: 'uint256' }] },
  { name: 'pendingRewards', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }, { name: 'poolId', type: 'uint256' }], outputs: [{ type: 'uint256' }] },
  { name: 'canWithdraw', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }, { name: 'poolId', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { name: 'stake', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'poolId', type: 'uint256' }, { name: 'amount', type: 'uint256' }], outputs: [] },
  { name: 'claim', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'poolId', type: 'uint256' }], outputs: [] },
  { name: 'withdraw', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'poolId', type: 'uint256' }, { name: 'amount', type: 'uint256' }], outputs: [] },
  { name: 'exit', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'poolId', type: 'uint256' }], outputs: [] },
];

export const ACI_TOKEN = '0x8257194Ae124EDEA0E434a3D1479e52C5a5C59C4';
export const STAKING   = '0xb151450F16Efef1F312D72E740Ca4b54698755cD';
export const CHAIN_ID  = 1;

// Min stake (ENV ou fallback)
const MIN_STAKE_STR = (import.meta?.env?.VITE_STAKING_MIN_AMOUNT ?? process.env.REACT_APP_STAKING_MIN_AMOUNT ?? '1000');

// Pools affichés
const POOL_CONFIG = [
  { id: 0, title: 'Pool 30 jours', subtitle: 'Blocage 30 jours', lockSeconds: 30 * 24 * 60 * 60 },
  { id: 1, title: 'Pool 6 mois',   subtitle: 'Blocage 6 mois',   lockSeconds: 6 * 30 * 24 * 60 * 60 },
  { id: 2, title: 'Pool 3 ans',    subtitle: 'Blocage 3 ans',    lockSeconds: 3 * 365 * 24 * 60 * 60 },
];

const MAX_ALLOWANCE = (2n ** 256n) - 1n;

export default function StakingDashboard() {
  const { address } = useAccount();
  const { chain }  = useNetwork();
  const { switchNetwork, isLoading: switching } = useSwitchNetwork();
  const config = useConfig();

  const [pendingHash, setPendingHash] = React.useState();
  const [txError, setTxError] = React.useState();
  const [refreshSignal, setRefreshSignal] = React.useState(0);
  const [isWriting, setIsWriting] = React.useState(false);
  const onMainnet = chain?.id === CHAIN_ID;

  // --- Décimales & symbol token
  const decimalsQuery = useContractRead({
    address: ACI_TOKEN, abi: erc20Abi, functionName: 'decimals',
    chainId: CHAIN_ID, enabled: true,
  });
  const symbolQuery = useContractRead({
    address: ACI_TOKEN, abi: erc20Abi, functionName: 'symbol',
    chainId: CHAIN_ID, enabled: true,
  });
  const decimals = React.useMemo(() => Number(decimalsQuery.data ?? 18), [decimalsQuery.data]);
  const symbol   = React.useMemo(() => (typeof symbolQuery.data === 'string' && symbolQuery.data) ? symbolQuery.data : 'ACI', [symbolQuery.data]);

  // --- Solde & allowance (uniquement si connecté + bon réseau)
  const canReadWallet = Boolean(address) && onMainnet;

  const walletBalanceQuery = useContractRead({
    address: ACI_TOKEN, abi: erc20Abi, functionName: 'balanceOf',
    args: [address ?? ZERO_ADDRESS],
    chainId: CHAIN_ID, enabled: canReadWallet, watch: canReadWallet,
  });
  const allowanceQuery = useContractRead({
    address: ACI_TOKEN, abi: erc20Abi, functionName: 'allowance',
    args: [address ?? ZERO_ADDRESS, STAKING],
    chainId: CHAIN_ID, enabled: canReadWallet, watch: canReadWallet,
  });

  const allowance     = allowanceQuery.data ?? 0n;
  const walletBalance = walletBalanceQuery.data ?? 0n;

  const fmt = React.useCallback((value) => {
    if (!value || value === 0n) return '0';
    try {
      const n = Number(formatUnits(value, decimals));
      return Number.isFinite(n) ? n.toLocaleString('fr-FR', { maximumFractionDigits: 4 }) : '0';
    } catch { return '0'; }
  }, [decimals]);

  // --- Min stake en wei (après décimales)
  const minStakeWei  = React.useMemo(() => {
    try { return parseUnits(String(MIN_STAKE_STR || '0'), decimals); } catch { return 0n; }
  }, [decimals]);
  const minStakeText = React.useMemo(() => {
    try { return Number(formatUnits(minStakeWei, decimals)).toLocaleString('fr-FR', { maximumFractionDigits: 4 }); }
    catch { return '0'; }
  }, [minStakeWei, decimals]);

  // --- Waiter
  const waitQuery = useWaitForTransaction({ hash: pendingHash, chainId: CHAIN_ID });
  const waiting = isWriting || waitQuery.isLoading;

  const refetchWallet = walletBalanceQuery.refetch;
  const refetchAllow  = allowanceQuery.refetch;

  React.useEffect(() => {
    if (waitQuery.isSuccess) {
      refetchWallet?.(); refetchAllow?.(); setRefreshSignal(v => v + 1);
    }
  }, [waitQuery.isSuccess, refetchWallet, refetchAllow]);

  // --- Exécuteur générique
  const execute = React.useCallback(async (txConfig) => {
    if (!config) return;
    try {
      setTxError(undefined);
      setIsWriting(true);
      const hash = await writeContract(config, { chainId: CHAIN_ID, ...txConfig });
      setPendingHash(hash);
      return hash;
    } catch (e) {
      console.error('tx error', e);
      setTxError(e);
      return;
    } finally {
      setIsWriting(false);
    }
  }, [config]);

  const handleAddToken = React.useCallback(async () => {
    if (!window?.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: { type: 'ERC20', options: { address: ACI_TOKEN, symbol, decimals } },
      });
    } catch (e) { setTxError(e); }
  }, [decimals, symbol]);

  const shortAddress = React.useMemo(() => address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Wallet non connecté', [address]);

  return (
    <section className="mt-16 space-y-8 rounded-3xl border border-white/15 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-balance">Mon portefeuille</h2>
          <p className="text-sm text-white/70">Adresse connectée : {shortAddress}</p>
          {address && (
            <button onClick={handleAddToken} className="inline-flex items-center gap-2 rounded-full border border-emerald-400/60 bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/30">
              Ajouter ACI à MetaMask
            </button>
          )}
        </div>
        <div className="flex flex-col items-start gap-2 text-left md:items-end md:text-right">
          <ConnectButton showBalance={false} chainStatus="icon" />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Solde wallet</p>
            <p className="text-2xl font-semibold text-emerald-300">
              {fmt(walletBalance)} {symbol}
            </p>
            <p className="text-xs text-white/60 mt-1">Min. à staker : {minStakeText} {symbol}</p>
            {!onMainnet && address && (
              <button
                onClick={() => switchNetwork?.(CHAIN_ID)}
                disabled={switching}
                className="mt-2 rounded-full bg-[#10b981] px-3 py-1 text-xs font-semibold text-black hover:bg-[#00fff7] disabled:opacity-60"
              >
                {switching ? 'Changement de réseau…' : 'Passer sur Ethereum Mainnet'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {POOL_CONFIG.map(pool => (
          <StakingPoolCard
            key={pool.id}
            pool={pool}
            address={address}
            onMainnet={onMainnet}
            allowance={allowance}
            decimals={decimals}
            symbol={symbol}
            fmt={fmt}
            waiting={waiting}
            refreshSignal={refreshSignal}
            minStakeWei={minStakeWei}
            walletBalance={walletBalance}
            execute={execute}
          />
        ))}
      </div>

      <div className="space-y-2 rounded-2xl border border-white/10 bg-black/40 p-6 text-sm leading-relaxed text-white/70">
        <p>Les récompenses sont en ACI et réclamables à tout moment.</p>
        <p>Le retrait du principal est possible après la durée choisie (pool).</p>
        <p>Un nouveau dépôt dans le même pool redémarre la période de blocage.</p>
      </div>

      {txError && <p className="text-sm text-rose-300">Erreur : {txError.message ?? 'Opération échouée'}</p>}
    </section>
  );
}

function StakingPoolCard({
  pool, address, onMainnet, decimals, symbol, allowance, fmt,
  waiting, refreshSignal, minStakeWei, walletBalance, execute,
}) {
  const [stakeAmount, setStakeAmount] = React.useState('');
  const [withdrawAmount, setWithdrawAmount] = React.useState('');

  const enabledReads = Boolean(address) && onMainnet;

  // --- Infos pool & utilisateur
  const stakeQuery = useContractRead({
    address: STAKING, abi: stakingAbi, functionName: 'stakes',
    args: [address ?? ZERO_ADDRESS, BigInt(pool.id)],
    chainId: CHAIN_ID, enabled: enabledReads, watch: enabledReads,
  });
  const rewardsQuery = useContractRead({
    address: STAKING, abi: stakingAbi, functionName: 'pendingRewards',
    args: [address ?? ZERO_ADDRESS, BigInt(pool.id)],
    chainId: CHAIN_ID, enabled: enabledReads, watch: enabledReads,
  });
  const canWithdrawQuery = useContractRead({
    address: STAKING, abi: stakingAbi, functionName: 'canWithdraw',
    args: [address ?? ZERO_ADDRESS, BigInt(pool.id)],
    chainId: CHAIN_ID, enabled: enabledReads, watch: enabledReads,
  });

  const staked      = stakeQuery.data ? (stakeQuery.data[0] ?? 0n) : 0n;
  const depositTime = stakeQuery.data ? Number(stakeQuery.data[2] ?? 0n) : 0;
  const rewards     = rewardsQuery.data ?? 0n;
  const canWithdraw = Boolean(canWithdrawQuery.data);

  React.useEffect(() => {
    if (refreshSignal > 0) {
      stakeQuery.refetch?.(); rewardsQuery.refetch?.(); canWithdrawQuery.refetch?.();
    }
  }, [refreshSignal]); // eslint-disable-line

  // --- Parsing des champs
  const stakeValue    = parseToUnits(stakeAmount, decimals);
  const withdrawValue = parseToUnits(withdrawAmount, decimals);

  // --- Garde-fous
  const amountProvided   = !!stakeValue;
  const meetsMinimum     = amountProvided && stakeValue >= minStakeWei;
  const enoughBalance    = amountProvided && walletBalance >= stakeValue;
  const needsApproval    = amountProvided && allowance < stakeValue;
  const canStakeAction   = onMainnet && address && meetsMinimum && enoughBalance && !needsApproval && !waiting;
  const canApproveAction = onMainnet && address && amountProvided && meetsMinimum && !waiting && needsApproval;

  // --- Handlers
  const onApprove = React.useCallback(() => {
    if (!address || !amountProvided) return Promise.resolve();
    return execute({ address: ACI_TOKEN, abi: erc20Abi, functionName: 'approve', args: [STAKING, MAX_ALLOWANCE] });
  }, [address, amountProvided, execute]);

  const onStake = React.useCallback(() => {
    if (!address || !stakeValue) return Promise.resolve();
    return execute({ address: STAKING, abi: stakingAbi, functionName: 'stake', args: [BigInt(pool.id), stakeValue] });
  }, [address, execute, pool.id, stakeValue]);

  const onClaim = React.useCallback(() => {
    if (!address) return Promise.resolve();
    return execute({ address: STAKING, abi: stakingAbi, functionName: 'claim', args: [BigInt(pool.id)] });
  }, [address, execute, pool.id]);

  const onWithdraw = React.useCallback(() => {
    if (!address || !withdrawValue) return Promise.resolve();
    return execute({ address: STAKING, abi: stakingAbi, functionName: 'withdraw', args: [BigInt(pool.id), withdrawValue] });
  }, [address, execute, pool.id, withdrawValue]);

  const onExit = React.useCallback(() => {
    if (!address) return Promise.resolve();
    return execute({ address: STAKING, abi: stakingAbi, functionName: 'exit', args: [BigInt(pool.id)] });
  }, [address, execute, pool.id]);

  // --- Déverrouillage (affichage)
  const now = React.useMemo(() => Math.floor(Date.now() / 1000), []);
  const unlockTs    = depositTime > 0 ? depositTime + pool.lockSeconds : 0;
  const secondsLeft = unlockTs > now ? unlockTs - now : 0;
  const countdown   = secondsLeft > 0 ? formatCountdown(secondsLeft) : 'Disponible';
  const statusLabel = canWithdraw ? 'Déverrouillé' : 'Verrouillé';

  // --- Aides contextuelles
  let disabledMsg = '';
  if (!onMainnet && address) disabledMsg = 'Passe sur Ethereum Mainnet.';
  else if (!address) disabledMsg = 'Connecte ton wallet.';
  else if (waiting) disabledMsg = 'Traitement en cours…';
  else if (amountProvided && !meetsMinimum) disabledMsg = `Montant ≥ min requis (${formatUnits(minStakeWei, decimals)} ${symbol}).`;
  else if (amountProvided && !enoughBalance) disabledMsg = 'Solde insuffisant.';
  else if (amountProvided && needsApproval) disabledMsg = 'Autorisation requise (Approve).';

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 p-5 shadow-inner shadow-black/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">Pool {pool.id}</p>
          <h3 className="text-lg font-semibold text-white">{pool.title}</h3>
          <p className="text-xs text-white/60">{pool.subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/60">Stake</p>
          <p className="text-xl font-semibold text-emerald-300">{fmt(staked)} {symbol}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Metric label="Récompenses" value={`${fmt(rewards)} ${symbol}`} />
        <Metric label="Statut" value={statusLabel} helper={secondsLeft > 0 ? `Déverrouillage dans ${countdown}` : 'Retrait possible'} />
        <Metric label="Dernier dépôt" value={depositTime > 0 ? new Date(depositTime * 1000).toLocaleString() : 'Aucun dépôt'} />
        <Metric label="Déverrouillage estimé" value={unlockTs > 0 ? new Date(unlockTs * 1000).toLocaleString() : '-'} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={stakeAmount}
          onChange={e => setStakeAmount(e.target.value)}
          placeholder={`Montant à staker (≥ ${formatUnits(minStakeWei, decimals)} ${symbol})`}
          className="rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/70"
        />
        <input
          value={withdrawAmount}
          onChange={e => setWithdrawAmount(e.target.value)}
          placeholder="Montant à retirer"
          className="rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/70"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onApprove}
          disabled={waiting || !amountProvided || !meetsMinimum || !onMainnet || !address || !needsApproval}
          className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-40"
        >
          Autoriser (Approve)
        </button>
        <button
          onClick={onStake}
          disabled={waiting || !canStakeAction}
          className="rounded-lg bg-emerald-500/70 px-3 py-2 text-sm font-medium text-black hover:bg-emerald-500 disabled:opacity-40"
        >
          Staker
        </button>
        <button
          onClick={onClaim}
          disabled={waiting || !address || !onMainnet}
          className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20 disabled:opacity-40"
        >
          Réclamer (Claim)
        </button>
        <button
          onClick={onWithdraw}
          disabled={waiting || !withdrawValue || !canWithdraw || !address || !onMainnet}
          className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20 disabled:opacity-40"
        >
          Retirer (Withdraw)
        </button>
        <button
          onClick={onExit}
          disabled={waiting || !canWithdraw || !address || !onMainnet}
          className="rounded-lg bg-rose-500/80 px-3 py-2 text-sm text-white hover:bg-rose-500 disabled:opacity-40"
        >
          Exit
        </button>

        {disabledMsg && (
          <span className="ml-auto text-xs text-rose-300">{disabledMsg}</span>
        )}
      </div>
    </article>
  );
}

function Metric({ label, value, helper }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs text-white/60">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
      {helper && <p className="mt-1 text-xs text-white/50">{helper}</p>}
    </div>
  );
}

function parseToUnits(value, decimals) {
  if (!value) return undefined;
  const cleaned = value.replace(',', '.').trim();
  if (!cleaned) return undefined;
  try {
    const parsed = parseUnits(cleaned, decimals);
    return parsed > 0n ? parsed : undefined;
  } catch { return undefined; }
}

function formatCountdown(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const parts = [];
  if (days > 0) parts.push(`${days}j`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 && parts.length === 0) parts.push(`${secs}s`);
  return parts.join(' ');
}
