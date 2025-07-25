"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  getSkills,
  getUserAssessments,
  getUserWaivers,
  getLadderConfig,
} from "@/lib/firebase/firestore";
import SkillCard from "@/components/ui/SkillCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import {
  Skill,
  Assessment,
  SkillWaiver,
  LadderConfig,
  CAREER_LEVELS,
} from "@/lib/types";

export default function EmployeeDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [waivers, setWaivers] = useState<SkillWaiver[]>([]);
  const [ladderConfig, setLadderConfig] = useState<LadderConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);
      const [allSkills, userAssessments, userWaivers, ladderConfigData] =
        await Promise.all([
          getSkills(),
          getUserAssessments(user.id),
          getUserWaivers(user.id),
          getLadderConfig(user.teamId, user.domain),
        ]);

      setSkills(allSkills);
      setAssessments(userAssessments);
      setWaivers(userWaivers);
      setLadderConfig(ladderConfigData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Failed to load your dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.teamId && user.domain) {
      loadData();
    } else if (user && (!user.teamId || !user.domain)) {
      setError(
        "Your account is not fully configured. Please contact your administrator to assign you to a team and domain."
      );
      setLoading(false);
    }
  }, [user, loadData]);

  const getSkillsForLevel = (level: number) => {
    if (!ladderConfig) return [];

    const levelConfig = ladderConfig.skillsByLevel[level];
    if (!levelConfig) return [];

    const skillIds = [
      ...levelConfig.genericSkills,
      ...levelConfig.domainSkills,
      ...levelConfig.teamSkills,
    ];

    return skills.filter((skill) => skillIds.includes(skill.id));
  };

  const getCurrentLevelProgress = () => {
    if (!user || !ladderConfig) return { completed: 0, total: 0 };

    const currentLevelSkills = getSkillsForLevel(user.currentLevel);
    const waivedSkillIds = waivers
      .filter((w) => w.level <= user.currentLevel)
      .map((w) => w.skillId);

    const requiredSkills = currentLevelSkills.filter(
      (skill) => !waivedSkillIds.includes(skill.id)
    );

    const completedSkills = requiredSkills.filter((skill) => {
      const assessment = assessments.find((a) => a.skillId === skill.id);
      return assessment?.level === "fluent";
    });

    return {
      completed: completedSkills.length,
      total: requiredSkills.length,
    };
  };

  const getNextLevelProgress = () => {
    if (!user || !ladderConfig || user.currentLevel >= 7) return null;

    const nextLevel = user.currentLevel + 1;
    const nextLevelSkills = getSkillsForLevel(nextLevel);
    const waivedSkillIds = waivers
      .filter((w) => w.level <= nextLevel)
      .map((w) => w.skillId);

    const requiredSkills = nextLevelSkills.filter(
      (skill) => !waivedSkillIds.includes(skill.id)
    );

    const completedSkills = requiredSkills.filter((skill) => {
      const assessment = assessments.find((a) => a.skillId === skill.id);
      return assessment?.level === "fluent";
    });

    return {
      level: nextLevel,
      completed: completedSkills.length,
      total: requiredSkills.length,
    };
  };

  if (authLoading || loading) {
    return <LoadingSpinner size="lg" className="min-h-screen" />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <ErrorMessage message={error} onRetry={loadData} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  const currentLevelInfo = CAREER_LEVELS.find(
    (l) => l.level === user.currentLevel
  );
  const currentProgress = getCurrentLevelProgress();
  const nextProgress = getNextLevelProgress();

  const categorizedSkills = {
    generic: skills.filter((skill) => skill.category === "generic"),
    domain: skills.filter(
      (skill) => skill.category === "domain" && skill.domain === user.domain
    ),
    team: skills.filter(
      (skill) => skill.category === "team" && skill.teamId === user.teamId
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Career Development Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Track your skill progression and career development
          </p>
        </div>

        {/* Current Level & Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Current Level */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Current Level
            </h2>
            {currentLevelInfo && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-blue-600">
                    L{currentLevelInfo.level}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {currentLevelInfo.focus}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {currentLevelInfo.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {currentLevelInfo.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Skills Mastered</span>
                    <span>
                      {currentProgress.completed}/{currentProgress.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width:
                          currentProgress.total > 0
                            ? `${
                                (currentProgress.completed /
                                  currentProgress.total) *
                                100
                              }%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Next Level Preview */}
          {nextProgress && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Next Level Progress
              </h2>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-green-600">
                    L{nextProgress.level}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    In Progress
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Skills Ready</span>
                    <span>
                      {nextProgress.completed}/{nextProgress.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width:
                          nextProgress.total > 0
                            ? `${
                                (nextProgress.completed / nextProgress.total) *
                                100
                              }%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>

                {nextProgress.completed === nextProgress.total &&
                  nextProgress.total > 0 && (
                    <p className="text-green-600 text-sm font-medium">
                      🎉 Ready for promotion! Your team leader will update your
                      level.
                    </p>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Skills Sections */}
        <div className="space-y-8">
          {/* Generic Engineering Skills */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Generic Engineering Skills
            </h2>
            {categorizedSkills.generic.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorizedSkills.generic.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    assessment={assessments.find((a) => a.skillId === skill.id)}
                    readonly={true}
                    showNotes={true}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No generic skills available.
              </p>
            )}
          </section>

          {/* Domain-Specific Skills */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {user.domain} Domain Skills
            </h2>
            {categorizedSkills.domain.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorizedSkills.domain.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    assessment={assessments.find((a) => a.skillId === skill.id)}
                    readonly={true}
                    showNotes={true}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No domain-specific skills available.
              </p>
            )}
          </section>

          {/* Team-Specific Skills */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Team-Specific Skills
            </h2>
            {categorizedSkills.team.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorizedSkills.team.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    assessment={assessments.find((a) => a.skillId === skill.id)}
                    readonly={true}
                    showNotes={true}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No team-specific skills configured yet.
              </p>
            )}
          </section>

          {/* Skill Waivers */}
          {waivers.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Skill Waivers
              </h2>
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-4">
                  Waived Skills
                </h3>
                <div className="space-y-3">
                  {waivers.map((waiver) => {
                    const skill = skills.find((s) => s.id === waiver.skillId);
                    return (
                      <div
                        key={waiver.id}
                        className="flex justify-between items-start bg-white p-4 rounded-md"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {skill?.name || "Unknown Skill"}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Waived for Level {waiver.level}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            <span className="font-medium">Reason:</span>{" "}
                            {waiver.reason}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(
                            waiver.waivedAt.toDate()
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
