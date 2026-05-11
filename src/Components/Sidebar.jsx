import logo from "../Image/undac_logo.png";
import { Link } from "react-router-dom"
import {FaHome} from "react-icons/fa"
import { IoDocumentText } from "react-icons/io5";

export default function sidebar() {
  return (
  <div className="sidebar">

      <div className="logo-container">
        <img src={logo} alt="Logo de la universidad" ></img>
        <h2>UNDAC</h2>
      </div>
      <ul>

        <li>

          <Link to="/">

            <FaHome />

            Inicio

          </Link>

        </li>

        <li>

          <Link to="/convenios">

            <IoDocumentText/>

            Convenios

          </Link>

        </li>

      </ul>

    </div>

  )
}
