import logo from "../Image/undac_logo.png";
import { Link } from "react-router-dom"

export default function sidebar() {
  return (
   <div className="sidebar">

      <h2>UNDAC</h2>

      <ul>

        <li>
          <Link to="/">Inicio</Link>
        </li>

        <li>
          <Link to="/convenios">Convenios</Link>
        </li>

      </ul>

    </div>
  );
}
