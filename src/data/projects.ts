export interface Project {
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  screenshots?: { src: string; alt: string; width?: number; height?: number }[];
  details?: string;
  featured?: boolean;
  role?: string;
  icon?: string;
  logo?: string;
  highlights?: { title: string; description: string }[];
  tags: string[];
  source?: string;
  demo?: string;
  placeholder?: boolean;
}

// Replace these entries with your projects. Links only appear when URLs exist.
export const projects: Project[] = [
  {
    title: "Atlas",
    description:
      "A taxi fleet management platform. I built the native Android app used by drivers and dispatchers, with maps, job management, and Android Auto support.",
    details:
      "Atlas brings ride assignment, fleet visibility, and shift records into one system for smaller taxi companies. My part of the project is the mobile app, built in Kotlin with Jetpack Compose. It connects drivers and dispatchers to the Atlas backend, takes them through a shift from sign-in to the final logbook entry, and extends the experience to the car display through Android Auto.",
    role: "Mobile app development",
    logo: "/projects/atlas/logo.png",
    image: "/projects/atlas/navigation.png",
    imageAlt:
      "Atlas navigation to a pickup with turn instructions, a 3D map, and job controls.",
    featured: true,
    tags: [
      "Kotlin",
      "Jetpack Compose",
      "Android Auto",
      "MapLibre",
      "WebSockets",
    ],
    source: "https://github.com/GameTec-live/atlas",
    screenshots: [
      {
        src: "/projects/atlas/navigation.png",
        alt: "Navigation to a pickup with turn instructions and job controls.",
        width: 406,
        height: 905,
      },
      {
        src: "/projects/atlas/job-notification.png",
        alt: "New job notification and the driver's assigned-job queue.",
        width: 403,
        height: 904,
      },
      {
        src: "/projects/atlas/new-job.png",
        alt: "Creating a job with pickup, destination, route preview, and recommended drivers.",
        width: 406,
        height: 905,
      },
      {
        src: "/projects/atlas/live-map.png",
        alt: "Live map and job overview before starting a ride.",
        width: 406,
        height: 906,
      },
      {
        src: "/projects/atlas/shift-summary.png",
        alt: "End-of-shift summary with mileage, vehicle, shift time, and cash report.",
        width: 407,
        height: 902,
      },
    ],
    highlights: [
      {
        title: "Jobs & dispatch",
        description:
          "Assigned-job queues, pickup and completion controls, plus job creation and driver assignment for dispatchers.",
      },
      {
        title: "Maps & navigation",
        description:
          "Live fleet positions, address search, and route guidance to pickups and destinations.",
      },
      {
        title: "Android Auto",
        description:
          "Navigation and job controls on the vehicle display, sharing the phone’s active session.",
      },
      {
        title: "Shift records",
        description:
          "Odometer readings, vehicle selection, and cash revenue collected into an end-of-shift logbook entry.",
      },
    ],
  },
  {
    title: "Project 02",
    description: "Project description.",
    tags: [],
    placeholder: true,
  },
  {
    title: "Project 03",
    description: "Project description.",
    tags: [],
    placeholder: true,
  },
];
