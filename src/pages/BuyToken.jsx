import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useBalance, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';
import PageWrapper from '../components/PageWrapper';

export default function BuyToken() {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState(null);
  const { data: balance } = useBalance({ address });
  const { sendTransaction } = useSendTransaction();

  const handleBuy = async () => {
    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      setStatus({ variant: 'error', text: t('buyTokenPage.status.invalidAmount') });
      return;
    }

    try {
      await sendTransaction({
        to: '0x1234567890abcdef1234567890abcdef12345678', // TODO: replace with your smart contract
        value: parseEther(amount),
      });
      setStatus({ variant: 'success', text: t('buyTokenPage.status.success') });
      setAmount('');
    } catch (error) {
      console.error(error);
      setStatus({ variant: 'error', text: t('buyTokenPage.status.error') });
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#1a1a2e] px-6 py-24 text-white">
        <h1 className="mb-6 text-4xl font-bold">{t('buyTokenPage.title')}</h1>

        {isConnected ? (
          <div className="max-w-lg space-y-4 rounded-3xl border border-white/20 bg-black/60 p-6 shadow-xl shadow-black/40 backdrop-blur">
            <p className="text-sm text-white/70">
              {t('buyTokenPage.connectedAs', { address })}
            </p>
            <p className="text-sm text-white/70">
              {t('buyTokenPage.balance', {
                balance: balance?.formatted ?? '0',
                symbol: balance?.symbol ?? 'ETH',
              })}
            </p>

            <label className="block text-sm text-white/75">
              {t('buyTokenPage.amountLabel')}
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={event => setAmount(event.target.value)}
                placeholder={t('buyTokenPage.amountPlaceholder')}
                className="mt-2 w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-3 text-white placeholder-white/40 focus:border-[#10b981] focus:outline-none focus:ring-2 focus:ring-[#10b981]/40"
              />
            </label>

            <button
              onClick={handleBuy}
              className="w-full rounded-full bg-[#10b981] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#00fff7]"
            >
              {t('buyTokenPage.buyCta')}
            </button>

            {status && (
              <p
                className={`text-sm ${
                  status.variant === 'success'
                    ? 'text-emerald-300'
                    : status.variant === 'error'
                      ? 'text-rose-300'
                      : 'text-white/70'
                }`}
              >
                {status.text}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-white/60">{t('buyTokenPage.connectPrompt')}</p>
        )}
      </div>
    </PageWrapper>
  );
}
