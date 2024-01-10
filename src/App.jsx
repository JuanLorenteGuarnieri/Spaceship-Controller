import React from "react";
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Home from "./pages/Home";


const App = () => {
  return (
    <main className="bg-slate-300/20">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={"<About></About>"} />
          <Route path="/projects" element={"<Projects></Projects>"} />
          <Route path="/contact" element={"<Contact ></Contact>"} />

        </Routes>
      </Router>
    </main>
  )
}

export default App