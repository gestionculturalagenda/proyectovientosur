import React from 'react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

const emojis = [
  '🎉', '🎂', '🥳', '🎈', '🎁', '😊', '🥰', '💖', '🍰', '🍾', '✨', '🌟', '🎊', '😃', '😎', '🤩', '🙌', '👏', '💐', '🧁', '🍬', '🍭', '🍦', '🍨', '🍧', '🍡', '🍪', '🍫', '🍩', '🍮', '🍯', '🍵', '☕', '🧃', '🥤', '🍹', '🍸', '🍷', '🥂', '🍻', '🍺', '🥃', '🧉', '🧊', '🍾', '🥄', '🍽️', '🥢', '🍴', '🥄', '🍽️', '🥢', '🍴'
];

const uniqueEmojis = Array.from(new Set(emojis));

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 max-w-xs">
      {uniqueEmojis.map((emoji, idx) => (
        <button
          key={emoji + '-' + idx}
          type="button"
          className="text-2xl hover:scale-125 transition-transform focus:outline-none"
          onClick={() => onSelect(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default EmojiPicker;
