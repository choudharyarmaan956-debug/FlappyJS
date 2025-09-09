import React from "react";
import FlappyBird from "./components/FlappyBird";
import "@fontsource/inter";
import "./index.css";

function App() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      backgroundColor: '#87CEEB' // Sky blue background
    }}>
      <FlappyBird />
    </div>
  );
}

export default App;
