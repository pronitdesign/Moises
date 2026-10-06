import type { SVGProps } from 'react';

const base: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.15,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export type IconComponent = (props: SVGProps<SVGSVGElement>) => JSX.Element;

/** Shepherd's crook. */
export const StaffIcon: IconComponent = (props) => (
  <svg {...base} {...props}>
    <path d="M8.8 21.6V8.9a4.1 4.1 0 0 1 8.2 0v1.8" />
  </svg>
);

/** Driven wind. */
export const WindIcon: IconComponent = (props) => (
  <svg {...base} {...props}>
    <path d="M2.5 8.2h10.4a2.35 2.35 0 1 0-2.35-2.35" />
    <path d="M2.5 12.6h13.8a2.55 2.55 0 1 1-2.55 2.55" />
    <path d="M2.5 17h8.2a2.15 2.15 0 1 1-2.15 2.15" />
  </svg>
);

/** Two walls of water with dry ground between them. */
export const WallsIcon: IconComponent = (props) => (
  <svg {...base} {...props}>
    <path d="M6 2.8c1.7 2.4-1.7 4.4 0 6.9s-1.7 4.4 0 6.9c.8 1.2.5 2.5 0 4.6" />
    <path d="M18 2.8c-1.7 2.4 1.7 4.4 0 6.9s1.7 4.4 0 6.9c-.8 1.2-.5 2.5 0 4.6" />
    <path d="M12 21V8.4" />
    <path d="m9.7 10.7 2.3-2.3 2.3 2.3" />
  </svg>
);

/** The people, crossing. */
export const PeopleIcon: IconComponent = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="6.9" r="2.35" />
    <path d="M6.9 20.2c0-3.4 2.3-5.5 5.1-5.5s5.1 2.1 5.1 5.5" />
    <circle cx="4.9" cy="10.6" r="1.75" />
    <path d="M1.9 19.8c0-2.6 1.2-4.2 3-4.6" />
    <circle cx="19.1" cy="10.6" r="1.75" />
    <path d="M22.1 19.8c0-2.6-1.2-4.2-3-4.6" />
  </svg>
);
