// src/pages/Home.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { parseEther } from 'ethers';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import AlertBanner from '../components/AlertBanner';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSendTransaction, useNetwork, useSwitchNetwork } from 'wagmi';
import { PRESALE_CONFIG, TARGET_CHAIN_MESSAGE } from '../config/presale';
import CoachIASection from '../components/CoachIASection';

export default function Home() {
  const { t } = useTranslation();
  const purchaseRef = useRef(null);

  const scrollToPurchase = () => {
    purchaseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const featureCards = t('homePage.featureCards', { returnObjects: true }) ?? [];
  const presalePoints = t('homePage.presalePoints', { returnObjects: true }) ?? [];
  const metaHighlights = t('homePage.metaCoach.highlights', { returnObjects: true }) ?? [];
  const unlockItems = t('homePage.unlock.items', { returnObjects: true }) ?? [];

  const [usdAmount, setUsdAmount] = useState('');
  const [ethAmount, setEthAmount] = useState('');
  const [aciReceived, setAciReceived] = useState(0);
  const [totalRaisedUsd, setTotalRaisedUsd] = useState(0);
  const [participantCount, setParticipantCount] = useState(null);
  const [statsUpdatedAt, setStatsUpdatedAt] = useState(null);
  const [statsStatus, setStatsStatus] = useState('idle');
  const [timeLeft, setTimeLeft] = useState({
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [ethToUsd, setEthToUsd] = useState(3000);

  const tokenPrice = 0.001; // USD par token
  const dollarToEur = 0.92;
  const maxGoalEur = 12000000;
  const totalRaisedEur = totalRaisedUsd * dollarToEur;
  const progressPercent = Math.min(
    100,
    maxGoalEur > 0 ? (totalRaisedEur / maxGoalEur) * 100 : 0
  );

  // ✅ Fin de prévente = aujourd'hui + 5 mois
  const presaleEnd = useMemo(() => {
    const end = new Date();
    end.setMonth(end.getMonth() + 5);
    end.setHours(23, 59, 59, 999);
    return end;
  }, []);

  const { isConnected } = useAccount();
  const { chain } = useNetwork();
  const {
    switchNetwork,
    isLoading: isSwitchingNetwork,
    error: switchNetworkError,
  } = useSwitchNetwork({
    chainId: PRESALE_CONFIG.chainId,
  });
  const isOnTargetChain =
    !chain || chain?.id === PRESALE_CONFIG.chainId;
  const { sendTransaction, isPending: isSendingTx, error: txError } = useSendTransaction();
  const [feedback, setFeedback] = useState(null);
  const statsEndpoint = PRESALE_CONFIG.statsEndpoint;
  const minContributionEth = PRESALE_CONFIG.minContributionEth;
  const maxContributionEth = PRESALE_CONFIG.maxContributionEth;

  const pad = value => String(Math.max(0, Math.floor(value))).padStart(2, '0');

  const countdownShort = useMemo(() => {
    const totalDays = Math.max(0, timeLeft.days + timeLeft.months * 30);
    return `${pad(totalDays)}j ${pad(timeLeft.hours)}h ${pad(timeLeft.minutes)}m`;
  }, [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.months]);

  const countdownWithSeconds = useMemo(() => {
    return `${countdownShort} ${pad(timeLeft.seconds)}s`;
  }, [countdownShort, timeLeft.seconds]);

  const formattedTokenPrice = useMemo(
    () =>
      tokenPrice.toLocaleString('fr-FR', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 6,
      }),
    [tokenPrice]
  );

  const raisedDisplay = useMemo(
    () =>
      totalRaisedEur.toLocaleString('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    [totalRaisedEur]
  );

  const goalDisplay = useMemo(
    () =>
      maxGoalEur.toLocaleString('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    [maxGoalEur]
  );

  const hasContractAddress = useMemo(() => {
    const address = PRESALE_CONFIG.contractAddress;
    if (!address) {
      return false;
    }
    return !/^0x0{40}$/i.test(address);
  }, []);

  const contractUrl = hasContractAddress
    ? `https://etherscan.io/address/${PRESALE_CONFIG.contractAddress}`
    : '#';

  // Timer de fin de prévente
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      let monthsDiff =
        (presaleEnd.getFullYear() - now.getFullYear()) * 12 +
        (presaleEnd.getMonth() - now.getMonth());

      const monthAnchor = new Date(now);
      monthAnchor.setDate(1);
      monthAnchor.setHours(0, 0, 0, 0);
      monthAnchor.setMonth(monthAnchor.getMonth() + monthsDiff);

      if (monthAnchor > presaleEnd) {
        monthsDiff = Math.max(0, monthsDiff - 1);
        monthAnchor.setMonth(monthAnchor.getMonth() - 1);
      }

      const anchor = new Date(monthAnchor);
      anchor.setDate(Math.min(
        presaleEnd.getDate(),
        new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate()
      ));
      anchor.setHours(
        presaleEnd.getHours(),
        presaleEnd.getMinutes(),
        presaleEnd.getSeconds(),
        presaleEnd.getMilliseconds()
      );

      const diff = Math.max(0, presaleEnd - anchor);

      setTimeLeft({
        months: monthsDiff,
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };

    tick(); // premier calcul immédiat
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [presaleEnd]);

  // Prix ETH → USD
  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        );
        const data = await res.json();
        setEthToUsd(data.ethereum.usd);
      } catch {
        console.error('Erreur récupération prix ETH');
      }
    }
    fetchPrice();
  }, []);

  // Conversion USD → ETH + calcul ACI reçu
  useEffect(() => {
    const numericUsd = parseFloat(usdAmount);
    if (!isNaN(numericUsd) && ethToUsd > 0) {
      const eth = (numericUsd / ethToUsd).toFixed(6);
      setEthAmount(eth);
      const aci = (numericUsd / tokenPrice).toFixed(0);
      setAciReceived(aci);
    } else {
      setEthAmount('');
      setAciReceived(0);
    }
  }, [usdAmount, ethToUsd]);

  // Chargement des métriques depuis l'API facultative
  useEffect(() => {
    if (!statsEndpoint) {
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function fetchStats() {
      setStatsStatus(prev => (prev === 'idle' ? 'loading' : prev));
      try {
        const res = await fetch(statsEndpoint, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        if (cancelled) return;

        if (typeof data.totalRaisedUsd === 'number') {
          setTotalRaisedUsd(data.totalRaisedUsd);
        }
        if (typeof data.totalParticipants === 'number') {
          setParticipantCount(data.totalParticipants);
        }
        if (data.lastUpdated) {
          setStatsUpdatedAt(new Date(data.lastUpdated).toISOString());
        }
        setStatsStatus('ready');
      } catch (error) {
        if (cancelled) return;
        console.error('Erreur chargement stats', error);
        setStatsStatus('error');
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 30000);

    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(interval);
    };
  }, [statsEndpoint]);

  const handlePurchase = async () => {
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
    if (!usdAmount || isNaN(parseFloat(usdAmount)) || parseFloat(usdAmount) <= 0) {
      setFeedback({ type: 'error', message: t('alertEnterValidAmount') });
      return;
    }
    if (parseFloat(ethAmount) < minContributionEth) {
      setFeedback({
        type: 'error',
        message: t('alertMinContribution', { amount: minContributionEth }),
      });
      return;
    }
    if (parseFloat(ethAmount) > maxContributionEth) {
      setFeedback({
        type: 'error',
        message: t('alertMaxContribution', { amount: maxContributionEth }),
      });
      return;
    }
    try {
      await sendTransaction({
        to: PRESALE_CONFIG.contractAddress,
        chainId: PRESALE_CONFIG.chainId,
        value: parseEther(ethAmount),
      });
      const numericUsd = parseFloat(usdAmount);
      if (Number.isFinite(numericUsd)) {
        setTotalRaisedUsd(prev => prev + numericUsd);
      }
      setFeedback({
        type: 'success',
        message: t('alertPurchaseSuccess', { amount: usdAmount, tokens: aciReceived }),
      });
    } catch (error) {
      console.error(error);
      setFeedback({
        type: 'error',
        message: error?.shortMessage || error?.message || 'Transaction annulée.',
      });
    }
  };

  const handlePurchaseAndStake = () => {
    if (!usdAmount || isNaN(parseFloat(usdAmount)) || parseFloat(usdAmount) <= 0) {
      setFeedback({ type: 'error', message: t('alertEnterValidAmount') });
      return;
    }
    setFeedback({
      type: 'info',
      message: t('alertBuyAndStake', { count: aciReceived, amount: usdAmount }),
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="pt-24 flex-grow w-full">
        <div className="sticky top-16 z-40 px-4">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 rounded-2xl border border-emerald-500/20 bg-black/70 px-4 py-3 text-white shadow-lg shadow-emerald-500/20 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
            <p className="text-sm leading-relaxed">
              <span className="font-semibold text-emerald-300">
                {t('homePage.ribbon.label')}
              </span>
              {t('homePage.ribbon.details', {
                price: formattedTokenPrice,
                countdown: countdownShort,
              })}
            </p>
            <button
              type="button"
              onClick={scrollToPurchase}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
            >
              {t('homePage.ribbon.cta')}
            </button>
          </div>
        </div>
        <PageWrapper>
          <section className="rounded-3xl border border-white/10 bg-black/70 px-6 py-16 shadow-2xl shadow-black/30">
            <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5 text-left text-white">
                <p className="text-xs uppercase tracking-[0.4em] text-emerald-200/80">
                  {t('homePage.hero.badge')}
                </p>
                <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
                  {t('homePage.hero.title')}
                </h1>
                <p className="text-base leading-relaxed text-white/70 sm:text-lg">
                  {t('homePage.hero.description')}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/80">
                    <span className="text-white/60">{t('homePage.hero.priceLabel')}</span>
                    <span className="font-semibold text-white">{formattedTokenPrice} $</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/80">
                    <span className="text-white/60">{t('homePage.hero.timeLabel')}</span>
                    <span className="font-semibold text-white">{countdownWithSeconds}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-white/60">
                    {t('homePage.hero.raised', {
                      raised: `${raisedDisplay} €`,
                      goal: `${goalDisplay} €`,
                    })}
                  </p>
                  <div className="h-[6px] w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/50">{t('homePage.hero.progressNote')}</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={scrollToPurchase}
                    className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
                  >
                    {t('buy')}
                  </button>
                  {hasContractAddress ? (
                    <a
                      href={contractUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white transition hover:border-emerald-400 hover:text-emerald-200"
                    >
                      {t('homePage.hero.contractCta')}
                    </a>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white/60">
                      {t('homePage.hero.contractPending')}
                    </span>
                  )}
                </div>

                <p className="text-xs text-white/50">{t('homePage.hero.disclaimer')}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/60 p-6 text-white shadow-xl shadow-black/40">
                <h2 className="text-lg font-semibold text-emerald-300">
                  {t('homePage.hero.whyTitle')}
                </h2>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/75">
                  {presalePoints.map(point => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-xs text-white/50">{t('homePage.hero.whyFooter')}</p>
              </div>
            </div>
          </section>

          <section ref={purchaseRef} className="mt-16">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-[#10b981]/30 bg-black/70 p-8 shadow-xl shadow-[#10b981]/15">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">
                  {t('homePage.purchase.badge')}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-balance text-white">
                  {t('homePage.purchase.title')}
                </h2>
                <p className="mt-4 text-sm text-white/70">
                  {t('presaleEnds', timeLeft)}
                </p>
                <p className="mt-1 text-sm text-white/60">
                  {t('priceInfo', { price: tokenPrice })}
                </p>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-xs text-white/60">
                    <span>{t('collectedLabel')}</span>
                    <span>
                      {t('raisedLabel', {
                        raised: totalRaisedEur.toLocaleString(),
                        goal: maxGoalEur.toLocaleString(),
                      })}
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#10b981]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-white/80">
                    {t('approxAciReceived', { count: Math.floor(totalRaisedUsd / tokenPrice) })}
                  </p>
                  {participantCount !== null && (
                    <p className="mt-1 text-xs text-white/60">
                      {t('participationLabel', { participants: participantCount })}
                    </p>
                  )}
                  {statsStatus === 'loading' && (
                    <p className="mt-2 text-xs text-white/50">{t('statsLoading')}</p>
                  )}
                  {statsStatus === 'error' && (
                    <p className="mt-2 text-xs text-red-400">{t('statsError')}</p>
                  )}
                  {statsUpdatedAt && (
                    <p className="mt-2 text-xs text-white/50">
                      {t('statsUpdated', {
                        time: new Date(statsUpdatedAt).toLocaleTimeString(),
                      })}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-white/15 bg-black/60 p-8 shadow-xl shadow-black/30">
                <div className="flex flex-col items-start gap-4">
                  <ConnectButton />
                  {!isConnected && (
                    <AlertBanner
                      type="info"
                      className="w-full"
                      message={t('alertConnectWallet')}
                    />
                  )}
                  {isConnected && !isOnTargetChain && (
                    <AlertBanner
                      type="warning"
                      className="w-full"
                      message={t('networkWarning', { network: TARGET_CHAIN_MESSAGE })}
                    />
                  )}
                  {switchNetwork && isConnected && !isOnTargetChain && (
                    <button
                      className="rounded-full bg-[#10b981] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#00fff7] disabled:opacity-60"
                      onClick={() => switchNetwork(PRESALE_CONFIG.chainId)}
                      disabled={isSwitchingNetwork}
                    >
                      {isSwitchingNetwork ? t('networkSwitching') : t('networkSwitch')}
                    </button>
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-4">
                  <label className="text-sm text-white/70">
                    {t('inputPlaceholderUsd')}
                    <input
                      type="number"
                      min={minContributionEth * ethToUsd}
                      max={maxContributionEth * ethToUsd}
                      step="0.01"
                      value={usdAmount}
                      onChange={e => setUsdAmount(e.target.value.replace(',', '.'))}
                      className="mt-2 w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 text-white placeholder-white/40 focus:border-[#10b981] focus:outline-none focus:ring-2 focus:ring-[#10b981]/40"
                    />
                  </label>

                  <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-xs text-white/60">
                    ≈ {ethAmount || '0.000000'} ETH · {aciReceived} ACI
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={handlePurchase}
                      disabled={!isConnected || isSendingTx}
                      className="flex-1 rounded-full bg-[#10b981] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#00fff7] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSendingTx ? t('buyProcessing') : t('buy')}
                    </button>
                    <button
                      onClick={handlePurchaseAndStake}
                      className="flex-1 rounded-full border border-[#10b981] px-6 py-3 text-sm font-semibold text-[#10b981] transition hover:bg-[#10b981] hover:text-black"
                    >
                      {t('buyAndStake')}
                    </button>
                  </div>

                  <p className="text-xs text-white/60">
                    {t('limitsLabel', {
                      min: minContributionEth,
                      max: maxContributionEth,
                    })}
                  </p>

                  {feedback && (
                    <AlertBanner type={feedback.type} message={feedback.message} />
                  )}
                  {txError && (
                    <AlertBanner
                      type="error"
                      message={txError.shortMessage || txError.message}
                    />
                  )}
                  {switchNetworkError && (
                    <AlertBanner
                      type="error"
                      message={switchNetworkError.shortMessage || switchNetworkError.message}
                    />
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-20 rounded-3xl border border-white/10 bg-black/70 px-6 py-16 shadow-2xl shadow-black/30">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6 text-white">
                <p className="text-xs uppercase tracking-[0.4em] text-emerald-200/80">
                  {t('homePage.metaCoach.badge')}
                </p>
                <h2 className="text-3xl font-bold sm:text-4xl">
                  {t('homePage.metaCoach.title')}
                </h2>
                <p className="text-base leading-relaxed text-white/70 sm:text-lg">
                  {t('homePage.metaCoach.description')}
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {metaHighlights.map(bullet => (
                    <div
                      key={bullet}
                      className="rounded-2xl border border-emerald-500/30 bg-black/50 p-4 text-sm text-white/75 leading-relaxed shadow-inner shadow-black/30"
                    >
                      {bullet}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    to="/coach-ia"
                    className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
                  >
                    {t('homePage.metaCoach.primaryCta')}
                  </Link>
                  <Link
                    to="/token"
                    className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white transition hover:border-emerald-400 hover:text-emerald-200"
                  >
                    {t('homePage.metaCoach.secondaryCta')}
                  </Link>
                </div>
              </div>
              <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-white shadow-xl shadow-emerald-500/20">
                <h3 className="text-lg font-semibold text-emerald-200">
                  {t('homePage.unlock.title')}
                </h3>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/75">
                  {unlockItems.map(item => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-xs text-white/60">
                  {t('homePage.unlock.footer')}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-20">
            <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
              {t('homePage.featureSection.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-white/70 leading-relaxed">
              {t('homePage.featureSection.subtitle')}
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {featureCards.map(feature => (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-[#10b981]/25 bg-black/60 p-6 shadow-lg shadow-[#10b981]/10"
                >
                  <h3 className="text-xl font-semibold text-[#10b981] text-balance">{feature.title}</h3>
                  <p className="mt-3 text-sm text-white/75 leading-relaxed">{feature.description}</p>
                  <Link
                    to={feature.link}
                    className="mt-5 inline-flex items-center text-sm font-semibold text-[#10b981] hover:text-[#00fff7]"
                  >
                    {feature.cta} →
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-20">
            <CoachIASection variant="home" />
          </div>

          <section className="mt-20">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 rounded-3xl border border-[#10b981]/25 bg-black/60 px-6 py-10 text-center text-white shadow-2xl shadow-[#10b981]/15">
              <h2 className="text-3xl font-semibold text-[#10b981]">
                {t('homePage.metaTrack.title')}
              </h2>
              <p className="max-w-2xl text-sm text-white/70 leading-relaxed">
                {t('homePage.metaTrack.description')}
              </p>
              <form className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  name="metaTrackEmail"
                  placeholder={t('homePage.metaTrack.emailPlaceholder')}
                  className="flex-1 rounded-full border border-white/20 bg-black/60 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-[#10b981] focus:outline-none focus:ring-2 focus:ring-[#10b981]/30"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#10b981] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#00fff7]"
                >
                  {t('homePage.metaTrack.cta')}
                </button>
              </form>
            </div>
          </section>
        </PageWrapper>
      </div>
    </div>
  );
}
