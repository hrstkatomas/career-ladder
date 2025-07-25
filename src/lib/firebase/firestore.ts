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
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import type {
  User,
  Team,
  Skill,
  Assessment,
  LadderConfig,
  Domain,
  SkillWaiver,
} from "@/lib/types";

// Users
export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists()
      ? ({ id: docSnap.id, ...docSnap.data() } as User)
      : null;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
};

export const updateUser = async (userId: string, data: Partial<User>) => {
  try {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
  } catch (error) {
    console.error("Error getting users:", error);
    throw error;
  }
};

export const getUsersByTeam = async (teamId: string): Promise<User[]> => {
  try {
    const q = query(collection(db, "users"), where("teamId", "==", teamId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
  } catch (error) {
    console.error("Error getting users by team:", error);
    throw error;
  }
};

// Teams
export const getTeam = async (teamId: string): Promise<Team | null> => {
  try {
    const docRef = doc(db, "teams", teamId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists()
      ? ({ id: docSnap.id, ...docSnap.data() } as Team)
      : null;
  } catch (error) {
    console.error("Error getting team:", error);
    throw error;
  }
};

export const getTeams = async (): Promise<Team[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "teams"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Team[];
  } catch (error) {
    console.error("Error getting teams:", error);
    throw error;
  }
};

export const createTeam = async (
  team: Omit<Team, "id" | "createdAt" | "updatedAt">
) => {
  try {
    const docRef = await addDoc(collection(db, "teams"), {
      ...team,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating team:", error);
    throw error;
  }
};

export const updateTeam = async (teamId: string, data: Partial<Team>) => {
  try {
    const docRef = doc(db, "teams", teamId);
    await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
  } catch (error) {
    console.error("Error updating team:", error);
    throw error;
  }
};

// Skills
export const getSkills = async (filters?: {
  category?: string;
  domain?: string;
  teamId?: string;
}): Promise<Skill[]> => {
  try {
    let q = query(collection(db, "skills"));

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
  } catch (error) {
    console.error("Error getting skills:", error);
    throw error;
  }
};

export const getSkill = async (skillId: string): Promise<Skill | null> => {
  try {
    const docRef = doc(db, "skills", skillId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists()
      ? ({ id: docSnap.id, ...docSnap.data() } as Skill)
      : null;
  } catch (error) {
    console.error("Error getting skill:", error);
    throw error;
  }
};

export const createSkill = async (
  skill: Omit<Skill, "id" | "createdAt" | "updatedAt">
) => {
  try {
    const docRef = await addDoc(collection(db, "skills"), {
      ...skill,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating skill:", error);
    throw error;
  }
};

export const updateSkill = async (skillId: string, data: Partial<Skill>) => {
  try {
    const docRef = doc(db, "skills", skillId);
    await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
  } catch (error) {
    console.error("Error updating skill:", error);
    throw error;
  }
};

export const deleteSkill = async (skillId: string) => {
  try {
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
  } catch (error) {
    console.error("Error deleting skill:", error);
    throw error;
  }
};

// Assessments
export const getUserAssessments = async (
  userId: string
): Promise<Assessment[]> => {
  try {
    const q = query(
      collection(db, "assessments"),
      where("userId", "==", userId),
      orderBy("assessedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Assessment[];
  } catch (error) {
    console.error("Error getting user assessments:", error);
    throw error;
  }
};

export const getTeamAssessments = async (
  teamId: string
): Promise<Assessment[]> => {
  try {
    // First get all users in the team
    const teamUsers = await getUsersByTeam(teamId);
    const userIds = teamUsers.map((user) => user.id);

    if (userIds.length === 0) return [];

    // Get assessments for all team members
    const assessments: Assessment[] = [];
    for (const userId of userIds) {
      const userAssessments = await getUserAssessments(userId);
      assessments.push(...userAssessments);
    }

    return assessments;
  } catch (error) {
    console.error("Error getting team assessments:", error);
    throw error;
  }
};

export const updateAssessment = async (
  assessmentId: string,
  data: Partial<Assessment>
) => {
  try {
    const docRef = doc(db, "assessments", assessmentId);
    await updateDoc(docRef, { ...data, assessedAt: Timestamp.now() });
  } catch (error) {
    console.error("Error updating assessment:", error);
    throw error;
  }
};

export const createAssessment = async (
  assessment: Omit<Assessment, "id" | "assessedAt">
) => {
  try {
    const docRef = await addDoc(collection(db, "assessments"), {
      ...assessment,
      assessedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating assessment:", error);
    throw error;
  }
};

export const createOrUpdateAssessment = async (
  userId: string,
  skillId: string,
  level: Assessment["level"],
  assessedBy: string,
  notes?: string
) => {
  try {
    // Check if assessment already exists
    const q = query(
      collection(db, "assessments"),
      where("userId", "==", userId),
      where("skillId", "==", skillId)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Create new assessment
      return await createAssessment({
        userId,
        skillId,
        level,
        assessedBy,
        notes,
      });
    } else {
      // Update existing assessment
      const existingDoc = querySnapshot.docs[0];
      await updateAssessment(existingDoc.id, {
        level,
        assessedBy,
        notes,
      });
      return existingDoc.id;
    }
  } catch (error) {
    console.error("Error creating or updating assessment:", error);
    throw error;
  }
};

// Skill Waivers
export const getUserWaivers = async (
  userId: string
): Promise<SkillWaiver[]> => {
  try {
    const q = query(
      collection(db, "skillWaivers"),
      where("userId", "==", userId),
      orderBy("waivedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SkillWaiver[];
  } catch (error) {
    console.error("Error getting user waivers:", error);
    throw error;
  }
};

export const createSkillWaiver = async (
  waiver: Omit<SkillWaiver, "id" | "waivedAt">
) => {
  try {
    const docRef = await addDoc(collection(db, "skillWaivers"), {
      ...waiver,
      waivedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating skill waiver:", error);
    throw error;
  }
};

export const deleteSkillWaiver = async (waiverId: string) => {
  try {
    await deleteDoc(doc(db, "skillWaivers", waiverId));
  } catch (error) {
    console.error("Error deleting skill waiver:", error);
    throw error;
  }
};

// Domains
export const getDomains = async (): Promise<Domain[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "domains"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Domain[];
  } catch (error) {
    console.error("Error getting domains:", error);
    throw error;
  }
};

export const createDomain = async (
  domain: Omit<Domain, "id" | "createdAt">
) => {
  try {
    const docRef = await addDoc(collection(db, "domains"), {
      ...domain,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating domain:", error);
    throw error;
  }
};

// Ladder Configurations
export const getLadderConfig = async (
  teamId: string,
  domain: string
): Promise<LadderConfig | null> => {
  try {
    const q = query(
      collection(db, "ladderConfigs"),
      where("teamId", "==", teamId),
      where("domain", "==", domain)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as LadderConfig;
  } catch (error) {
    console.error("Error getting ladder config:", error);
    throw error;
  }
};

export const createLadderConfig = async (
  config: Omit<LadderConfig, "id" | "createdAt" | "updatedAt">
) => {
  try {
    const docRef = await addDoc(collection(db, "ladderConfigs"), {
      ...config,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating ladder config:", error);
    throw error;
  }
};

export const updateLadderConfig = async (
  configId: string,
  data: Partial<LadderConfig>
) => {
  try {
    const docRef = doc(db, "ladderConfigs", configId);
    await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
  } catch (error) {
    console.error("Error updating ladder config:", error);
    throw error;
  }
};
