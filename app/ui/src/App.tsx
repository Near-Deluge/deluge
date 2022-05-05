import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import { Routes, Route } from "react-router-dom";


// Components Imports
import Navbar from './components/navbar'
import Footer from './components/footer'

import Home from './pages/home'


export default function App() {
  return (
    <div>
      <Navbar />
      <Container maxWidth="lg">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Container>
      <Footer />
    </div>
  );
}
