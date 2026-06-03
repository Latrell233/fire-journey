import type { PersonalityResult } from '@fj/engine-core';

interface Props {
  personality: PersonalityResult;
}

export default function CharacterIllustration({ personality }: Props) {
  // Map typeName to image asset path
  const src = `/assets/characters/char-${personality.typeName}.png`;

  return (
    <div className="flex justify-center my-4">
      <img
        src={src}
        alt=""
        className="h-[200px] w-auto object-contain"
        loading="lazy"
        onError={(e) => {
          // Hide if image not yet available (MVP fallback)
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
}
