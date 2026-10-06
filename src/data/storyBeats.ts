import { PeopleIcon, StaffIcon, WallsIcon, WindIcon, type IconComponent } from '../components/icons';

export interface StoryBeat {
  id: string;
  index: string;
  /** Normalised timeline position where the card is fully present. */
  start: number;
  end: number;
  side: 'left' | 'right';
  icon: IconComponent;
  eyebrow: string;
  title: string;
  description: string;
  tags: [string, string];
  /** Label for the right-edge chapter rail. */
  marker: string;
}

/**
 * Ranges are tuned to the footage: Moses raises the staff around 1.5s, the
 * water is driven back through 7s, the walls stand by 9s, and the camera is
 * inside the corridor past 10.5s.
 */
export const storyBeats: StoryBeat[] = [
  {
    id: 'staff',
    index: '01',
    start: 0.1,
    end: 0.25,
    side: 'left',
    icon: StaffIcon,
    eyebrow: 'Exodus 14:16',
    title: 'Raise the staff',
    description:
      'Moses stands before an impossible path. Behind him, Israel waits. Ahead, only the sea.',
    tags: ['Faith', 'Exodus'],
    marker: 'The command',
  },
  {
    id: 'wind',
    index: '02',
    start: 0.3,
    end: 0.45,
    side: 'right',
    icon: WindIcon,
    eyebrow: 'Exodus 14:21',
    title: 'A strong east wind',
    description:
      'Throughout the night the waters are driven apart, and the sea gives way to dry ground.',
    tags: ['The sea', 'The wind'],
    marker: 'The wind',
  },
  {
    id: 'walls',
    index: '03',
    start: 0.48,
    end: 0.65,
    side: 'left',
    icon: WallsIcon,
    eyebrow: 'Exodus 14:22',
    title: 'Walls of water',
    description:
      'The Israelites enter the sea on dry ground, the waters standing as walls to their right and left.',
    tags: ['Passage', 'Israel'],
    marker: 'The walls',
  },
  {
    id: 'crossing',
    index: '04',
    start: 0.7,
    end: 0.85,
    side: 'right',
    icon: PeopleIcon,
    eyebrow: 'The crossing',
    title: 'A path through the impossible',
    description:
      'What moments earlier was an obstacle becomes the road forward.',
    tags: ['Deliverance', 'Journey'],
    marker: 'The crossing',
  },
];

/** Seconds of film. Must match the encoded asset. */
export const FILM_FPS = 24;
