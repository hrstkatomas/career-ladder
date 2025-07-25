"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  getSkills,
  createSkill,
  getDomains,
  getUsers,
  updateUser,
  getTeams,
} from "@/lib/firebase/firestore";
import SkillCard from "@/components/ui/SkillCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { Skill, Domain, User, Team } from "@/lib/types";

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"skills" | "users" | "teams">(
    "skills"
  );

  // New skill form state
  const [newSkill, setNewSkill] = useState({
    name: "",
    description: "",
    category: "generic" as Skill["category"],
    domain: "",
    teamId: "",
    applicableLevels: [1, 2, 3, 4, 5, 6, 7],
  });
  const [creating, setCreating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [skillsData, domainsData, usersData, teamsData] = await Promise.all(
        [getSkills(), getDomains(), getUsers(), getTeams()]
      );

      setSkills(skillsData);
      setDomains(domainsData);
      setUsers(usersData);
      setTeams(teamsData);
    } catch (error) {
      console.error("Error loading admin data:", error);
      setError("Failed to load admin data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && isAdmin) {
      loadData();
    } else if (user && !isAdmin) {
      setError("Access denied. You need admin privileges to view this page.");
      setLoading(false);
    }
  }, [user, isAdmin, loadData]);

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSkill.name || !newSkill.description) {
      return;
    }

    setCreating(true);
    try {
      const skillData: Omit<Skill, "id" | "createdAt" | "updatedAt"> = {
        name: newSkill.name,
        description: newSkill.description,
        category: newSkill.category,
        applicableLevels: newSkill.applicableLevels,
      };

      // Add domain or teamId based on category
      if (newSkill.category === "domain" && newSkill.domain) {
        skillData.domain = newSkill.domain;
      } else if (newSkill.category === "team" && newSkill.teamId) {
        skillData.teamId = newSkill.teamId;
      }

      await createSkill(skillData);

      // Reset form
      setNewSkill({
        name: "",
        description: "",
        category: "generic",
        domain: "",
        teamId: "",
        applicableLevels: [1, 2, 3, 4, 5, 6, 7],
      });

      // Reload skills
      await loadData();
    } catch (error) {
      console.error("Error creating skill:", error);
      setError("Failed to create skill. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateUserRole = async (
    userId: string,
    newRole: User["role"]
  ) => {
    try {
      await updateUser(userId, { role: newRole });
      await loadData(); // Reload to get updated data
    } catch (error) {
      console.error("Error updating user role:", error);
      setError("Failed to update user role. Please try again.");
    }
  };

  const handleUpdateUserTeam = async (
    userId: string,
    teamId: string,
    domain: string
  ) => {
    try {
      await updateUser(userId, { teamId, domain });
      await loadData(); // Reload to get updated data
    } catch (error) {
      console.error("Error updating user team:", error);
      setError("Failed to update user team. Please try again.");
    }
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

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          Access denied. Admin privileges required.
        </p>
      </div>
    );
  }

  const categorizedSkills = {
    generic: skills.filter((skill) => skill.category === "generic"),
    domain: skills.filter((skill) => skill.category === "domain"),
    team: skills.filter((skill) => skill.category === "team"),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage skills, users, and teams for the career ladder system
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: "skills", label: "Skills Management" },
              { id: "users", label: "User Management" },
              { id: "teams", label: "Team Management" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Skills Management Tab */}
        {activeTab === "skills" && (
          <div className="space-y-8">
            {/* Create New Skill Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Create New Skill
              </h2>

              <form onSubmit={handleCreateSkill} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="skill-name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Skill Name *
                    </label>
                    <input
                      id="skill-name"
                      type="text"
                      value={newSkill.name}
                      onChange={(e) =>
                        setNewSkill((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="skill-category"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Category *
                    </label>
                    <select
                      id="skill-category"
                      value={newSkill.category}
                      onChange={(e) =>
                        setNewSkill((prev) => ({
                          ...prev,
                          category: e.target.value as Skill["category"],
                          domain: "",
                          teamId: "",
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="generic">Generic Engineering</option>
                      <option value="domain">Domain-Specific</option>
                      <option value="team">Team-Specific</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="skill-description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description *
                  </label>
                  <textarea
                    id="skill-description"
                    value={newSkill.description}
                    onChange={(e) =>
                      setNewSkill((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Domain selection for domain-specific skills */}
                {newSkill.category === "domain" && (
                  <div>
                    <label
                      htmlFor="skill-domain"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Domain *
                    </label>
                    <select
                      id="skill-domain"
                      value={newSkill.domain}
                      onChange={(e) =>
                        setNewSkill((prev) => ({
                          ...prev,
                          domain: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a domain</option>
                      {domains.map((domain) => (
                        <option
                          key={domain.id}
                          value={domain.name.toLowerCase()}
                        >
                          {domain.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Team selection for team-specific skills */}
                {newSkill.category === "team" && (
                  <div>
                    <label
                      htmlFor="skill-team"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Team *
                    </label>
                    <select
                      id="skill-team"
                      value={newSkill.teamId}
                      onChange={(e) =>
                        setNewSkill((prev) => ({
                          ...prev,
                          teamId: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a team</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Applicable Levels */}
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-2">
                    Applicable Levels
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((level) => (
                      <label key={level} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newSkill.applicableLevels.includes(level)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewSkill((prev) => ({
                                ...prev,
                                applicableLevels: [
                                  ...prev.applicableLevels,
                                  level,
                                ].sort(),
                              }));
                            } else {
                              setNewSkill((prev) => ({
                                ...prev,
                                applicableLevels: prev.applicableLevels.filter(
                                  (l) => l !== level
                                ),
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          L{level}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full md:w-auto bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Creating..." : "Create Skill"}
                </button>
              </form>
            </div>

            {/* Existing Skills */}
            <div className="space-y-6">
              {/* Generic Skills */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Generic Engineering Skills ({categorizedSkills.generic.length}
                  )
                </h2>
                {categorizedSkills.generic.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categorizedSkills.generic.map((skill) => (
                      <SkillCard key={skill.id} skill={skill} readonly={true} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No generic skills created yet.
                  </p>
                )}
              </section>

              {/* Domain-Specific Skills */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Domain-Specific Skills ({categorizedSkills.domain.length})
                </h2>
                {categorizedSkills.domain.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categorizedSkills.domain.map((skill) => (
                      <SkillCard key={skill.id} skill={skill} readonly={true} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No domain-specific skills created yet.
                  </p>
                )}
              </section>

              {/* Team-Specific Skills */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Team-Specific Skills ({categorizedSkills.team.length})
                </h2>
                {categorizedSkills.team.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categorizedSkills.team.map((skill) => (
                      <SkillCard key={skill.id} skill={skill} readonly={true} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No team-specific skills created yet.
                  </p>
                )}
              </section>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                User Management
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage user roles and team assignments
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((userData) => {
                    const userTeam = teams.find(
                      (t) => t.id === userData.teamId
                    );
                    return (
                      <tr key={userData.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {userData.name || "Unknown User"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {userData.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={userData.role}
                            onChange={(e) =>
                              handleUpdateUserRole(
                                userData.id,
                                e.target.value as User["role"]
                              )
                            }
                            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="employee">Employee</option>
                            <option value="team_leader">Team Leader</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {userTeam?.name || "No team assigned"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {userData.domain || "No domain assigned"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            L{userData.currentLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <select
                            value={userData.teamId || ""}
                            onChange={(e) => {
                              const selectedTeam = teams.find(
                                (t) => t.id === e.target.value
                              );
                              if (
                                selectedTeam &&
                                selectedTeam.domains.length > 0
                              ) {
                                handleUpdateUserTeam(
                                  userData.id,
                                  e.target.value,
                                  selectedTeam.domains[0]
                                );
                              }
                            }}
                            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">No team</option>
                            {teams.map((team) => (
                              <option key={team.id} value={team.id}>
                                {team.name}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Team Management Tab */}
        {activeTab === "teams" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Team Management
            </h2>

            {teams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teams.map((team) => {
                  const teamLeader = users.find((u) => u.id === team.leaderId);
                  const teamMembers = users.filter((u) => u.teamId === team.id);

                  return (
                    <div
                      key={team.id}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {team.name}
                      </h3>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">
                            Leader:
                          </span>{" "}
                          <span className="text-gray-600">
                            {teamLeader?.name || "Not assigned"}
                          </span>
                        </div>

                        <div>
                          <span className="font-medium text-gray-700">
                            Domains:
                          </span>{" "}
                          <span className="text-gray-600">
                            {team.domains.join(", ")}
                          </span>
                        </div>

                        <div>
                          <span className="font-medium text-gray-700">
                            Members:
                          </span>{" "}
                          <span className="text-gray-600">
                            {teamMembers.length} people
                          </span>
                        </div>

                        <div>
                          <span className="font-medium text-gray-700">
                            Created:
                          </span>{" "}
                          <span className="text-gray-600">
                            {new Date(
                              team.createdAt.toDate()
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 italic">No teams configured yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
