/**
 * @fileoverview Brand logo and title pill for Vesta Command Header.
 */

import React from 'react';

export const HeaderBrandLogo: React.FC = () => {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-9 h-9 rounded-xl bg-gradient-to-tr from-vesta-gold via-vesta-iris to-vesta-foam p-0.5 shadow-md shadow-vesta-gold/15"
        aria-hidden="true"
      >
        <div className="w-full h-full bg-vesta-surface rounded-[9px] flex items-center justify-center overflow-hidden">
          <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
            <path
              d="M16 2 L18.5 11 L27 8.5 L21.5 16 L27 23.5 L18.5 21 L16 30 L13.5 21 L5 23.5 L10.5 16 L5 8.5 L13.5 11 Z"
              fill="url(#headerBrandGrad)"
              stroke="#ffffff"
              strokeWidth="0.5"
            />
            <circle cx="16" cy="16" r="2.5" fill="#ffffff" />
            <defs>
              <linearGradient id="headerBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f6c177" />
                <stop offset="50%" stopColor="#c4a7e7" />
                <stop offset="100%" stopColor="#9ccfd8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-vesta-text via-vesta-gold to-vesta-foam bg-clip-text text-transparent">
            VESTA
          </span>
          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-vesta-iris/15 text-vesta-iris border border-vesta-iris/30 tracking-wide uppercase">
            Studio OS
          </span>
        </div>
      </div>
    </div>
  );
};
