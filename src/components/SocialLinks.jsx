import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaTelegramPlane, FaTwitter, FaInstagram, FaDiscord, FaTiktok } from 'react-icons/fa';

export default function SocialLinks() {
  const { t } = useTranslation();

  return (
    <section className="mt-20 text-white text-center">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]">
        {t('socialLinks.title')}
      </h2>
      <div className="flex justify-center gap-6 text-3xl">
        <a href="https://t.me/tonLien" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition">
          <FaTelegramPlane />
        </a>
        <a href="https://twitter.com/tonLien" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition">
          <FaTwitter />
        </a>
        <a href="https://instagram.com/tonLien" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition">
          <FaInstagram />
        </a>
        <a href="https://discord.gg/tonLien" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition">
          <FaDiscord />
        </a>
        <a href="https://tiktok.com/@tonLien" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
          <FaTiktok />
        </a>
      </div>
    </section>
  );
}
