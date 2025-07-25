# Career Ladder App

A comprehensive career progression tracking system built with Next.js and Firebase, designed for engineering teams to manage skill development and career advancement.

## Table of Contents

- [Overview](#overview)
- [Core Concepts](#core-concepts)
- [Data Model](#data-model)
- [Architecture](#architecture)
- [Firebase Setup](#firebase-setup)
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
- **Self-assessment system** with progression tracking
- **Administrative interface** for team leaders
- **Role-based access control** and secure data management

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

1. **Generic Engineering Skills**: Shared across all roles (e.g., problem-solving, communication, code quality)
2. **Domain-Specific Skills**: Role-specific expertise (e.g., frontend, backend, DevOps, system administration)
3. **Team-Specific Skills**: Technologies and practices unique to each team

### Assessment States

- **None**: Does not have the skill
- **Learning**: Currently learning the skill
- **Proficient**: Can apply independently in some situations
- **Fluent**: Uses autonomously in all situations

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
  domain: string;
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
  selfAssessedAt: Timestamp;
  notes?: string;
}

// Ladder Configurations Collection
interface LadderConfig {
  id: string;
  teamId: string;
  domain: string;
  skillsByLevel: {
    [level: number]: {
      genericSkills: string[]; // skill IDs
      domainSkills: string[]; // skill IDs
      teamSkills: string[]; // skill IDs
    };
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
# 2. Enable "Email/Password"
# 3. Enable "Google" (recommended for corporate environments)
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

# Application
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## Next.js Configuration

### Install Dependencies

```bash
npm install firebase firebase-admin
npm install @next/auth next-auth
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
        && !('teamId' in request.resource.data.diff(resource.data));
    }

    // Team leaders can read their team members
    match /users/{userId} {
      allow read: if request.auth != null &&
        exists(/databases/$(database)/documents/teams/$(resource.data.teamId)) &&
        get(/databases/$(database)/documents/teams/$(resource.data.teamId)).data.leaderId == request.auth.uid;
    }

    // Teams - leaders can manage their own team
    match /teams/{teamId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        (resource == null || resource.data.leaderId == request.auth.uid);
    }

    // Skills - team leaders can manage skills for their domain/team
    match /skills/{skillId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        (request.resource.data.category == 'team' &&
         exists(/databases/$(database)/documents/teams/$(request.resource.data.teamId)) &&
         get(/databases/$(database)/documents/teams/$(request.resource.data.teamId)).data.leaderId == request.auth.uid);
    }

    // Assessments - users can only manage their own assessments
    match /assessments/{assessmentId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }

    // Ladder configurations - team leaders only
    match /ladderConfigs/{configId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        exists(/databases/$(database)/documents/teams/$(request.resource.data.teamId)) &&
        get(/databases/$(database)/documents/teams/$(request.resource.data.teamId)).data.leaderId == request.auth.uid;
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

```typescript
// Use transactions for atomic operations
import { runTransaction } from "firebase/firestore";

const updateAssessmentWithValidation = async (
  userId: string,
  skillId: string,
  level: string
) => {
  await runTransaction(db, async (transaction) => {
    // Verify user owns this assessment
    const userDoc = await transaction.get(doc(db, "users", userId));
    if (!userDoc.exists()) throw new Error("User not found");

    // Update assessment
    const assessmentRef = doc(db, "assessments", `${userId}_${skillId}`);
    transaction.set(assessmentRef, {
      userId,
      skillId,
      level,
      selfAssessedAt: new Date(),
    });
  });
};
```

## Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# Project Settings > Environment Variables
```

### Option 2: Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

### Environment Setup for Production

1. **Update Firebase security rules** for production
2. **Set up proper domain** in Firebase Authentication settings
3. **Configure CORS** if needed for API calls
4. **Set up monitoring** with Firebase Performance Monitoring

## Usage Guide

### For Employees

1. **Sign in** with your company email
2. **View current skills** required for your level and domain
3. **Self-assess** your proficiency level for each skill
4. **Track progress** over time with visual indicators
5. **Review level requirements** to understand advancement criteria

### For Team Leaders

1. **Access admin dashboard** with team leader permissions
2. **Define team-specific skills** relevant to your technology stack
3. **Configure skill requirements** for each career level
4. **Monitor team progress** and identify skill gaps
5. **Export reports** for performance reviews

### For System Administrators

1. **Manage user roles** and team assignments
2. **Define generic engineering skills** applicable to all roles
3. **Set up domain-specific skills** for different specializations
4. **Monitor system usage** and performance
5. **Backup and maintain** data integrity

## Alternative Technology Considerations

### Database Alternatives

| Option          | Pros                                              | Cons                                   | Best For                                 |
| --------------- | ------------------------------------------------- | -------------------------------------- | ---------------------------------------- |
| **Firestore**   | Easy setup, real-time updates, generous free tier | Vendor lock-in, query limitations      | Small-medium teams, rapid prototyping    |
| **Supabase**    | Open source, PostgreSQL, better querying          | More complex setup, smaller ecosystem  | Teams wanting PostgreSQL features        |
| **PlanetScale** | Serverless MySQL, branching, better SQL           | More expensive, requires SQL knowledge | Teams with complex relational data needs |

### Authentication Alternatives

| Option            | Pros                                            | Cons                          | Best For                         |
| ----------------- | ----------------------------------------------- | ----------------------------- | -------------------------------- |
| **Firebase Auth** | Easy integration, multiple providers            | Vendor lock-in                | Quick setup with Google services |
| **Auth0**         | Enterprise features, extensive customization    | More expensive, complex setup | Large organizations              |
| **NextAuth.js**   | Open source, flexible, good Next.js integration | More configuration required   | Teams wanting full control       |

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
5. **Deploy to production** using Vercel or Firebase Hosting

For questions or support, please open an issue in the repository or contact the development team.
