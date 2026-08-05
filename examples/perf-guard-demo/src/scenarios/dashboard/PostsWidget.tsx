import { useEffect, useState } from "react";
import { PerfProfiler } from "react-perf-guard";

interface Post {
  id: number;
  title: string;
  body: string;
}

export default function PostsWidget() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts?_limit=6")
      .then((r) => r.json())
      .then(setPosts)
      .catch(() => setPosts([]));
  }, []);

  return (
    <PerfProfiler id="PostsWidget" boundaryType="LAYOUT">
      <div className="widget">
        <h3 className="widget-title">📰 Latest Posts</h3>
        <p className="widget-source">jsonplaceholder.typicode.com/posts</p>
        <ul className="widget-list">
          {posts.map((p) => (
            <li key={p.id} className="post-item">
              <strong>{p.title}</strong>
              <span>{p.body.slice(0, 60)}…</span>
            </li>
          ))}
        </ul>
      </div>
    </PerfProfiler>
  );
}
