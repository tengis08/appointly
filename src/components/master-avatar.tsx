type MasterAvatarProps = {
  photoUrl?: string | null;
  name: string;
};

export function MasterAvatar({ photoUrl, name }: MasterAvatarProps) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="h-28 w-28 rounded-full object-cover border border-neutral-200"
      />
    );
  }

  return (
    <div className="flex h-28 w-28 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-4xl">
      <span>👤</span>
    </div>
  );
}