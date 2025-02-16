import React from "react";
import { Route, Routes } from "react-router";
import MainPage from "./MainPage";
import Contact from "./routes/contact/Contact";
import Privacy from "./routes/privacy/Privacy";
import Rules from "./routes/rules/Rules";
import Room from "./routes/room/Room";
import Game from "./routes/game/Game";
import "./assets/style/globals.css";
import RootLayout from "./Layout";
const App = () => {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<MainPage />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="rules" element={<Rules />} />
        <Route path="room/:room" element={<Room />} />
        <Route path="game/:room" element={<Game />} />
      </Route>
    </Routes>
  );
};

export default App;
