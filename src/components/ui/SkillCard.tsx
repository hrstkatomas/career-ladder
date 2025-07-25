import { Skill, Assessment, ASSESSMENT_LEVELS } from "@/lib/types";

interface SkillCardProps {
  skill: Skill;
  assessment?: Assessment;
  onAssess?: (skillId: string, level: Assessment["level"]) => void;
  readonly?: boolean;
  showNotes?: boolean;
}

export default function SkillCard({
  skill,
  assessment,
  onAssess,
  readonly = false,
  showNotes = false,
}: SkillCardProps) {
  const currentLevel = assessment?.level || "none";
  const currentLevelConfig = ASSESSMENT_LEVELS.find(
    (l) => l.value === currentLevel
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 mr-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {skill.name}
          </h3>
          <p className="text-gray-600 text-sm mb-2">{skill.description}</p>

          {/* Skill metadata */}
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
              {skill.category}
            </span>
            {skill.domain && (
              <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-medium">
                {skill.domain}
              </span>
            )}
            <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
              L{skill.applicableLevels.join(", L")}
            </span>
          </div>
        </div>

        {/* Current assessment level */}
        <div className="flex flex-col items-end">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${currentLevelConfig?.color}`}
          >
            {currentLevelConfig?.label}
          </span>
          {assessment?.assessedAt && (
            <span className="text-xs text-gray-500 mt-1">
              Updated{" "}
              {new Date(assessment.assessedAt.toDate()).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Assessment notes */}
      {showNotes && assessment?.notes && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Notes:</span> {assessment.notes}
          </p>
        </div>
      )}

      {/* Assessment buttons for team leaders */}
      {!readonly && onAssess && (
        <div className="grid grid-cols-4 gap-2">
          {ASSESSMENT_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => onAssess(skill.id, level.value)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                currentLevel === level.value
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      )}

      {/* Read-only indicator for employees */}
      {readonly && (
        <div className="mt-4 text-xs text-gray-500 italic">
          Assessed by your team leader
        </div>
      )}
    </div>
  );
}
