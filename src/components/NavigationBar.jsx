// src/components/NavigationBar.jsx
import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { FaDiscord, FaXTwitter } from 'react-icons/fa6';
import { FaTelegramPlane, FaWhatsapp } from 'react-icons/fa';
import { HiMenu, HiX } from 'react-icons/hi';
import logo from '../assets/logo.png';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const menuItems = useMemo(
    () => [
      { labelKey: 'navigation.menu.home', to: '/' },
      { labelKey: 'navigation.menu.coach', to: '/coach-ia' },
      { labelKey: 'navigation.menu.formations', to: '/formations' },
      { labelKey: 'navigation.menu.token', to: '/token' },
      { labelKey: 'navigation.menu.staking', to: '/staking' },
      { labelKey: 'navigation.menu.roadmap', to: '/roadmap' },
      { labelKey: 'navigation.menu.whitepaper', to: '/whitepaper' },
      { labelKey: 'navigation.menu.faq', to: '/faq' },
      { labelKey: 'navigation.menu.contact', to: '/contact' },
    ],
    [],
  );

  const handleNavigate = useCallback(() => setIsOpen(false), []);

  return (
    <nav className="fixed top-0 w-full bg-[#1a1a2e] bg-opacity-80 border-b-2 border-[#10b981] px-4 py-2 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <img src={logo} alt={t('navigation.logoAlt')} className="h-14 w-auto" />
        </Link>

        {/* Liens desktop */}
        <div className="hidden md:flex items-center space-x-6">
          {menuItems.map(item => (
            <Link key={item.to} to={item.to} className="text-white hover:text-[#10b981]">
              {t(item.labelKey)}
            </Link>
          ))}
        </div>

        {/* Réseaux sociaux + Wallet + Langue (desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          <a
            href="https://discord.gg/BrW3SxfqXq"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-[#10b981] text-xl"
          >
            <FaDiscord />
          </a>
          <a
            href="https://t.me/+KjXmssaKcBJkODE0"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-[#10b981] text-xl"
          >
            <FaTelegramPlane />
          </a>
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-[#10b981] text-xl"
          >
            <FaWhatsapp />
          </a>
          <a
            href="https://x.com/ac__institute?s=21"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-[#10b981] text-xl"
          >
            <FaXTwitter />
          </a>
          <ConnectButton showBalance={false} chainStatus="icon" />
          <LanguageSwitcher />
        </div>

        {/* Bouton mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white text-2xl"
        >
          {isOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {/* Menu mobile */}
      {isOpen && (
        <div className="md:hidden bg-black bg-opacity-80 space-y-2 py-4 text-center">
          {menuItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={handleNavigate}
              className="block text-white hover:text-[#10b981]"
            >
              {t(item.labelKey)}
            </Link>
          ))}

          <div className="flex justify-center items-center space-x-4 mt-4">
            <a href="https://discord.gg/BrW3SxfqXq" className="text-white hover:text-[#10b981] text-xl">
              <FaDiscord />
            </a>
            <a href="https://t.me/+KjXmssaKcBJkODE0" className="text-white hover:text-[#10b981] text-xl">
              <FaTelegramPlane />
            </a>
            <a href="https://wa.me/" className="text-white hover:text-[#10b981] text-xl">
              <FaWhatsapp />
            </a>
            <a href="https://x.com/ac__institute?s=21" className="text-white hover:text-[#10b981] text-xl">
              <FaXTwitter />
            </a>
          </div>
          <div className="mt-2 flex justify-center">
            <ConnectButton showBalance={false} chainStatus="icon" />
          </div>
          <div className="mt-2 flex justify-center text-white">
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </nav>
  );
}

export default React.memo(NavigationBar);
