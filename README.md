# Career Ladder App

A comprehensive career progression tracking system built with Next.js and Firebase, designed for engineering teams to manage skill development and career advancement.

## Table of Contents

- [Overview](#overview)
- [Core Concepts](#core-concepts)
- [Data Model](#data-model)
- [Architecture](#architecture)
- [Firebase Setup](#firebase-setup)
- [First User Setup](#first-user-setup)
- [Next.js Configuration](#nextjs-configuration)
- [Implementation Guide](#implementation-guide)
- [Security Considerations](#security-considerations)
- [Deployment](#deployment)
- [Usage Guide](#usage-guide)
- [Contributing](#contributing)

## Overview

The Career Ladder app provides a structured approach to career development with:

- **7 standardized career levels** (L1-L7) with clear expectations
- **Three skill categories**: Generic Engineering, Domain-Specific, and Team-Specific
- **Team leader assessment system** with employee progress tracking
- **Administrative interface** for team leaders and admins
- **Role-based access control** and secure data management
- **Automatic level progression** based on skill achievements

## Core Concepts

### Career Levels

| Level | Title                          | Focus                    | Description                                                                                         |
| ----- | ------------------------------ | ------------------------ | --------------------------------------------------------------------------------------------------- |
| L1    | IC1 Junior [Specialist]        | Learning & Execution     | Learns foundational skills and company processes. Executes clearly defined tasks under supervision. |
| L2    | IC2 [Specialist]               | Independent Professional | Reliably and independently works on standard tasks. Requires minimal supervision.                   |
| L3    | IC3 Senior [Specialist] I      | Ownership & Improvement  | Fully autonomous, owns complete areas. Proactively identifies improvements. Mentors L1/L2.          |
| L4    | IC4 Senior [Specialist] II     | Leading Projects         | Leads complex projects within domain. Recognized expert and mentor.                                 |
| L5    | IC5 Lead [Specialist]          | Scaling Influence        | Work impacts multiple teams. Designs solutions for broader effectiveness.                           |
| L6    | IC6 Principal [Specialist]     | Domain Leadership        | Drives long-term strategy for expert domain. Mentors senior experts.                                |
| L7    | IC7 Distinguished [Specialist] | Vision Leadership        | Shapes discipline direction. Influences company-wide strategy.                                      |

### Skill Categories

1. **Generic Engineering Skills**: Shared across all roles and teams (e.g., problem-solving, communication, code quality)
2. **Domain-Specific Skills**: Role-specific expertise (e.g., frontend, backend, DevOps, system administration)
3. **Team-Specific Skills**: Technologies and practices unique to each team

### Assessment States

- **None**: Does not have the skill
- **Learning**: Currently learning the skill
- **Proficient**: Can apply independently in some situations
- **Fluent**: Uses autonomously in all situations

### Role-Based System

- **Employees**: Can view their skills and progression (read-only)
- **Team Leaders**: Can assess team members' skills and configure team-specific requirements
- **Admins**: Can manage all users, create generic/domain skills, and assign roles

### Automatic Progression

Career level advancement is **automatic** and **immediate** based on skill achievements:

- **Progression Requirement**: All required skills for the target level (including all previous levels) must be assessed as "Fluent"
- **Skill Waivers**: Team leaders can waive individual skills at their discretion for exceptional cases
- **Immediate Updates**: Level progression happens instantly when requirements are met, using Firestore triggers
- **No Time Requirements**: There are no minimum time requirements between levels

### Assessment Workflow

- **Team Leader Responsibility**: Team leaders assess their team members' skills (employees have read-only access)
- **Partial Assessments**: Team leaders can assess skills incrementally; unassessed skills default to "None"
- **Assessment Frequency**: Flexible schedule, typically monthly or quarterly updates
- **Default State**: All skills start as "None" until actively assessed

## Data Model

### Collections Structure

```typescript
// Users Collection
interface User {
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
interface Team {
  id: string;
  name: string;
  leaderId: string;
  domains: string[]; // teams can have members from multiple domains
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Skills Collection
interface Skill {
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
interface Assessment {
  id: string;
  userId: string;
  skillId: string;
  level: "none" | "learning" | "proficient" | "fluent";
  assessedBy: string; // team leader's user ID
  assessedAt: Timestamp;
  notes?: string;
}

// Skill Waivers Collection
interface SkillWaiver {
  id: string;
  userId: string;
  skillId: string;
  level: number; // the level this waiver applies to
  waivedBy: string; // team leader's user ID
  reason: string;
  waivedAt: Timestamp;
}

// Ladder Configurations Collection
interface LadderConfig {
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
interface Domain {
  id: string;
  name: string; // e.g., 'Frontend', 'Backend', 'DevOps'
  description: string;
  createdAt: Timestamp;
}
```

## Architecture

### Directory Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── page.tsx           # Admin dashboard
│   │   ├── teams/
│   │   │   └── [teamId]/
│   │   │       ├── page.tsx   # Team management
│   │   │       └── skills/
│   │   │           └── page.tsx # Skill configuration
│   │   └── layout.tsx
│   ├── dashboard/
│   │   ├── page.tsx           # Employee dashboard
│   │   ├── assessment/
│   │   │   └── page.tsx       # Self-assessment interface
│   │   └── progress/
│   │       └── page.tsx       # Progress tracking
│   ├── auth/
│   │   ├── signin/
│   │   │   └── page.tsx
│   │   └── callback/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   ├── skills/
│   │   ├── assessments/
│   │   └── teams/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                    # Reusable UI components
│   ├── admin/                 # Admin-specific components
│   ├── employee/              # Employee-specific components
│   └── shared/                # Shared components
├── lib/
│   ├── firebase/
│   │   ├── config.ts
│   │   ├── auth.ts
│   │   ├── firestore.ts
│   │   └── admin.ts
│   ├── hooks/
│   ├── utils/
│   └── types/
└── middleware.ts
```

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enable Google Analytics (optional)
4. Wait for project creation to complete

### 2. Enable Authentication

```bash
# In Firebase Console:
# 1. Go to Authentication > Sign-in method
# 2. Enable "Google" sign-in provider
# 3. Add your domain to authorized domains if needed
```

### 3. Create Firestore Database

```bash
# In Firebase Console:
# 1. Go to Firestore Database
# 2. Click "Create database"
# 3. Choose "Production mode"
# 4. Select your preferred location
```

### 4. Generate Service Account

```bash
# In Firebase Console:
# 1. Go to Project Settings > Service accounts
# 2. Click "Generate new private key"
# 3. Save the JSON file securely
```

### 5. Get Web App Configuration

1. Go to Project Settings > General
2. Click "Add app" > Web
3. Register your app
4. Copy the configuration object

### 6. Environment Variables

Create `.env.local`:

```bash
# Firebase Configuration (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Admin (Server-side only)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----"
```

## First User Setup

### Promoting Your First User to Admin

Since the first user needs to be promoted to admin manually, follow these steps after your first user signs in with Google OAuth:

#### Step 1: Sign in to your app

1. Deploy your app or run it locally
2. Sign in with your Google account
3. Note your email address

#### Step 2: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**

#### Step 3: Find your user document

1. Click on the `users` collection
2. Find the document with your email address
3. Click on the document to edit it

#### Step 4: Update the role field

1. Look for the `role` field (it should be `employee` by default)
2. Click the edit icon next to the role field
3. Change the value from `employee` to `admin`
4. Click **Update**

#### Step 5: Verify admin access

1. Refresh your app
2. You should now have access to admin features
3. You can now promote other users to `team_leader` or `admin` through the admin interface

### Creating Initial Data

The system needs some seed data to function. Here's the recommended initial setup:

#### Generic Engineering Skills (same for all teams)

```typescript
const genericSkills = [
  {
    name: "Problem Solving",
    description:
      "Ability to analyze complex problems and develop effective solutions",
    category: "generic",
    applicableLevels: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    name: "Communication",
    description:
      "Clear written and verbal communication with team members and stakeholders",
    category: "generic",
    applicableLevels: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    name: "Code Quality",
    description: "Writing clean, maintainable, and well-documented code",
    category: "generic",
    applicableLevels: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    name: "Testing",
    description: "Writing and maintaining automated tests",
    category: "generic",
    applicableLevels: [2, 3, 4, 5, 6, 7],
  },
  {
    name: "System Design",
    description: "Designing scalable and maintainable software architectures",
    category: "generic",
    applicableLevels: [4, 5, 6, 7],
  },
  {
    name: "Mentoring",
    description: "Guiding and developing junior team members",
    category: "generic",
    applicableLevels: [3, 4, 5, 6, 7],
  },
  {
    name: "Technical Leadership",
    description:
      "Leading technical decisions and driving architectural changes",
    category: "generic",
    applicableLevels: [5, 6, 7],
  },
];
```

#### Domain-Specific Skills Examples

```typescript
// Frontend Domain
const frontendSkills = [
  {
    name: "React/Vue.js",
    description: "Proficiency in modern frontend frameworks",
    category: "domain",
    domain: "frontend",
    applicableLevels: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    name: "CSS/Styling",
    description: "Advanced CSS, preprocessors, and styling methodologies",
    category: "domain",
    domain: "frontend",
    applicableLevels: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    name: "Performance Optimization",
    description: "Frontend performance analysis and optimization techniques",
    category: "domain",
    domain: "frontend",
    applicableLevels: [3, 4, 5, 6, 7],
  },
];

// Backend Domain
const backendSkills = [
  {
    name: "API Design",
    description: "Designing RESTful APIs and GraphQL schemas",
    category: "domain",
    domain: "backend",
    applicableLevels: [2, 3, 4, 5, 6, 7],
  },
  {
    name: "Database Design",
    description: "Relational and NoSQL database design and optimization",
    category: "domain",
    domain: "backend",
    applicableLevels: [2, 3, 4, 5, 6, 7],
  },
  {
    name: "Microservices",
    description: "Designing and implementing microservice architectures",
    category: "domain",
    domain: "backend",
    applicableLevels: [4, 5, 6, 7],
  },
];
```

#### Predefined Domains

```typescript
const domains = [
  {
    name: "Frontend",
    description: "User interface and user experience development",
  },
  {
    name: "Backend",
    description: "Server-side development and API design",
  },
  {
    name: "DevOps",
    description: "Infrastructure, deployment, and operational excellence",
  },
  {
    name: "Mobile",
    description: "iOS and Android application development",
  },
  {
    name: "Data Engineering",
    description:
      "Data pipelines, analytics, and machine learning infrastructure",
  },
  {
    name: "QA Engineering",
    description:
      "Quality assurance, testing automation, and release management",
  },
];
```

## Next.js Configuration

### Install Dependencies

```bash
npm install firebase firebase-admin
npm install @headlessui/react @heroicons/react
npm install tailwindcss @tailwindcss/forms
npm install react-hook-form zod @hookform/resolvers
```

### Firebase Configuration

Create `src/lib/firebase/config.ts`:

```typescript
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
```

Create `src/lib/firebase/admin.ts`:

```typescript
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data and update specific fields
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId
        && !('role' in request.resource.data.diff(resource.data))
        && !('teamId' in request.resource.data.diff(resource.data))
        && !('currentLevel' in request.resource.data.diff(resource.data));
    }

    // Team leaders can read their team members
    match /users/{userId} {
      allow read: if request.auth != null &&
        exists(/databases/$(database)/documents/teams/$(resource.data.teamId)) &&
        get(/databases/$(database)/documents/teams/$(resource.data.teamId)).data.leaderId == request.auth.uid;
    }

    // Admins can read and update all users
    match /users/{userId} {
      allow read, write: if request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Teams - leaders can manage their own team, admins can manage all
    match /teams/{teamId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (
        (resource == null || resource.data.leaderId == request.auth.uid) ||
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin')
      );
    }

    // Skills - admins and team leaders can manage appropriate skills
    match /skills/{skillId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) && (
          // Admins can manage all skills
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
          // Team leaders can manage team-specific skills for their team
          (request.resource.data.category == 'team' &&
           exists(/databases/$(database)/documents/teams/$(request.resource.data.teamId)) &&
           get(/databases/$(database)/documents/teams/$(request.resource.data.teamId)).data.leaderId == request.auth.uid)
        );
    }

    // Assessments - team leaders can assess their team members
    match /assessments/{assessmentId} {
      allow read: if request.auth != null && (
        // Users can read their own assessments
        request.auth.uid == resource.data.userId ||
        // Team leaders can read assessments for their team members
        (exists(/databases/$(database)/documents/users/$(resource.data.userId)) &&
         exists(/databases/$(database)/documents/teams/$(get(/databases/$(database)/documents/users/$(resource.data.userId)).data.teamId)) &&
         get(/databases/$(database)/documents/teams/$(get(/databases/$(database)/documents/users/$(resource.data.userId)).data.teamId)).data.leaderId == request.auth.uid)
      );

      allow write: if request.auth != null &&
        // Only team leaders can write assessments for their team members
        exists(/databases/$(database)/documents/users/$(request.resource.data.userId)) &&
        exists(/databases/$(database)/documents/teams/$(get(/databases/$(database)/documents/users/$(request.resource.data.userId)).data.teamId)) &&
        get(/databases/$(database)/documents/teams/$(get(/databases/$(database)/documents/users/$(request.resource.data.userId)).data.teamId)).data.leaderId == request.auth.uid;
    }

    // Skill Waivers - team leaders can waive skills for their team members
    match /skillWaivers/{waiverId} {
      allow read: if request.auth != null && (
        // Users can read their own waivers
        request.auth.uid == resource.data.userId ||
        // Team leaders can read waivers for their team members
        (exists(/databases/$(database)/documents/users/$(resource.data.userId)) &&
         exists(/databases/$(database)/documents/teams/$(get(/databases/$(database)/documents/users/$(resource.data.userId)).data.teamId)) &&
         get(/databases/$(database)/documents/teams/$(get(/databases/$(database)/documents/users/$(resource.data.userId)).data.teamId)).data.leaderId == request.auth.uid)
      );

      allow write: if request.auth != null &&
        // Only team leaders can create/update waivers for their team members
        exists(/databases/$(database)/documents/users/$(request.resource.data.userId)) &&
        exists(/databases/$(database)/documents/teams/$(get(/databases/$(database)/documents/users/$(request.resource.data.userId)).data.teamId)) &&
        get(/databases/$(database)/documents/teams/$(get(/databases/$(database)/documents/users/$(request.resource.data.userId)).data.teamId)).data.leaderId == request.auth.uid;
    }

    // Domains - read by all, write by admins only
    match /domains/{domainId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Ladder configurations - team leaders and admins
    match /ladderConfigs/{configId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (
        (exists(/databases/$(database)/documents/teams/$(request.resource.data.teamId)) &&
         get(/databases/$(database)/documents/teams/$(request.resource.data.teamId)).data.leaderId == request.auth.uid) ||
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin')
      );
    }
  }
}
```

## Implementation Guide

### Step 1: Project Setup

```bash
# Clone/initialize the project
npx create-next-app@latest career-ladder --typescript --tailwind --eslint --app
cd career-ladder

# Install dependencies
npm install firebase firebase-admin @types/node
npm install @headlessui/react @heroicons/react
npm install react-hook-form zod @hookform/resolvers

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase configuration
```

### Step 2: Authentication Setup

Create `src/lib/hooks/useAuth.ts`:

```typescript
"use client";

import { useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    return signOut(auth);
  };

  return {
    user,
    loading,
    login,
    logout,
  };
}
```

### Step 3: Data Access Layer

Create `src/lib/firebase/firestore.ts`:

```typescript
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./config";
import type { User, Team, Skill, Assessment, LadderConfig } from "@/lib/types";

// Users
export const getUser = async (userId: string): Promise<User | null> => {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists()
    ? ({ id: docSnap.id, ...docSnap.data() } as User)
    : null;
};

export const updateUser = async (userId: string, data: Partial<User>) => {
  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, data);
};

// Skills
export const getSkills = async (filters?: {
  category?: string;
  domain?: string;
  teamId?: string;
}): Promise<Skill[]> => {
  let q = collection(db, "skills");

  if (filters?.category) {
    q = query(q, where("category", "==", filters.category));
  }
  if (filters?.domain) {
    q = query(q, where("domain", "==", filters.domain));
  }
  if (filters?.teamId) {
    q = query(q, where("teamId", "==", filters.teamId));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Skill[];
};

export const createSkill = async (skill: Omit<Skill, "id">) => {
  const docRef = await addDoc(collection(db, "skills"), skill);
  return docRef.id;
};

// Assessments
export const getUserAssessments = async (
  userId: string
): Promise<Assessment[]> => {
  const q = query(
    collection(db, "assessments"),
    where("userId", "==", userId),
    orderBy("selfAssessedAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Assessment[];
};

export const updateAssessment = async (
  assessmentId: string,
  data: Partial<Assessment>
) => {
  const docRef = doc(db, "assessments", assessmentId);
  await updateDoc(docRef, data);
};

export const createAssessment = async (assessment: Omit<Assessment, "id">) => {
  const docRef = await addDoc(collection(db, "assessments"), assessment);
  return docRef.id;
};
```

### Step 4: Core Components

Create `src/components/ui/SkillCard.tsx`:

```typescript
import { Assessment, Skill } from "@/lib/types";

interface SkillCardProps {
  skill: Skill;
  assessment?: Assessment;
  onAssess: (skillId: string, level: Assessment["level"]) => void;
  readonly?: boolean;
}

const assessmentLevels: {
  value: Assessment["level"];
  label: string;
  color: string;
}[] = [
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

export default function SkillCard({
  skill,
  assessment,
  onAssess,
  readonly = false,
}: SkillCardProps) {
  const currentLevel = assessment?.level || "none";

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{skill.name}</h3>
          <p className="text-gray-600 text-sm mt-1">{skill.description}</p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            assessmentLevels.find((l) => l.value === currentLevel)?.color
          }`}
        >
          {assessmentLevels.find((l) => l.value === currentLevel)?.label}
        </span>
      </div>

      {!readonly && (
        <div className="flex gap-2">
          {assessmentLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => onAssess(skill.id, level.value)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentLevel === level.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Step 5: Employee Dashboard

Create `src/app/dashboard/page.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  getSkills,
  getUserAssessments,
  createAssessment,
  updateAssessment,
} from "@/lib/firebase/firestore";
import SkillCard from "@/components/ui/SkillCard";
import type { Skill, Assessment } from "@/lib/types";

export default function Dashboard() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [skillsData, assessmentsData] = await Promise.all([
        getSkills(), // Load all available skills
        getUserAssessments(user.uid),
      ]);

      setSkills(skillsData);
      setAssessments(assessmentsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssessment = async (
    skillId: string,
    level: Assessment["level"]
  ) => {
    if (!user) return;

    const existingAssessment = assessments.find((a) => a.skillId === skillId);

    try {
      if (existingAssessment) {
        await updateAssessment(existingAssessment.id, {
          level,
          selfAssessedAt: new Date(),
        });
      } else {
        await createAssessment({
          userId: user.uid,
          skillId,
          level,
          selfAssessedAt: new Date(),
        });
      }

      // Refresh assessments
      const updatedAssessments = await getUserAssessments(user.uid);
      setAssessments(updatedAssessments);
    } catch (error) {
      console.error("Error updating assessment:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Career Development Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Track your skill progression and career development
        </p>
      </div>

      <div className="grid gap-6">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Generic Engineering Skills
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills
              .filter((skill) => skill.category === "generic")
              .map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  assessment={assessments.find((a) => a.skillId === skill.id)}
                  onAssess={handleAssessment}
                />
              ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Domain-Specific Skills
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills
              .filter((skill) => skill.category === "domain")
              .map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  assessment={assessments.find((a) => a.skillId === skill.id)}
                  onAssess={handleAssessment}
                />
              ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Team-Specific Skills
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills
              .filter((skill) => skill.category === "team")
              .map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  assessment={assessments.find((a) => a.skillId === skill.id)}
                  onAssess={handleAssessment}
                />
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
```

### Step 6: Admin Interface

Create `src/app/admin/page.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { createSkill, getSkills } from "@/lib/firebase/firestore";
import type { Skill } from "@/lib/types";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState({
    name: "",
    description: "",
    category: "generic" as Skill["category"],
    domain: "",
    applicableLevels: [1, 2, 3, 4, 5, 6, 7],
  });

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    const skillsData = await getSkills();
    setSkills(skillsData);
  };

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createSkill({
        ...newSkill,
        domain: newSkill.category === "domain" ? newSkill.domain : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setNewSkill({
        name: "",
        description: "",
        category: "generic",
        domain: "",
        applicableLevels: [1, 2, 3, 4, 5, 6, 7],
      });

      loadSkills();
    } catch (error) {
      console.error("Error creating skill:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Create New Skill</h2>

          <form onSubmit={handleCreateSkill} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill Name
              </label>
              <input
                type="text"
                value={newSkill.name}
                onChange={(e) =>
                  setNewSkill((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newSkill.description}
                onChange={(e) =>
                  setNewSkill((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={newSkill.category}
                onChange={(e) =>
                  setNewSkill((prev) => ({
                    ...prev,
                    category: e.target.value as Skill["category"],
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="generic">Generic Engineering</option>
                <option value="domain">Domain-Specific</option>
                <option value="team">Team-Specific</option>
              </select>
            </div>

            {newSkill.category === "domain" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domain
                </label>
                <input
                  type="text"
                  value={newSkill.domain}
                  onChange={(e) =>
                    setNewSkill((prev) => ({ ...prev, domain: e.target.value }))
                  }
                  placeholder="e.g., frontend, backend, devops"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Skill
            </button>
          </form>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Existing Skills</h2>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="p-3 border border-gray-200 rounded-md"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{skill.name}</h3>
                    <p className="text-sm text-gray-600">{skill.description}</p>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                    {skill.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
```

## Security Considerations

### Authentication & Authorization

1. **Role-based access control**: Users, team leaders, and admins have different permissions
2. **Firestore security rules**: Enforce data access patterns at the database level
3. **Server-side validation**: Always validate data on the server before writing to database
4. **Input sanitization**: Sanitize all user inputs to prevent XSS attacks

### Data Protection

1. **Environment variables**: Never commit sensitive keys to version control
2. **HTTPS only**: Enforce HTTPS in production
3. **Audit logging**: Track significant changes for compliance

### Firestore Best Practices

#### Automatic Level Progression with Triggers

The system uses **Firestore triggers** to automatically update user levels when skill requirements are met:

```typescript
// Firebase Functions - Level progression trigger
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { getFirestore } from "firebase-admin/firestore";

export const checkLevelProgression = onDocumentWritten(
  "assessments/{assessmentId}",
  async (event) => {
    const db = getFirestore();
    const assessment = event.data?.after?.data();

    if (!assessment) return;

    const { userId } = assessment;

    // Get user's current level and team configuration
    const [userDoc, assessmentsSnapshot, waiversSnapshot] = await Promise.all([
      db.doc(`users/${userId}`).get(),
      db.collection("assessments").where("userId", "==", userId).get(),
      db.collection("skillWaivers").where("userId", "==", userId).get(),
    ]);

    const user = userDoc.data();
    if (!user) return;

    // Get ladder configuration for user's team and domain
    const ladderConfigDoc = await db
      .collection("ladderConfigs")
      .where("teamId", "==", user.teamId)
      .where("domain", "==", user.domain)
      .limit(1)
      .get();

    if (ladderConfigDoc.empty) return;

    const ladderConfig = ladderConfigDoc.docs[0].data();
    const nextLevel = user.currentLevel + 1;

    if (nextLevel > 7) return; // Max level reached

    // Check if user meets requirements for next level
    const canAdvance = await checkLevelRequirements(
      userId,
      nextLevel,
      ladderConfig,
      assessmentsSnapshot,
      waiversSnapshot
    );

    if (canAdvance) {
      await userDoc.ref.update({
        currentLevel: nextLevel,
        updatedAt: new Date(),
      });
    }
  }
);

async function checkLevelRequirements(
  userId: string,
  targetLevel: number,
  ladderConfig: any,
  assessments: any,
  waivers: any
): Promise<boolean> {
  // Get all required skills for levels 1 through targetLevel
  const requiredSkills = [];
  for (let level = 1; level <= targetLevel; level++) {
    const levelSkills = ladderConfig.skillsByLevel[level];
    if (levelSkills) {
      requiredSkills.push(
        ...levelSkills.genericSkills,
        ...levelSkills.domainSkills,
        ...levelSkills.teamSkills
      );
    }
  }

  const assessmentMap = new Map();
  assessments.docs.forEach((doc) => {
    const data = doc.data();
    assessmentMap.set(data.skillId, data.level);
  });

  const waiverSet = new Set();
  waivers.docs.forEach((doc) => {
    const data = doc.data();
    if (data.level <= targetLevel) {
      waiverSet.add(data.skillId);
    }
  });

  // Check if all required skills are fluent or waived
  for (const skillId of requiredSkills) {
    if (waiverSet.has(skillId)) continue; // Skill is waived

    const assessmentLevel = assessmentMap.get(skillId);
    if (assessmentLevel !== "fluent") {
      return false; // Skill not at fluent level
    }
  }

  return true;
}
```

#### Transaction Best Practices

```typescript
// Use transactions for atomic operations
import { runTransaction } from "firebase/firestore";

const updateAssessmentWithLevelCheck = async (
  userId: string,
  skillId: string,
  level: string,
  assessedBy: string
) => {
  await runTransaction(db, async (transaction) => {
    // Verify team leader can assess this user
    const userDoc = await transaction.get(doc(db, "users", userId));
    if (!userDoc.exists()) throw new Error("User not found");

    const teamDoc = await transaction.get(
      doc(db, "teams", userDoc.data().teamId)
    );
    if (!teamDoc.exists() || teamDoc.data().leaderId !== assessedBy) {
      throw new Error("Unauthorized: Not team leader");
    }

    // Update assessment
    const assessmentRef = doc(db, "assessments", `${userId}_${skillId}`);
    transaction.set(assessmentRef, {
      userId,
      skillId,
      level,
      assessedBy,
      assessedAt: new Date(),
    });
  });
};
```

#### Error Handling for Skill Deletion

```typescript
// When deleting a skill, remove related assessments and waivers
const deleteSkillWithCleanup = async (skillId: string) => {
  const batch = writeBatch(db);

  // Delete all assessments for this skill
  const assessmentsSnapshot = await getDocs(
    query(collection(db, "assessments"), where("skillId", "==", skillId))
  );

  assessmentsSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Delete all waivers for this skill
  const waiversSnapshot = await getDocs(
    query(collection(db, "skillWaivers"), where("skillId", "==", skillId))
  );

  waiversSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Delete the skill itself
  batch.delete(doc(db, "skills", skillId));

  await batch.commit();
};
```

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# Project Settings > Environment Variables
```

### Environment Setup for Production

1. **Configure environment variables in Vercel** dashboard under Project Settings > Environment Variables
2. **Update Firebase security rules** for production
3. **Set up proper domain** in Firebase Authentication settings
4. **Configure CORS** if needed for API calls
5. **Set up monitoring** with Firebase Performance Monitoring

## Usage Guide

### For Employees

1. **Sign in** with your Google account
2. **View your current skills** and proficiency levels as assessed by your team leader
3. **Track your progress** toward the next career level with real-time updates
4. **Review level requirements** to understand what skills you need to develop
5. **See automatic level progression** immediately when all requirements are met
6. **View any skill waivers** granted by your team leader

### For Team Leaders

1. **Access team dashboard** with team leader permissions
2. **Assess team members' skills** by updating their proficiency levels (monthly/quarterly)
3. **Grant skill waivers** for individual team members when appropriate
4. **Create and manage team-specific skills** using the unified skill management interface
5. **Configure skill requirements** for each career level using the ladder configuration
6. **Monitor team progress** and see immediate level progressions
7. **Transfer leadership** to another team member if needed

### For Admins

1. **Manage user roles** and team assignments
2. **Create generic engineering skills** applicable to all roles using the unified skill management UI
3. **Define domain-specific skills** for different specializations
4. **Set up and manage predefined domains** for the organization
5. **Monitor system usage** and maintain data integrity
6. **Promote users** to team leader or admin roles
7. **Handle skill deletion** with automatic cleanup of related assessments and waivers

### Key Features

#### Immediate Level Progression

- Level advancement happens **instantly** when skill requirements are met
- Powered by Firestore triggers for real-time updates
- No manual approval process required

#### Skill Waiver System

- Team leaders can waive specific skills for exceptional cases
- Waivers include reason and timestamp for audit trail
- Waived skills don't block level progression

#### Unified Skill Management

- Single interface for creating skills across all categories
- Available to both admins and team leaders (with appropriate permissions)
- Automatic cleanup when skills are deleted

#### Flexible Assessment Schedule

- Team leaders assess skills on their own schedule (typically monthly/quarterly)
- Partial assessments supported - unassessed skills default to "None"
- No restrictions on assessment frequency

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd career-ladder

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

### Code Standards

- Use TypeScript for type safety
- Follow ESLint configuration
- Write tests for critical functionality
- Document complex business logic
- Use semantic commit messages

---

## Next Steps

1. **Set up your Firebase project** following the setup guide above
2. **Configure environment variables** with your Firebase credentials
3. **Run the development server** and test basic functionality
4. **Customize the skill definitions** for your organization
5. **Deploy to production** using Vercel

For questions or support, please open an issue in the repository or contact the development team.
