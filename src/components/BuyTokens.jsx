import React, { useState } from 'react';
import {
  useAccount,
  useBalance,
  usePrepareContractWrite,
  useContractWrite,
  useNetwork,
  useSwitchNetwork,
} from 'wagmi';
import { parseEther } from 'ethers';
import presaleAbi from '../abis/presale.json';
import PageWrapper from '../components/PageWrapper';
import AlertBanner from './AlertBanner';
import { PRESALE_CONFIG, TARGET_CHAIN_MESSAGE } from '../config/presale';
import { useTranslation } from 'react-i18next';

const PRESALE_ADDRESS = PRESALE_CONFIG.contractAddress;

export default function BuyToken() {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const [ethValue, setEthValue] = useState('');
  const { chain } = useNetwork();
  const {
    switchNetwork,
    isLoading: isSwitchingNetwork,
    error: switchNetworkError,
  } = useSwitchNetwork({
    chainId: PRESALE_CONFIG.chainId,
  });
  const isOnTargetChain = !chain || chain?.id === PRESALE_CONFIG.chainId;

  const { config, error: prepareError } = usePrepareContractWrite({
    address: PRESALE_ADDRESS,
    abi: presaleAbi,
    functionName: 'buyTokens',
    chainId: PRESALE_CONFIG.chainId,
    overrides: ethValue
      ? { value: parseEther(ethValue) }
      : undefined,
    enabled:
      !!ethValue &&
      isConnected &&
      isOnTargetChain,
  });

  const {
    write: buyTokens,
    isLoading,
    error: txError,
  } = useContractWrite(config);
  const [feedback, setFeedback] = useState(null);

  const handleBuy = () => {
    setFeedback(null);

    if (!isConnected) {
      setFeedback({ type: 'error', message: t('alertConnectWallet') });
      return;
    }

    if (!isOnTargetChain) {
      setFeedback({
        type: 'error',
        message: t('alertWrongNetwork', { network: TARGET_CHAIN_MESSAGE }),
      });
      return;
    }

    if (!ethValue || isNaN(ethValue) || parseFloat(ethValue) <= 0) {
      setFeedback({ type: 'error', message: t('buyWidget.invalidAmount') });
      return;
    }

    if (parseFloat(ethValue) < PRESALE_CONFIG.minContributionEth) {
      setFeedback({
        type: 'error',
        message: t('alertMinContribution', { amount: PRESALE_CONFIG.minContributionEth }),
      });
      return;
    }

    if (parseFloat(ethValue) > PRESALE_CONFIG.maxContributionEth) {
      setFeedback({
        type: 'error',
        message: t('alertMaxContribution', { amount: PRESALE_CONFIG.maxContributionEth }),
      });
      return;
    }

    if (!buyTokens) {
      setFeedback({ type: 'error', message: t('buyWidget.contractNotReady') });
      return;
    }

    buyTokens(); // Appel de la fonction du smart contract
    setFeedback({
      type: 'success',
      message: t('buyWidget.txSent'),
    });
  };

  return (
    <PageWrapper>
      <div className="flex min-h-screen flex-col items-center justify-start gap-6 bg-black px-4 py-20 text-white sm:px-6">
        <div className="w-full max-w-3xl text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">{t('buyWidget.title')}</h1>
          <p className="mt-2 text-sm text-white/70 sm:text-base">
            {t('buyWidget.description')}
          </p>
        </div>

        {isConnected ? (
          <>
            <div className="w-full max-w-3xl rounded-2xl border border-yellow-400/40 bg-white/5 p-6 backdrop-blur">
              <div className="flex flex-col gap-2 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  {t('buyWidget.connectedLabel')}{' '}
                  <span className="font-semibold text-yellow-400 break-all">{address}</span>
                </p>
                <p>
                  {t('buyWidget.balanceLabel')}{' '}
                  <span className="font-semibold text-yellow-400">
                    {balance?.formatted} {balance?.symbol}
                  </span>
                </p>
              </div>

              {!isOnTargetChain && (
                <div className="mt-4 rounded-xl border border-red-500/40 bg-red-900/40 p-4 text-sm text-red-100">
                  <p className="mb-2">
                    {t('buyWidget.networkDetected')}{' '}
                    <span className="font-semibold">{chain?.name ?? t('buyWidget.unknownNetwork')}</span>
                  </p>
                  <p>{t('alertWrongNetwork', { network: TARGET_CHAIN_MESSAGE })}</p>
                  {switchNetwork && (
                    <button
                      onClick={() => switchNetwork(PRESALE_CONFIG.chainId)}
                      className="mt-3 inline-flex items-center justify-center rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
                      disabled={isSwitchingNetwork}
                    >
                      {isSwitchingNetwork ? t('networkSwitching') : t('networkSwitch')}
                    </button>
                  )}
                </div>
              )}

              <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="flex flex-col gap-2">
                  <label htmlFor="ethValue" className="text-sm font-medium text-white/80">
                    {t('buyWidget.amountLabel')}
                  </label>
                  <input
                    id="ethValue"
                    type="number"
                    min="0"
                    step="0.0001"
                    placeholder="0.00"
                    value={ethValue}
                    onChange={e => setEthValue(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-black/60 px-4 py-3 text-white focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
                  />
                  {prepareError && (
                    <AlertBanner
                      type="error"
                      message={prepareError.message}
                      className="mt-1"
                    />
                  )}
                </div>
                <button
                  onClick={handleBuy}
                  disabled={!buyTokens || isLoading || !isOnTargetChain}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-yellow-400 px-6 font-semibold text-black transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? t('buyWidget.txInProgress') : t('buy')}
                </button>
              </div>
            </div>

            {txError && (
              <AlertBanner
                type="error"
                message={txError.shortMessage || txError.message}
                className="mt-4 w-full max-w-3xl"
              />
            )}
            {feedback && (
              <AlertBanner
                type={feedback.type}
                message={feedback.message}
                className="w-full max-w-3xl"
              />
            )}
          </>
        ) : (
          <div className="w-full max-w-3xl rounded-2xl border border-white/20 bg-white/5 p-6 text-center text-sm text-white/80 sm:text-base">
            {t('buyWidget.connectPrompt')}
          </div>
        )}

        {switchNetworkError && (
          <AlertBanner
            type="error"
            message={switchNetworkError.shortMessage || switchNetworkError.message}
            className="text-sm"
          />
        )}
      </div>
    </PageWrapper>
  );
}
