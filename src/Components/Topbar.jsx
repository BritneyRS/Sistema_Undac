
import React from "react";
import style from "../Styles/style.css";
import { FaGripLines } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";

export default function Topbar() {
  return (
    <header className="topbar">

      <span className="topbar-titulo">
        <FaGripLines />  SISTEMA
      </span>

      <div className="topbar-usuario">

        <div className="topbar-avatar">
          A
        </div>

        <span className="topbar-nombre">
          Administrador
        </span>
        <IoMdArrowDropdown />
      
          
        

      </div>

    </header>
  );
}