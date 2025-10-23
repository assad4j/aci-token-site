import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  useAccount,
  useSwitchNetwork,
  useNetwork,
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  usePublicClient,
  useWalletClient,
} from 'wagmi';
import { formatEther, formatUnits, parseUnits, isAddress } from 'ethers';
import { useTranslation } from 'react-i18next';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import PageWrapper from '../components/PageWrapper';
import AlertBanner from '../components/AlertBanner';
import stakingAbi from '../abis/stakingAbi.json';
import erc20Abi from '../abis/erc20.json';
import { STAKING_CONFIG } from '../config/staking';

const STAKING_POOL_CAP = 50_000_000; // For percentage display

export default function StakingScreen() {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork, isLoading: isSwitchingNetwork } = useSwitchNetwork({
    chainId: STAKING_CONFIG.chainId,
  });

  const [stakeAmount, setStakeAmount] = useState('');
  const [status, setStatus] = useState(null);
  const [isAutoStaking, setIsAutoStaking] = useState(false);

  const stakingAddress = STAKING_CONFIG.contractAddress;
  const tokenAddress = STAKING_CONFIG.tokenAddress;

  const publicClient = usePublicClient({ chainId: STAKING_CONFIG.chainId });
  const { data: walletClient } = useWalletClient({ chainId: STAKING_CONFIG.chainId });

  const isStakingAddressValid = useMemo(
    () => Boolean(stakingAddress && isAddress(stakingAddress)),
    [stakingAddress]
  );
  const isTokenAddressValid = useMemo(
    () => Boolean(tokenAddress && isAddress(tokenAddress)),
    [tokenAddress]
  );

  const isMainnet = chain?.id === STAKING_CONFIG.chainId;
  const selectedPoolId = 0;

  const { data: stakeData, refetch: refetchStake } = useContractRead({
    address: isStakingAddressValid ? stakingAddress : undefined,
    abi: stakingAbi,
    functionName: 'stakes',
    args: address ? [address] : undefined,
    chainId: STAKING_CONFIG.chainId,
    query: {
      enabled: Boolean(address) && isStakingAddressValid,
    },
    watch: Boolean(address) && isStakingAddressValid,
  });

  const { data: pendingData, refetch: refetchPending } = useContractRead({
    address: isStakingAddressValid ? stakingAddress : undefined,
    abi: stakingAbi,
    functionName: 'getPendingRewards',
    args: address ? [address] : undefined,
    chainId: STAKING_CONFIG.chainId,
    query: {
      enabled: Boolean(address) && isStakingAddressValid,
    },
    watch: Boolean(address) && isStakingAddressValid,
  });

  const { data: rateData } = useContractRead({
    address: isStakingAddressValid ? stakingAddress : undefined,
    abi: stakingAbi,
    functionName: 'annualRate',
    chainId: STAKING_CONFIG.chainId,
    query: {
      enabled: isStakingAddressValid,
    },
  });

  const { data: lockPeriodData } = useContractRead({
    address: isStakingAddressValid ? stakingAddress : undefined,
    abi: stakingAbi,
    functionName: 'lockPeriod',
    chainId: STAKING_CONFIG.chainId,
    query: {
      enabled: isStakingAddressValid,
    },
  });

  const shouldReadTokenBalance =
    Boolean(address) && isTokenAddressValid && isMainnet;

  const {
    data: tokenDecimalsData,
    status: tokenDecimalsStatus,
    error: tokenDecimalsError,
  } = useContractRead({
    address: isTokenAddressValid ? tokenAddress : undefined,
    abi: erc20Abi,
    functionName: 'decimals',
    chainId: STAKING_CONFIG.chainId,
    query: {
      enabled: isTokenAddressValid,
    },
  });

  const {
    data: balanceData,
    status: balanceStatus,
    error: balanceError,
    refetch: refetchTokenBalance,
  } = useContractRead({
    address: shouldReadTokenBalance ? tokenAddress : undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: shouldReadTokenBalance ? [address] : undefined,
    chainId: STAKING_CONFIG.chainId,
    query: {
      enabled: shouldReadTokenBalance,
    },
    watch: shouldReadTokenBalance,
  });

  const {
    data: allowanceData,
    status: allowanceStatus,
    error: allowanceError,
    refetch: refetchAllowance,
  } = useContractRead({
    address: isTokenAddressValid ? tokenAddress : undefined,
    abi: erc20Abi,
    functionName: 'allowance',
    args:
      address && isTokenAddressValid && isStakingAddressValid
        ? [address, stakingAddress]
        : undefined,
    chainId: STAKING_CONFIG.chainId,
    query: {
      enabled: Boolean(address) && isTokenAddressValid && isStakingAddressValid && isMainnet,
    },
    watch: Boolean(address) && isTokenAddressValid && isStakingAddressValid && isMainnet,
  });

  const stakedWei = useMemo(() => {
    if (!stakeData) return 0n;
    if (typeof stakeData === 'object' && 'amount' in stakeData) {
      return stakeData.amount ?? 0n;
    }
    if (Array.isArray(stakeData)) {
      const amount = stakeData[0] ?? 0n;
      try {
        return typeof amount === 'bigint' ? amount : BigInt(amount);
      } catch {
        return 0n;
      }
    }
    return 0n;
  }, [stakeData]);

  const pendingWei = useMemo(() => {
    if (typeof pendingData === 'bigint') return pendingData;
    if (!pendingData) return 0n;
    try {
      return BigInt(pendingData);
    } catch {
      return 0n;
    }
  }, [pendingData]);

  const allowanceWei = useMemo(() => {
    if (typeof allowanceData === 'bigint') return allowanceData;
    if (!allowanceData) return 0n;
    try {
      return BigInt(allowanceData);
    } catch {
      return 0n;
    }
  }, [allowanceData]);

  const tokenDecimals = useMemo(() => {
    if (tokenDecimalsData == null) return 18;
    if (typeof tokenDecimalsData === 'number') return tokenDecimalsData;
    if (typeof tokenDecimalsData === 'bigint') return Number(tokenDecimalsData);
    const parsed = Number(tokenDecimalsData);
    return Number.isFinite(parsed) ? parsed : 18;
  }, [tokenDecimalsData]);

  const rawMinStr = useMemo(() => {
    let viteValue;
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      viteValue = import.meta.env.VITE_STAKING_MIN_AMOUNT;
    }
    return process.env.REACT_APP_STAKING_MIN_AMOUNT ?? viteValue ?? '0';
  }, []);

  const decimalsSafe = Number.isFinite(tokenDecimals) ? tokenDecimals : 18;

  const minStakeAmount = useMemo(() => {
    try {
      return parseUnits(String(rawMinStr || '0'), decimalsSafe);
    } catch {
      return 0n;
    }
  }, [rawMinStr, decimalsSafe]);

  const minStakeDisplay = useMemo(() => {
    try {
      const value = Number(formatUnits(minStakeAmount, decimalsSafe));
      if (!Number.isFinite(value)) return '0';
      return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
    } catch {
      return '0';
    }
  }, [minStakeAmount, decimalsSafe]);

  const amountWei = useMemo(() => {
    const input = (stakeAmount ?? '').replace(',', '.').trim();
    if (!input) return 0n;
    try {
      const value = parseUnits(input, decimalsSafe);
      return value > 0n ? value : 0n;
    } catch {
      return 0n;
    }
  }, [stakeAmount, decimalsSafe]);

  const amountProvided = amountWei > 0n;

  const amountBelowMinimum = amountProvided && amountWei < minStakeAmount;

  const meetsMinimum = amountProvided && amountWei >= minStakeAmount;

  const balanceWei = useMemo(() => {
    if (typeof balanceData === 'bigint') return balanceData;
    if (balanceData == null) return 0n;
    try {
      return BigInt(balanceData);
    } catch {
      return 0n;
    }
  }, [balanceData]);

  const formattedStaked = formatEther(stakedWei ?? 0n);
  const formattedPending = formatEther(pendingWei ?? 0n);
  const decimalReady = tokenDecimalsStatus === 'success' && tokenDecimalsError == null;
  const balanceReady = balanceStatus === 'success' && balanceError == null;
  const allowanceReady = allowanceStatus === 'success' && allowanceError == null;

  const hasSigner = Boolean(walletClient);

  const enoughBal = balanceReady ? balanceWei >= amountWei : false;
  const enoughAllow = allowanceReady ? allowanceWei >= amountWei : false;

  const requiresApproval = allowanceReady && !enoughAllow && amountWei > 0n;

  const formattedBalance =
    decimalReady && balanceReady
      ? formatUnits(balanceWei, decimalsSafe)
      : null;

  const hasMinStake = minStakeAmount > 0n;

  const canApprove =
    isMainnet &&
    hasSigner &&
    amountWei > 0n &&
    !amountBelowMinimum &&
    allowanceReady &&
    !enoughAllow;

  const canStake =
    isMainnet &&
    hasSigner &&
    amountWei > 0n &&
    !amountBelowMinimum &&
    balanceReady &&
    allowanceReady &&
    enoughBal &&
    enoughAllow;

  const approveReady = canApprove && Boolean(approveWriteAsync);
  const stakeReady = canStake && Boolean(stakeWriteAsync);

  const poolPercent = useMemo(() => {
    const staked = parseFloat(formattedStaked);
    if (!Number.isFinite(staked) || staked === 0) return '0.00';
    return ((staked / STAKING_POOL_CAP) * 100).toFixed(2);
  }, [formattedStaked]);

  const dailyRewards = useMemo(() => {
    const pending = parseFloat(formattedPending);
    if (!Number.isFinite(pending)) return '0.00';
    return (pending / 365).toFixed(2);
  }, [formattedPending]);

  const annualRatePercent = useMemo(() => {
    if (!rateData) return '0';
    const numeric = Number(rateData);
    if (!Number.isFinite(numeric)) return '0';
    return (numeric / 100).toFixed(2);
  }, [rateData]);

  const lockPeriodDays = useMemo(() => {
    if (!lockPeriodData) return 0;
    const seconds = Number(lockPeriodData);
    if (!Number.isFinite(seconds) || seconds === 0) return 0;
    return Math.floor(seconds / 86400);
  }, [lockPeriodData]);

  const formattedStakedDisplay = useMemo(() => {
    const numeric = Number(formattedStaked);
    if (!Number.isFinite(numeric)) return formattedStaked;
    return numeric.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }, [formattedStaked]);

  const formattedPendingDisplay = useMemo(() => {
    const numeric = Number(formattedPending);
    if (!Number.isFinite(numeric)) return formattedPending;
    return numeric.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }, [formattedPending]);

  const formattedBalanceDisplay = useMemo(() => {
    if (formattedBalance == null) return null;
    const numeric = Number(formattedBalance);
    if (!Number.isFinite(numeric)) return formattedBalance;
    return numeric.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }, [formattedBalance]);

  const shortAddress = useMemo(() => {
    if (!address) return null;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  const refetchAll = useCallback(() => {
    refetchStake?.();
    refetchPending?.();
    refetchAllowance?.();
    refetchTokenBalance?.();
  }, [refetchStake, refetchPending, refetchAllowance, refetchTokenBalance]);

  const { config: approveConfig } = usePrepareContractWrite({
    address: isTokenAddressValid ? tokenAddress : undefined,
    abi: erc20Abi,
    functionName: 'approve',
    args: amountWei > 0n && isStakingAddressValid ? [stakingAddress, amountWei] : undefined,
    chainId: STAKING_CONFIG.chainId,
    enabled:
      Boolean(address) &&
      isMainnet &&
      amountWei > 0n &&
      meetsMinimum &&
      isTokenAddressValid &&
      walletClient,
  });

  const {
    writeAsync: approveWriteAsync,
    data: approveTx,
    isLoading: approveSubmitting,
    error: approveError,
  } = useContractWrite(approveConfig);

  const { isLoading: approveMining } = useWaitForTransaction({
    hash: approveTx?.hash,
    enabled: Boolean(approveTx?.hash),
    onSuccess: () => {
      setStatus({ type: 'success', message: t('stakingApproveSuccess') });
      refetchAllowance?.();
    },
    onError: error => {
      setStatus({
        type: 'error',
        message: error?.shortMessage || error?.message || t('stakingError'),
      });
    },
  });

  const stakeEnabled =
    Boolean(address) &&
    isStakingAddressValid &&
    meetsMinimum &&
    enoughBal &&
    !requiresApproval &&
    isMainnet &&
    walletClient &&
    decimalReady &&
    allowanceReady &&
    balanceReady;

  const { config: stakeConfig } = usePrepareContractWrite({
    address: isStakingAddressValid ? stakingAddress : undefined,
    abi: stakingAbi,
    functionName: 'stake',
    args: stakeEnabled && amountWei > 0n ? [amountWei] : undefined,
    chainId: STAKING_CONFIG.chainId,
    enabled: stakeEnabled,
  });

  const {
    writeAsync: stakeWriteAsync,
    data: stakeTx,
    isLoading: stakeSubmitting,
    error: stakeError,
  } = useContractWrite(stakeConfig);

  const { isLoading: stakeMining } = useWaitForTransaction({
    hash: stakeTx?.hash,
    enabled: Boolean(stakeTx?.hash),
    onSuccess: () => {
      setStatus({ type: 'success', message: t('stakingStakeSuccess') });
      setStakeAmount('');
      refetchAll();
    },
    onError: error => {
      setStatus({
        type: 'error',
        message: error?.shortMessage || error?.message || t('stakingError'),
      });
    },
  });

  const { config: unstakeConfig } = usePrepareContractWrite({
    address: isStakingAddressValid ? stakingAddress : undefined,
    abi: stakingAbi,
    functionName: 'unstake',
    chainId: STAKING_CONFIG.chainId,
    enabled: Boolean(address) && isMainnet && isStakingAddressValid && stakedWei > 0n,
  });

  const {
    write: unstakeWrite,
    data: unstakeTx,
    isLoading: unstakeSubmitting,
    error: unstakeError,
  } = useContractWrite(unstakeConfig);

  const { isLoading: unstakeMining } = useWaitForTransaction({
    hash: unstakeTx?.hash,
    enabled: Boolean(unstakeTx?.hash),
    onSuccess: () => {
      setStatus({ type: 'success', message: t('stakingUnstakeSuccess') });
      refetchAll();
    },
    onError: error => {
      setStatus({
        type: 'error',
        message: error?.shortMessage || error?.message || t('stakingError'),
      });
    },
  });

  const { config: claimConfig } = usePrepareContractWrite({
    address: isStakingAddressValid ? stakingAddress : undefined,
    abi: stakingAbi,
    functionName: 'claimRewards',
    chainId: STAKING_CONFIG.chainId,
    enabled: Boolean(address) && isMainnet && isStakingAddressValid && pendingWei > 0n,
  });

  const {
    write: claimWrite,
    data: claimTx,
    isLoading: claimSubmitting,
    error: claimError,
  } = useContractWrite(claimConfig);

  const { isLoading: claimMining } = useWaitForTransaction({
    hash: claimTx?.hash,
    enabled: Boolean(claimTx?.hash),
    onSuccess: () => {
      setStatus({ type: 'success', message: t('stakingClaimSuccess') });
      refetchAll();
    },
    onError: error => {
      setStatus({
        type: 'error',
        message: error?.shortMessage || error?.message || t('stakingError'),
      });
    },
  });

  useEffect(() => {
    const errorSources = [approveError, stakeError, unstakeError, claimError];
    const firstError = errorSources.find(Boolean);
    if (firstError) {
      setStatus({
        type: 'error',
        message: firstError?.shortMessage || firstError?.message || t('stakingError'),
      });
    }
  }, [approveError, stakeError, unstakeError, claimError, t]);

  const handleStake = async () => {
    if (!address) {
      setStatus({ type: 'warning', message: t('stakingConnectPrompt') });
      return;
    }
    if (!isMainnet) {
      setStatus({ type: 'error', message: t('stakingNetworkMismatch') });
      return;
    }
    if (!decimalReady || !allowanceReady || !balanceReady) {
      setStatus({ type: 'info', message: t('stakingBalanceLoading') });
      return;
    }
    if (!amountProvided) {
      setStatus({ type: 'warning', message: t('stakingEnterAmount', { min: minStakeDisplay }) });
      return;
    }
    if (amountBelowMinimum) {
      setStatus({ type: 'warning', message: t('stakingEnterAmount', { min: minStakeDisplay }) });
      return;
    }
    if (!enoughBal) {
      setStatus({ type: 'warning', message: t('stakingInsufficientBalance') });
      return;
    }
    if (!publicClient) {
      setStatus({ type: 'error', message: t('stakingError') });
      return;
    }
    if (!walletClient) {
      setStatus({ type: 'error', message: t('stakingSignerMissing') });
      return;
    }
    if (![0, 1, 2].includes(selectedPoolId)) {
      setStatus({ type: 'error', message: t('stakingPoolInvalid') });
      return;
    }
    if (!approveReady && !stakeReady) {
      setStatus({ type: 'warning', message: t('stakingError') });
      return;
    }
    try {
      setIsAutoStaking(true);
      if (approveReady && !enoughAllow) {
        setStatus({ type: 'info', message: t('stakingApproving') });
        const approveTxResponse = await approveWriteAsync();
        await publicClient.waitForTransactionReceipt({ hash: approveTxResponse.hash });
        const allowanceResult = await refetchAllowance?.();
        const latestAllowance =
          allowanceResult && allowanceResult.data != null
            ? (() => {
                try {
                  return BigInt(allowanceResult.data);
                } catch {
                  return allowanceWei;
                }
              })()
            : allowanceWei;
        if (amountWei > (latestAllowance ?? 0n)) {
          throw new Error('Allowance still insufficient after approval.');
        }
        setStatus({ type: 'success', message: t('stakingApproveSuccess') });
        refetchTokenBalance?.();
        return;
      }
      if (!stakeReady) {
        throw new Error('Stake transaction not ready.');
      }
      setStatus({ type: 'info', message: t('stakingTxSubmitted') });
      const stakeTxResponse = await stakeWriteAsync();
      await publicClient.waitForTransactionReceipt({ hash: stakeTxResponse.hash });
      setStatus({ type: 'success', message: t('stakingStakeSuccess') });
      setStakeAmount('');
      refetchAll();
    } catch (error) {
      const message =
        error?.shortMessage ||
        error?.message ||
        (typeof error === 'string' ? error : null) ||
        t('stakingError');
      setStatus({ type: 'error', message });
    } finally {
      setIsAutoStaking(false);
    }
  };

  const handleUnstake = () => {
    if (!unstakeWrite || unstakeSubmitting || unstakeMining) return;
    setStatus({ type: 'info', message: t('stakingTxSubmitted') });
    unstakeWrite();
  };

  const handleClaim = () => {
    if (!claimWrite || claimSubmitting || claimMining) return;
    setStatus({ type: 'info', message: t('stakingTxSubmitted') });
    claimWrite();
  };

  const actionPending =
    approveSubmitting ||
    approveMining ||
    stakeSubmitting ||
    stakeMining ||
    isAutoStaking ||
    unstakeSubmitting ||
    unstakeMining ||
    claimSubmitting ||
    claimMining;

  const stakeButtonDisabled = actionPending || (!approveReady && !stakeReady);

  const stakeButtonLabel = actionPending
    ? t('stakingProcessing')
    : enoughAllow
      ? t('stakeButton')
      : t('stakingApproveButton');

  let disabledReasonKey = null;
  if (stakeButtonDisabled && !actionPending) {
    if (!address) disabledReasonKey = 'connect';
    else if (!isMainnet) disabledReasonKey = 'network';
    else if (!hasSigner || !publicClient) disabledReasonKey = 'signer';
    else if (!decimalReady || !balanceReady || !allowanceReady) disabledReasonKey = 'loading';
    else if (!amountProvided) disabledReasonKey = 'amount';
    else if (amountBelowMinimum) disabledReasonKey = 'amount';
    else if (!enoughBal) disabledReasonKey = 'balance';
    else if (canApprove && !approveReady) disabledReasonKey = 'loading';
    else if (canStake && !stakeReady) disabledReasonKey = 'loading';
  }

  const reasonMap = {
    connect: t('stakingConnectPrompt'),
    network: t('stakingNetworkMismatch'),
    signer: t('stakingSignerMissing'),
    loading: t('stakingBalanceLoading'),
    amount: t('stakingEnterAmount', { min: minStakeDisplay }),
    balance: t('stakingInsufficientBalance'),
    pending: t('stakingProcessing'),
  };

  const disabledReason = disabledReasonKey
    ? reasonMap[disabledReasonKey]
    : actionPending
      ? t('stakingProcessing')
      : null;

  const disabledReasonClass = (disabledReasonKey === 'loading' || (!disabledReasonKey && actionPending))
    ? 'text-emerald-300'
    : 'text-rose-400';

  const showApprovalPrompt = !stakeButtonDisabled && !enoughAllow && canApprove && !actionPending;

  useEffect(() => {
    const readyForAction = approveReady || stakeReady;

    const amountLog = amountWei.toString();
    const balanceLog = balanceReady ? balanceWei.toString() : String(balanceStatus);
    const allowanceLog = allowanceReady ? allowanceWei.toString() : String(allowanceStatus);

    console.info(
      `[ACI/Staking] chain=${chain?.id ?? 'n/a'} user=${address ?? 'n/a'} token=${STAKING_CONFIG.token} staking=${stakingAddress} pool=${selectedPoolId} amountWei=${amountLog} minWei=${minStakeAmount.toString()} bal=${balanceLog} allow=${allowanceLog} ready=${readyForAction}`
    );
  }, [
    chain?.id,
    address,
    stakingAddress,
    selectedPoolId,
    amountWei,
    minStakeAmount,
    balanceWei,
    balanceStatus,
    allowanceWei,
    allowanceStatus,
    approveReady,
    stakeReady,
    balanceReady,
    allowanceReady,
  ]);

  const configIssues = [];
  if (!isStakingAddressValid) configIssues.push(t('stakingConfigErrorContract'));
  if (tokenAddress && !isTokenAddressValid) configIssues.push(t('stakingConfigErrorToken'));

  const showConnectPrompt = !isConnected;
  const showWrongNetwork = isConnected && !isMainnet;

  return (
    <PageWrapper>
      <div className="min-h-screen px-4 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-6xl space-y-10">
          <header className="space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('stakingTitle')}
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-white/70 sm:text-base">
              {t('stakingDesc')}
            </p>
          </header>

          <section className="space-y-6 rounded-3xl border border-white/15 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1 text-balance">
                <h2 className="text-2xl font-semibold">Mon portefeuille</h2>
                <p className="text-sm text-white/70">
                  {shortAddress ?? t('stakingConnectPrompt')}
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 text-left md:items-end md:text-right">
                <ConnectButton chainStatus="icon" showBalance={false} />
                {address && (
                  <button
                    onClick={async () => {
                      if (typeof window === 'undefined' || !window.ethereum) return;
                      try {
                        await window.ethereum.request({
                          method: 'wallet_watchAsset',
                          params: {
                            type: 'ERC20',
                            options: {
                              address: tokenAddress,
                              symbol: tokenSymbol,
                              decimals: decimalsSafe,
                            },
                          },
                        });
                      } catch (error) {
                        console.warn('wallet_watchAsset error', error);
                      }
                    }}
                    className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/80 hover:bg-white/10"
                  >
                  Ajouter ACI
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs text-white/60">{t('stakingBalanceTitle')}</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">
                  {formattedBalanceDisplay ?? '0'} ACI
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs text-white/60">Allowance</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {allowanceReady ? Number(formatUnits(allowanceWei, decimalsSafe)).toLocaleString(undefined, { maximumFractionDigits: 4 }) : t('stakingBalanceLoading')}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs text-white/60">{t('statStakedTitle')}</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {formattedStakedDisplay} ACI
                </p>
              </div>
            </div>
          </section>

          <div className="mx-auto max-w-3xl space-y-3">
            {showConnectPrompt && <AlertBanner type="info" message={t('stakingConnectPrompt')} />}

            {showWrongNetwork && (
              <AlertBanner type="error">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>{t('stakingNetworkMismatch')}</span>
                  {switchNetwork && (
                    <button
                      onClick={() => switchNetwork?.(STAKING_CONFIG.chainId)}
                      disabled={isSwitchingNetwork || actionPending}
                      className="inline-flex items-center justify-center rounded-full bg-[#10b981] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#00fff7] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSwitchingNetwork ? t('networkSwitching') : t('networkSwitch')}
                    </button>
                  )}
                </div>
              </AlertBanner>
            )}

            {configIssues.map(issue => (
              <AlertBanner key={issue} type="error" message={issue} />
            ))}

            {status && <AlertBanner type={status.type} message={status.message} />}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="rounded-3xl border border-[#10b981]/40 bg-gradient-to-br from-[#10b981]/20 via-black/50 to-black/80 p-6 sm:p-8 shadow-2xl shadow-[#10b981]/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.45em] text-emerald-200/80">ACI</p>
                  <h2 className="mt-1 text-2xl font-semibold text-emerald-100">
                    {t('statStakedTitle')}
                  </h2>
                </div>
                {lockPeriodDays > 0 && (
                  <span className="rounded-full border border-[#10b981]/60 bg-black/30 px-4 py-1 text-xs text-emerald-200">
                    {t('stakingLockPeriod', { days: lockPeriodDays })}
                  </span>
                )}
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <HighlightCard
                  label={t('statStakedTitle')}
                  value={`${formattedStakedDisplay} ACI`}
                  sub={poolPercent ? t('statPoolPercentSub', { staked: formattedStakedDisplay }) : undefined}
                />
                <HighlightCard
                  label={t('statTotalRewardTitle')}
                  value={`${formattedPendingDisplay} ACI`}
                  sub={t('statCurrentRewardSub', { daily: dailyRewards })}
                />
                <HighlightCard
                  label={t('statRateTitle')}
                  value={`${annualRatePercent}%`}
                  sub={t('statRateSub', { rate: annualRatePercent })}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-[#10b981]/30 bg-black/70 p-6 shadow-xl shadow-[#10b981]/10">
              <h3 className="text-lg font-semibold text-emerald-200 text-balance">
                {t('stakingBalanceTitle')}
              </h3>
              <p className="mt-2 text-sm text-white/70 leading-relaxed text-balance">
                {formattedBalanceDisplay != null
                  ? t('stakingBalanceValue', { balance: formattedBalanceDisplay })
                  : balanceStatus === 'pending' || tokenDecimalsStatus === 'pending'
                    ? t('stakingBalanceLoading')
                    : t('stakingBalanceUnknown')}
              </p>
              {hasMinStake && (
                <p className="mt-1 text-xs text-white/50 leading-relaxed">
                  {t('stakingMinLabel', { min: minStakeDisplay })}
                </p>
              )}

              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={handleClaim}
                  disabled={!claimWrite || actionPending || pendingWei === 0n}
                  className="w-full rounded-full bg-[#10b981] px-5 py-2 text-sm font-semibold text-black transition hover:bg-[#00fff7] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {claimSubmitting || claimMining ? t('stakingProcessing') : t('claimButton')}
                </button>
                <button
                  onClick={handleUnstake}
                  disabled={!unstakeWrite || actionPending || stakedWei === 0n}
                  className="w-full rounded-full bg-transparent px-5 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/10 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50 border border-emerald-300/60"
                >
                  {unstakeSubmitting || unstakeMining ? t('stakingProcessing') : t('unstakeButton')}
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <StatCard
              title={t('statPoolPercentTitle')}
              value={`${poolPercent}%`}
              sub={t('statPoolPercentSub', { staked: formattedStakedDisplay })}
            />
            <StatCard
              title={t('statCurrentRewardTitle')}
              value={t('statCurrentRewardSub', { daily: dailyRewards })}
            />
            <StatCard
              title={t('statTotalRewardTitle')}
              value={t('statTotalRewardSub', { pending: formattedPendingDisplay })}
            />
          </div>

          <div className="rounded-3xl border border-[#10b981]/30 bg-black/70 p-6 sm:p-8 shadow-xl shadow-[#10b981]/10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-balance">
                <h3 className="text-2xl font-semibold text-emerald-200">
                  {t('stakeButton')}
                </h3>
                <p className="mt-1 text-sm text-white/60 leading-relaxed">
                  {t('stakingDesc')}
                </p>
              </div>
              {hasMinStake && (
                <span className="rounded-full border border-[#10b981]/50 px-4 py-1 text-xs text-emerald-200">
                  {t('stakingMinNotice', { min: minStakeDisplay })}
                </span>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <input
                type="number"
                min="0"
                step="0.0001"
                placeholder="0.00"
                value={stakeAmount}
                onChange={e => setStakeAmount(e.target.value)}
                disabled={!isConnected || actionPending}
                className="flex-1 rounded-2xl border border-white/15 bg-black/60 px-5 py-3 text-sm text-white placeholder-white/40 shadow-inner focus:border-[#10b981] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={handleStake}
                  disabled={stakeButtonDisabled}
                  className="w-full rounded-full bg-[#10b981] px-5 py-2 text-sm font-semibold text-black transition hover:bg-[#00fff7] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {stakeButtonLabel}
                </button>
              </div>
            </div>
            {stakeButtonDisabled && disabledReason && (
              <p className={`mt-2 text-xs ${disabledReasonClass}`}>{disabledReason}</p>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

function StatCard({ title, value, sub }) {
  return (
    <div className="min-w-0 rounded-3xl border border-[#10b981]/25 bg-black/60 p-6 shadow-lg shadow-[#10b981]/15">
      <p className="text-xs uppercase tracking-[0.18em] text-emerald-200/80">{title}</p>
      <p className="mt-3 text-2xl font-semibold text-white break-words">{value}</p>
      {sub && <p className="mt-2 text-sm text-white/60 leading-relaxed break-words">{sub}</p>}
    </div>
  );
}

function HighlightCard({ label, value, sub }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#10b981]/35 bg-black/60 px-5 py-4 shadow-lg shadow-[#10b981]/10">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80 text-balance">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-white break-words">
        {value}
      </p>
      {sub && (
        <p className="mt-2 text-xs text-white/60 leading-relaxed break-words text-balance">
          {sub}
        </p>
      )}
    </div>
  );
}
