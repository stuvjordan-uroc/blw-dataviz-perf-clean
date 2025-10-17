interface CharacteristicPickerProps {
  onCharacteristicSelect: (characteristic: string) => void;
}

function CharacteristicPicker({
  onCharacteristicSelect,
}: CharacteristicPickerProps) {
  return (
    <div>
      <h2>Select a Characteristic</h2>
      {/* Characteristic selection UI will be implemented here */}
      <p>Characteristic picker coming soon...</p>
    </div>
  );
}

export default CharacteristicPicker;
