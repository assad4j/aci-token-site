import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
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
import { formatUnits, parseUnits, isAddress } from 'ethers';
import { useTranslation } from 'react-i18next';
import PageWrapper from '../components/PageWrapper';
import AlertBanner from '../components/AlertBanner';
import stakingAbi from '../abis/stakingAbi.json';
import erc20Abi from '../abis/erc20.json';
import { STAKING_CONFIG } from '../config/staking';

const STAKING_POOL_CAP = 12_000_000_000; // For percentage display

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
  const poolCapDisplay = useMemo(
    () => STAKING_POOL_CAP.toLocaleString(undefined, { maximumFractionDigits: 0 }),
    []
  );

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
    data: contractBalanceData,
    status: contractBalanceStatus,
    error: contractBalanceError,
  } = useContractRead({
    address: isTokenAddressValid ? tokenAddress : undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: isTokenAddressValid && isStakingAddressValid ? [stakingAddress] : undefined,
    chainId: STAKING_CONFIG.chainId,
    query: {
      enabled: isTokenAddressValid && isStakingAddressValid,
    },
    watch: isTokenAddressValid && isStakingAddressValid,
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

  const contractBalanceWei = useMemo(() => {
    if (typeof contractBalanceData === 'bigint') return contractBalanceData;
    if (contractBalanceData == null) return 0n;
    try {
      return BigInt(contractBalanceData);
    } catch {
      return 0n;
    }
  }, [contractBalanceData]);

  const formattedStaked = useMemo(() => {
    try {
      return formatUnits(stakedWei ?? 0n, decimalsSafe);
    } catch {
      return '0';
    }
  }, [stakedWei, decimalsSafe]);

  const formattedPending = useMemo(() => {
    try {
      return formatUnits(pendingWei ?? 0n, decimalsSafe);
    } catch {
      return '0';
    }
  }, [pendingWei, decimalsSafe]);
  const decimalReady = tokenDecimalsStatus === 'success' && tokenDecimalsError == null;
  const balanceReady = balanceStatus === 'success' && balanceError == null;
  const allowanceReady = allowanceStatus === 'success' && allowanceError == null;
  const contractBalanceReady =
    contractBalanceStatus === 'success' && contractBalanceError == null;

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

  const poolPercent = useMemo(() => {
    const stakedNumeric = Number(formattedStaked);
    if (!Number.isFinite(stakedNumeric) || STAKING_POOL_CAP <= 0) return '0.00';
    return ((stakedNumeric / STAKING_POOL_CAP) * 100).toFixed(2);
  }, [formattedStaked]);

  const dailyRewards = useMemo(() => {
    const pending = parseFloat(formattedPending);
    if (!Number.isFinite(pending)) return '0.00';
    return (pending / 365).toFixed(2);
  }, [formattedPending]);

  const annualRateValue = useMemo(() => {
    if (rateData == null) return 0;
    const numeric = Number(rateData);
    if (!Number.isFinite(numeric)) return 0;
    return numeric / 100;
  }, [rateData]);

  const annualRateDisplay = useMemo(
    () => annualRateValue.toFixed(2),
    [annualRateValue]
  );

  const threeYearRateDisplay = useMemo(
    () => (annualRateValue * 3).toFixed(2),
    [annualRateValue]
  );

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

  const contractBalanceDisplay = useMemo(() => {
    if (!contractBalanceReady) return '0';
    try {
      const numeric = Number(formatUnits(contractBalanceWei, decimalsSafe));
      if (!Number.isFinite(numeric)) return '0';
      return numeric.toLocaleString(undefined, { maximumFractionDigits: 4 });
    } catch {
      return '0';
    }
  }, [contractBalanceReady, contractBalanceWei, decimalsSafe]);

  const rewardHighlightSub = useMemo(() => {
    const parts = [t('statCurrentRewardSub', { daily: dailyRewards })];
    if (contractBalanceReady) {
      parts.push(t('statContractBalanceSub', { balance: contractBalanceDisplay }));
    }
    return parts.join(' • ');
  }, [t, dailyRewards, contractBalanceReady, contractBalanceDisplay]);

  const balanceTokenValue = useMemo(() => formattedBalance ?? null, [formattedBalance]);

  const allowanceTokenValue = useMemo(() => {
    if (!allowanceReady) return null;
    try {
      return formatUnits(allowanceWei, decimalsSafe);
    } catch {
      return null;
    }
  }, [allowanceReady, allowanceWei, decimalsSafe]);

  const stakedTokenValue = useMemo(() => formattedStaked, [formattedStaked]);

  const formatToken = useCallback((value) => {
    if (value == null || value === '') return '0 ACI';
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      const formatted = numeric.toLocaleString(undefined, { maximumFractionDigits: 4 });
      return `${formatted.replace(/\s/g, '\u202f')}\u202fACI`;
    }
    return `${String(value).replace(/\s/g, '\u202f')}\u202fACI`;
  }, []);

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

  const approveReady = canApprove && Boolean(approveWriteAsync);
  const stakeReady = canStake && Boolean(stakeWriteAsync);

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

  const hasLiquidityIssue =
    contractBalanceReady && pendingWei > 0n && contractBalanceWei < pendingWei;

  const showConnectPrompt = !isConnected;
  const showWrongNetwork = isConnected && !isMainnet;

  return (
    <PageWrapper>
      <div className="min-h-screen px-4 pt-6 pb-16 text-white sm:px-8 sm:pt-8 lg:pt-10">
        <div className="mx-auto max-w-6xl space-y-10">
          <header className="space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('stakingTitle')}
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-white/70 sm:text-base">
              {t('stakingDesc')}
            </p>
          </header>

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

            {hasLiquidityIssue && (
              <AlertBanner
                type="warning"
                message={t('stakingContractBalanceWarning', { balance: contractBalanceDisplay })}
              />
            )}

            {status && <AlertBanner type={status.type} message={status.message} />}
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-[#10b981]/40 bg-gradient-to-br from-[#10b981]/20 via-black/50 to-black/80 p-6 sm:p-8 shadow-2xl shadow-[#10b981]/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.45em] text-emerald-200/80">ACI</p>
                  <h2 className="mt-1 text-2xl font-semibold text-emerald-100">
                    {t('statStakedTitle')}
                  </h2>
                </div>
                <div className="flex flex-col items-start gap-3 sm:items-end">
                  <ConnectButton chainStatus="icon" accountStatus="address" showBalance={false} />
                  {lockPeriodDays > 0 && (
                    <span className="rounded-full border border-[#10b981]/60 bg-black/30 px-4 py-1 text-xs text-emerald-200">
                      {t('stakingLockPeriod', { days: lockPeriodDays })}
                    </span>
                  )}
                </div>
              </div>
              {isConnected && (
                <div className="mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
                  <MiniStat title="Solde ACI disponible" value={formatToken(balanceTokenValue)} />
                  <MiniStat title="Allowance" value={formatToken(allowanceTokenValue)} />
                  <MiniStat title="Solde staké" value={formatToken(stakedTokenValue)} />
                </div>
              )}
              <div className="mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
                <HighlightCard
                  label={t('statStakedTitle')}
                  value={`${formattedStakedDisplay} ACI`}
                  sub={
                    poolPercent
                      ? t('statPoolPercentSub', {
                          staked: formattedStakedDisplay,
                          cap: poolCapDisplay,
                        })
                      : undefined
                  }
                />
                <HighlightCard
                  label={t('statTotalRewardTitle')}
                  value={`${formattedPendingDisplay} ACI`}
                  sub={rewardHighlightSub}
                />
                <HighlightCard
                  label={t('statRateTitle')}
                  value={`${annualRateDisplay}%`}
                  sub={t('statRateSub', {
                    rateYear: annualRateDisplay,
                    rateThree: threeYearRateDisplay,
                  })}
                />
              </div>
              <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-[#10b981]/35 bg-black/60 px-6 py-6 text-center shadow-lg shadow-[#10b981]/10">
                <div>
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
                </div>
                <div className="w-full max-w-md flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    onClick={handleClaim}
                    disabled={!claimWrite || actionPending || pendingWei === 0n}
                    className="w-full rounded-full bg-[#10b981] px-5 py-2 text-sm font-semibold text-black transition hover:bg-[#00fff7] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {claimSubmitting || claimMining ? t('stakingProcessing') : t('claimButton')}
                  </button>
                  <button
                    onClick={handleUnstake}
                    disabled={!unstakeWrite || actionPending || stakedWei === 0n}
                    className="w-full rounded-full border border-emerald-300/60 bg-transparent px-5 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/10 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {unstakeSubmitting || unstakeMining ? t('stakingProcessing') : t('unstakeButton')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <StatCard
              title={t('statPoolPercentTitle')}
              value={`${poolPercent}%`}
              sub={t('statPoolPercentSub', {
                staked: formattedStakedDisplay,
                cap: poolCapDisplay,
              })}
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
    <div className="min-w-0 rounded-3xl border border-[#10b981]/25 bg-black/60 px-5 py-4 shadow-lg shadow-[#10b981]/15">
      <p className="text-[0.55rem] sm:text-[0.6rem] uppercase tracking-[0.24em] text-emerald-200/80 text-balance">
        {title}
      </p>
      <p className="mt-2 text-xs sm:text-sm font-semibold text-white break-words whitespace-nowrap">
        {value}
      </p>
      {sub && (
        <p className="mt-1 text-[0.65rem] sm:text-[0.7rem] text-white/60 leading-relaxed break-words text-balance">
          {sub}
        </p>
      )}
    </div>
  );
}

function HighlightCard({ label, value, sub }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#10b981]/35 bg-black/60 px-5 py-4 shadow-lg shadow-[#10b981]/10">
      <p className="text-[0.55rem] sm:text-[0.6rem] uppercase tracking-[0.24em] text-emerald-200/80 text-balance">
        {label}
      </p>
      <p className="mt-2 text-xs sm:text-sm font-semibold text-white break-words whitespace-nowrap">
        {value}
      </p>
      {sub && (
        <p className="mt-1 text-[0.65rem] sm:text-[0.7rem] text-white/60 leading-relaxed break-words text-balance">
          {sub}
        </p>
      )}
    </div>
  );
}

function MiniStat({ title, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#10b981]/35 bg-black/60 px-5 py-4 shadow-lg shadow-[#10b981]/10">
      <p className="text-[0.55rem] sm:text-[0.6rem] uppercase tracking-[0.24em] text-emerald-200/80 text-balance">
        {title}
      </p>
      <p className="mt-2 text-xs sm:text-sm font-semibold text-white break-words whitespace-nowrap">
        {value}
      </p>
    </div>
  );
}
