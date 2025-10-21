//css
import "./CharacteristicPicker.css";
//hooks
import React, { useState, useEffect } from "react";
//components
import Spinner from "./elements/Spinner";
//types
import type {
  QuestionsData,
  GroupedPrompts,
  QuestionPrompt,
} from "../types/questions";
//config
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDirectoryExists = async (path: string): Promise<boolean> => {
      try {
        const response = await fetch(path, { method: "HEAD" });
        return response.ok;
      } catch {
        return false;
      }
    };

    const filterAndGroupPrompts = async (): Promise<void> => {
      setIsLoading(true);
      const questions = questionsData as QuestionsData;

      // Filter prompts that have corresponding directories in either public/imp/ or public/perf/
      const filteredPrompts: QuestionPrompt[] = [];

      for (const prompt of questions.prompts) {
        const impDirExists = await checkDirectoryExists(
          `/imp/${prompt.variable_name}/`
        );
        const perfDirExists = await checkDirectoryExists(
          `/perf/${prompt.variable_name}/`
        );

        if (impDirExists || perfDirExists) {
          filteredPrompts.push(prompt);
        }
      }

      // Group filtered prompts by category
      const grouped = filteredPrompts.reduce(
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
      setIsLoading(false);
    };

    filterAndGroupPrompts();
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
    <div className="characteristic-picker">
      <div className="characteristic-picker__dropdown">
        <button
          className={`characteristic-picker__button ${
            isOpen ? "characteristic-picker__button--open" : ""
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>
            {selectedPrompt
              ? selectedPrompt.question_text
              : "Choose a characteristic of democracy..."}
          </span>
          <span
            className={`characteristic-picker__arrow ${
              isOpen ? "characteristic-picker__arrow--open" : ""
            }`}
          >
            ▼
          </span>
        </button>

        {isOpen && (
          <div className="characteristic-picker__menu">
            {isLoading ? (
              <div className="characteristic-picker__loading">
                <Spinner />
              </div>
            ) : (
              Object.entries(groupedPrompts).map(([category, prompts]) => (
                <div key={category} className="characteristic-picker__category">
                  <div className="characteristic-picker__category-header">
                    {category}
                  </div>
                  {prompts.map((prompt) => (
                    <button
                      key={prompt.variable_name}
                      className={`characteristic-picker__option ${
                        selectedCharacteristic === prompt.variable_name
                          ? "characteristic-picker__option--selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleCharacteristicSelect(prompt.variable_name)
                      }
                      title={prompt.question_text}
                    >
                      {prompt.short_text}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacteristicPicker;
