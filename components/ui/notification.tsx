"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface NotificationProps {
  type: "success" | "error" | "info";
  title: string;
  message?: string;
  duration?: number;
}

export function Notification({
  type,
  title,
  message,
  duration = 5000,
}: NotificationProps) {
  useEffect(() => {
    switch (type) {
      case "success":
        toast.success(title, {
          description: message,
          duration,
        });
        break;
      case "error":
        toast.error(title, {
          description: message,
          duration,
        });
        break;
      case "info":
        toast.info(title, {
          description: message,
          duration,
        });
        break;
    }
  }, [type, title, message, duration]);

  return null;
}
