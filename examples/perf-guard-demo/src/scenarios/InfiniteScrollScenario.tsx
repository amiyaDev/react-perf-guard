import { useCallback, useEffect, useRef, useState } from "react";
import { PerfProfiler } from "react-perf-guard";
import { BuggyPhotoCard, OptimizedPhotoCard, type Photo } from "./PhotoCard";
import type { Mode } from "../types";

const PAGE_SIZE = 24;

export default function InfiniteScrollScenario() {
  const [mode, setMode] = useState<Mode>("buggy");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // Guards against the initial-mount effect and an immediately-visible
  // IntersectionObserver both firing a page-1 fetch before `page` state
  // has had a chance to update — without this, both requests capture the
  // same page number and the same photos get appended twice.
  const fetchingRef = useRef(false);

  const loadNextPage = useCallback(() => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    fetch(`https://picsum.photos/v2/list?page=${page}&limit=${PAGE_SIZE}`)
      .then((r) => r.json())
      .then((data: Photo[]) => {
        setPhotos((prev) => [...prev, ...data]);
        setPage((p) => p + 1);
        if (data.length < PAGE_SIZE || page >= 12) setDone(true);
      })
      .catch(() => setDone(true))
      .finally(() => {
        fetchingRef.current = false;
        setLoading(false);
      });
  }, [page]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || done) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadNextPage();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadNextPage, done]);

  function reset(newMode: Mode) {
    setMode(newMode);
    setPhotos([]);
    setPage(1);
    setDone(false);
  }

  const CardComponent = mode === "optimized" ? OptimizedPhotoCard : BuggyPhotoCard;

  return (
    <div>
      <header className="app-header">
        <div>
          <h1>Growing Render Cost</h1>
          <p className="tagline">A feed that loads more as you scroll — does cost grow with total items, or just new ones?</p>
        </div>
      </header>

      <div className="info-banner">
        <h2>Infinite scroll, real pagination</h2>
        <p>
          Photos load from a real paginated API (<code>picsum.photos</code>) as you scroll toward the
          bottom. In{" "}
          <strong>🐛 Buggy</strong> mode, cards aren't memoized — every new page appended re-renders{" "}
          <em>every previously loaded card</em> too, so render cost creeps upward the longer you scroll.
          Watch for <code>RENDER_TIME_CREEP</code> or <code>RENDER_COUNT_CREEP</code> in the panel — these
          are trend rules that need several pages of history to trigger, so keep scrolling.
        </p>
      </div>

      <div className="mode-toggle" role="tablist" aria-label="Rendering mode">
        <button
          role="tab"
          aria-selected={mode === "buggy"}
          className={mode === "buggy" ? "active buggy" : ""}
          onClick={() => reset("buggy")}
        >
          🐛 Buggy
        </button>
        <button
          role="tab"
          aria-selected={mode === "optimized"}
          className={mode === "optimized" ? "active optimized" : ""}
          onClick={() => reset("optimized")}
        >
          ✅ Optimized
        </button>
        <span className="photo-count">{photos.length} photos loaded</span>
      </div>

      <PerfProfiler id={`PhotoFeed (${mode})`} boundaryType="PAGE">
        <div className="photo-scroll">
          <div className="photo-grid">
            {photos.map((p) => (
              <CardComponent key={p.id} photo={p} />
            ))}
          </div>
          {!done && (
            <div ref={sentinelRef} className="scroll-sentinel">
              {loading ? "Loading more…" : "Scroll for more"}
            </div>
          )}
          {done && <div className="scroll-sentinel">You've reached the end</div>}
        </div>
      </PerfProfiler>
    </div>
  );
}
