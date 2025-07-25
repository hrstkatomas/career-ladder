import { Timestamp } from "firebase/firestore";

// Users Collection
export interface User {
  id: string;
  email: string;
  name: string;
  teamId: string;
  currentLevel: number; // L1-L7
  role: "employee" | "team_leader" | "admin";
  domain: string; // e.g., 'frontend', 'backend', 'devops'
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Teams Collection
export interface Team {
  id: string;
  name: string;
  leaderId: string;
  domains: string[]; // teams can have members from multiple domains
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Skills Collection
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: "generic" | "domain" | "team";
  domain?: string; // for domain-specific skills
  teamId?: string; // for team-specific skills
  applicableLevels: number[]; // [1,2,3,4,5,6,7]
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Assessments Collection
export interface Assessment {
  id: string;
  userId: string;
  skillId: string;
  level: "none" | "learning" | "proficient" | "fluent";
  assessedBy: string; // team leader's user ID
  assessedAt: Timestamp;
  notes?: string;
}

// Skill Waivers Collection
export interface SkillWaiver {
  id: string;
  userId: string;
  skillId: string;
  level: number; // the level this waiver applies to
  waivedBy: string; // team leader's user ID
  reason: string;
  waivedAt: Timestamp;
}

// Ladder Configurations Collection
export interface LadderConfig {
  id: string;
  teamId: string;
  domain: string;
  skillsByLevel: {
    [level: number]: {
      genericSkills: string[]; // skill IDs - same across all teams
      domainSkills: string[]; // skill IDs - predefined per domain
      teamSkills: string[]; // skill IDs - team-specific selections
    };
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Domains Collection (predefined by admins)
export interface Domain {
  id: string;
  name: string; // e.g., 'Frontend', 'Backend', 'DevOps'
  description: string;
  createdAt: Timestamp;
}

// Assessment level type for components
export type AssessmentLevel = Assessment["level"];

// User role type for permissions
export type UserRole = User["role"];

// Skill category type
export type SkillCategory = Skill["category"];

// Assessment with skill details (for UI components)
export interface AssessmentWithSkill extends Assessment {
  skill: Skill;
}

// User with team details
export interface UserWithTeam extends User {
  team?: Team;
}

// Career level information
export interface CareerLevel {
  level: number;
  title: string;
  focus: string;
  description: string;
}

// Career levels data
export const CAREER_LEVELS: CareerLevel[] = [
  {
    level: 1,
    title: "IC1 Junior [Specialist]",
    focus: "Learning & Execution",
    description:
      "Learns foundational skills and company processes. Executes clearly defined tasks under supervision.",
  },
  {
    level: 2,
    title: "IC2 [Specialist]",
    focus: "Independent Professional",
    description:
      "Reliably and independently works on standard tasks. Requires minimal supervision.",
  },
  {
    level: 3,
    title: "IC3 Senior [Specialist] I",
    focus: "Ownership & Improvement",
    description:
      "Fully autonomous, owns complete areas. Proactively identifies improvements. Mentors L1/L2.",
  },
  {
    level: 4,
    title: "IC4 Senior [Specialist] II",
    focus: "Leading Projects",
    description:
      "Leads complex projects within domain. Recognized expert and mentor.",
  },
  {
    level: 5,
    title: "IC5 Lead [Specialist]",
    focus: "Scaling Influence",
    description:
      "Work impacts multiple teams. Designs solutions for broader effectiveness.",
  },
  {
    level: 6,
    title: "IC6 Principal [Specialist]",
    focus: "Domain Leadership",
    description:
      "Drives long-term strategy for expert domain. Mentors senior experts.",
  },
  {
    level: 7,
    title: "IC7 Distinguished [Specialist]",
    focus: "Vision Leadership",
    description:
      "Shapes discipline direction. Influences company-wide strategy.",
  },
];

// Assessment level configuration
export interface AssessmentLevelConfig {
  value: AssessmentLevel;
  label: string;
  color: string;
}

export const ASSESSMENT_LEVELS: AssessmentLevelConfig[] = [
  { value: "none", label: "None", color: "bg-gray-100 text-gray-800" },
  {
    value: "learning",
    label: "Learning",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "proficient",
    label: "Proficient",
    color: "bg-blue-100 text-blue-800",
  },
  { value: "fluent", label: "Fluent", color: "bg-green-100 text-green-800" },
];
