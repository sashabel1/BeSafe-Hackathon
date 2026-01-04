import { useState } from "react";
import "../styles/HomePage.css";
import Chat from "../components/chat";

const topics = ["חובבי אנימה", "פורטנייט", "איפור", "צופים", "+"];

export default function Home() {
  const [activeTopic, setActiveTopic] = useState(topics[0]);

  return (
    <div className="chat-page">
      {/* Chat מקבל את הנושא הפעיל */}
      <Chat title={activeTopic} />

      {/* Sidebar (RIGHT 25%) */}
      <aside className="sidebar">
        <div className="sidebar_header">שיחות</div>

        {topics.map((topic) => (
          <div
            key={topic}
            className={`topic ${
              topic === activeTopic ? "topic--active" : ""
            }`}
            onClick={() => setActiveTopic(topic)}
          >
            <div className="topic_title">{topic}</div>
          </div>
        ))}
      </aside>
    </div>
  );
}
