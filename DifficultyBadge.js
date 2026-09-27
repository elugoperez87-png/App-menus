import { DIFFICULTY_LABELS, DIFFICULTY_STYLES } from '../lib/categories';

export default function DifficultyBadge({ difficulty }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
        DIFFICULTY_STYLES[difficulty] || 'bg-ink/5 text-ink/60 border-ink/10'
      }`}
    >
      {DIFFICULTY_LABELS[difficulty] || difficulty}
    </span>
  );
}
