'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-md',
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md transition-opacity duration-200"
    >
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-transparent"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative z-10 w-full ${maxWidth} bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-7 shadow-2xl border border-slate-200/90 dark:border-slate-800 max-h-[92vh] overflow-y-auto transform transition-all duration-200 scale-100`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
