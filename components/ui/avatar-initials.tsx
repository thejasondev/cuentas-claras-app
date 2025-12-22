"use client";

import { cn } from "@/lib/utils";

interface AvatarInitialsProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Generate consistent color based on name
const getAvatarColorClass = (name: string): string => {
  const colors = [
    "avatar-1", // red
    "avatar-2", // orange
    "avatar-3", // yellow
    "avatar-4", // green
    "avatar-5", // cyan
    "avatar-6", // purple
    "avatar-7", // pink
    "avatar-8", // teal
  ];
  const charCode = name.toLowerCase().charCodeAt(0) || 0;
  return colors[charCode % colors.length];
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function AvatarInitials({
  name,
  size = "md",
  className,
}: AvatarInitialsProps) {
  const initials = getInitials(name);
  const colorClass = getAvatarColorClass(name);

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-white font-bold shrink-0 transition-transform",
        sizeClasses[size],
        colorClass,
        className
      )}
      aria-label={`Avatar de ${name}`}
    >
      {initials}
    </div>
  );
}

export { getAvatarColorClass, getInitials };
