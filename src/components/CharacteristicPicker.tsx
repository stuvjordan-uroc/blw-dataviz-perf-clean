import React, { useState, useEffect } from "react";
import type {
  QuestionsData,
  GroupedPrompts,
  QuestionPrompt,
} from "../types/questions";
import questionsData from "../assets/config/questions.json";

interface CharacteristicPickerProps {
  onCharacteristicSelect: (characteristic: string) => void;
  selectedCharacteristic?: string | null;
}

const CharacteristicPicker: React.FC<CharacteristicPickerProps> = ({
  onCharacteristicSelect,
  selectedCharacteristic,
}) => {
  const [groupedPrompts, setGroupedPrompts] = useState<GroupedPrompts>({});
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Group prompts by category
    const questions = questionsData as QuestionsData;
    const grouped = questions.prompts.reduce(
      (acc: GroupedPrompts, prompt: QuestionPrompt) => {
        if (!acc[prompt.category]) {
          acc[prompt.category] = [];
        }
        acc[prompt.category].push(prompt);
        return acc;
      },
      {}
    );

    setGroupedPrompts(grouped);
  }, []);

  const handleCharacteristicSelect = (variableName: string): void => {
    onCharacteristicSelect(variableName);
    setIsOpen(false);
  };

  const getSelectedPrompt = (): QuestionPrompt | null => {
    if (!selectedCharacteristic) return null;

    for (const prompts of Object.values(groupedPrompts)) {
      const found = prompts.find(
        (p) => p.variable_name === selectedCharacteristic
      );
      if (found) return found;
    }
    return null;
  };

  const selectedPrompt = getSelectedPrompt();

  return (
    <div style={{ margin: "20px", maxWidth: "600px" }}>
      <h2 style={{ marginBottom: "16px", color: "#1f2937" }}>
        Select a Characteristic
      </h2>

      <div style={{ position: "relative", width: "100%", maxWidth: "500px" }}>
        <button
          style={{
            width: "100%",
            padding: "12px 16px",
            background: "white",
            border: `2px solid ${isOpen ? "#3b82f6" : "#d1d5db"}`,
            borderRadius: isOpen ? "8px 8px 0 0" : "8px",
            textAlign: "left",
            cursor: "pointer",
            fontSize: "14px",
            color: "#374151",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>
            {selectedPrompt
              ? selectedPrompt.short_text
              : "Choose a characteristic..."}
          </span>
          <span
            style={{
              color: "#6b7280",
              fontSize: "12px",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            ▼
          </span>
        </button>

        {isOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "white",
              border: "2px solid #3b82f6",
              borderTop: "none",
              borderRadius: "0 0 8px 8px",
              maxHeight: "400px",
              overflowY: "auto",
              zIndex: 1000,
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            {Object.entries(groupedPrompts).map(([category, prompts]) => (
              <div key={category} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <div
                  style={{
                    padding: "12px 16px 8px",
                    fontWeight: "600",
                    color: "#1f2937",
                    fontSize: "13px",
                    background: "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {category}
                </div>
                {prompts.map((prompt) => (
                  <button
                    key={prompt.variable_name}
                    style={{
                      width: "100%",
                      padding: "10px 16px 10px 24px",
                      textAlign: "left",
                      background:
                        selectedCharacteristic === prompt.variable_name
                          ? "#dbeafe"
                          : "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "13px",
                      color:
                        selectedCharacteristic === prompt.variable_name
                          ? "#1d4ed8"
                          : "#374151",
                      lineHeight: "1.4",
                      fontWeight:
                        selectedCharacteristic === prompt.variable_name
                          ? "500"
                          : "normal",
                    }}
                    onClick={() =>
                      handleCharacteristicSelect(prompt.variable_name)
                    }
                    title={prompt.question_text}
                    onMouseEnter={(e) => {
                      if (selectedCharacteristic !== prompt.variable_name) {
                        e.currentTarget.style.background = "#f3f4f6";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCharacteristic !== prompt.variable_name) {
                        e.currentTarget.style.background = "none";
                      }
                    }}
                  >
                    {prompt.short_text}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacteristicPicker;
