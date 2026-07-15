import type { SVGProps } from 'react';

export default function LucideIconStub(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
      {...props}
    >
      <path d="M12 4v16" />
      <path d="M4 12h16" />
    </svg>
  );
}
