import React from "react";

export const AppIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="11" fill="#EDE9FE" stroke="none" />

      <path d="M8 7h8M8 11h8M8 15h4" stroke="#4F46E5" strokeWidth="1.5" />

      <path d="M16 15l1.5 1.5L19 15" stroke="#10B981" strokeWidth="2.5" />
    </svg>
  );
};
