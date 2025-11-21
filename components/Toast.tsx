"use client";
import { useEffect, useState } from "react";

type ToastProps = {
  message: string;
  duration?: number;
  onClose?: () => void;
  variant?: "success" | "error";
};

export function Toast({ message, duration = 2000, onClose, variant = "success" }: ToastProps) {
  const [visible, setVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-24 left-1/2 z-50 rounded-[12px] px-4 py-3 text-white text-sm font-medium text-center shadow-lg"
      style={{
        backgroundColor: variant === "error" ? "#ef4444" : "#3b82f6",
        transform: "translateX(-50%)",
        opacity: isExiting ? 0 : 1,
        transition: "opacity 300ms ease-out, transform 300ms ease-out",
        animation: isExiting ? undefined : "toastSlideIn 300ms ease-out",
        borderRadius: "8px",
        padding: "12px 20px",
        fontSize: "14px",
      }}
    >
      {message}
    </div>
  );
}

