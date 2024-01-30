import React from "react";
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from "./pages/Home";


const App = () => {
  return (
    <main className="bg-slate-300/20">
      <Home />
    </main>
  )
}

export default App