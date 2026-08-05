import { memo } from "react";

interface Photo {
  id: string;
  author: string;
}

function PhotoCardBase({ photo }: { photo: Photo }) {
  return (
    <div className="photo-card">
      <img src={`https://picsum.photos/id/${photo.id}/300/200`} alt="" loading="lazy" />
      <span>Photo by {photo.author}</span>
    </div>
  );
}

// 🐛 Buggy: every card is a plain component — as more pages load, React
// re-renders *every previously loaded card* on each append, not just the
// new ones. Cost grows with total items shown, not just new ones.
export const BuggyPhotoCard = PhotoCardBase;

// ✅ Optimized: memoized — previously loaded cards bail out when a new
// page is appended, since their own props never changed.
export const OptimizedPhotoCard = memo(PhotoCardBase);

export type { Photo };
