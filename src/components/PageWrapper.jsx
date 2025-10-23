 // src/components/PageWrapper.jsx
import React from 'react';

export default function PageWrapper({ children, noTopPadding = false }) {
  return (
    <div
      className={`
        relative z-10
        w-full max-w-screen-lg mx-auto
        px-4
        ${noTopPadding ? 'pt-0' : 'pt-10'}
        text-white
      `}
    >
      {children}
    </div>
  );
}
