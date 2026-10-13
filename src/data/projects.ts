export interface Project {
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  tags: string[];
  source?: string;
  demo?: string;
  placeholder?: boolean;
}

// Replace these entries with your projects. Links only appear when URLs exist.
export const projects: Project[] = [
  {
    title: "Project 01",
    description: "Project description.",
    tags: [],
    placeholder: true,
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
