import { useEffect, useRef, useState } from "react";
import { GameEngine } from "./game/engine.js";
import Login from "./client/login";
import ProfileCard from "./profileCard";

function App() {
  const mountRef = useRef(null);
  const engineRef = useRef(null);

  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingEngine, setLoadingEngine] = useState(false);

  // -----------------------------
  // CHECK TOKEN ON LOAD
  // -----------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setLoggedIn(true);
  }, []);

  // -----------------------------
  // ENGINE BOOTSTRAP
  // -----------------------------
  useEffect(() => {
    if (!loggedIn) return;

    const mount = mountRef.current;
    if (!mount) return;

    setLoadingEngine(true);

    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }

    const engine = new GameEngine(mount);
    engineRef.current = engine;

    engine.onPlayerClick = async (playerId) => {
      try {
        const res = await fetch(
          `http://localhost:5000/profile/${playerId}`
        );

        if (!res.ok) throw new Error("Profile fetch failed");

        const data = await res.json();
        setSelectedUser(data);
      } catch (err) {
        console.error(err);
      }
    };

    setLoadingEngine(false);

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [loggedIn]);

  // -----------------------------
  // LOGIN GATE
  // -----------------------------
  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  // -----------------------------
  // LOGOUT
  // -----------------------------
  function logout() {
    localStorage.removeItem("token");

    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }

    setLoggedIn(false);
    setSelectedUser(null);
  }

  return (
    <>
      {loadingEngine && <div>Loading game...</div>}

      <div ref={mountRef} />

      {selectedUser && (
        <ProfileCard
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      <button
        onClick={logout}
        style={{ position: "absolute", top: 10, right: 10 }}
      >
        Logout
      </button>
    </>
  );
}

export default App;