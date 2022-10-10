import React, { lazy, Suspense }from "react";

import Routing from './router/index.tsx';

import './App.css';
function App() {
  return (
    <div className="App">
    <Routing />
    </div>
  );
}

export default App;
