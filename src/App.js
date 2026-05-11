import { BrowserRouter, Routes, Route } from "react-router-dom"

import Sidebar from "./Components/Sidebar";
import Inicio from "./page/inicio";
import Style from "./Styles/style.css";

function App() {
  return (
    <BrowserRouter>

      <div className="container">

        <Sidebar />

        <Routes>

          <Route path="/" element={<inicio />} />

          

        </Routes>

      </div>

    </BrowserRouter>
  );
}

export default App;