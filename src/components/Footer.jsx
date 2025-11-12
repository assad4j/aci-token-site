// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaDiscord, FaTelegramPlane, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  const navLinks = [
    { labelKey: 'navigation.menu.coach', to: '/coach-ia' },
    { labelKey: 'navigation.menu.formations', to: '/formations' },
    { labelKey: 'navigation.menu.token', to: '/token' },
    { labelKey: 'navigation.menu.roadmap', to: '/roadmap' },
    { labelKey: 'navigation.menu.faq', to: '/faq' },
    { labelKey: 'navigation.menu.contact', to: '/contact' },
  ];

  return (
    <footer className="mt-20 bg-[#050510]/95 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 text-sm">
        <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">
              ACI SmartTrader Suite
            </p>
            <p className="mt-2 text-lg font-semibold text-balance">
              {t('footer.tagline')}
            </p>
          </div>
          <div className="flex items-center gap-4 text-lg">
            <a href="https://discord.gg/BrW3SxfqXq" target="_blank" rel="noopener noreferrer" className="hover:text-[#10b981]">
              <FaDiscord />
            </a>
            <a href="https://t.me/+KjXmssaKcBJkODE0" target="_blank" rel="noopener noreferrer" className="hover:text-[#10b981]">
              <FaTelegramPlane />
            </a>
            <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="hover:text-[#10b981]">
              <FaWhatsapp />
            </a>
            <a href="https://x.com/ac__institute?s=21" target="_blank" rel="noopener noreferrer" className="hover:text-[#10b981]">
              <FaXTwitter />
            </a>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-white/70">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className="transition hover:text-[#10b981]">
              {t(link.labelKey)}
            </Link>
          ))}
          <a href="/whitepaper" className="transition hover:text-[#10b981]">
            {t('navigation.menu.whitepaper')}
          </a>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/40 px-6 py-5 text-center text-xs text-white/60 shadow-inner shadow-black/20">
          <p>
            {t('footer.disclaimer')}
          </p>
          <p className="mt-2">
            {t('footer.email')}
          </p>
        </div>
      </div>
    </footer>
  );
}
