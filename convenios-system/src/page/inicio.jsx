import React, { useEffect, useState } from "react";
import { conveniosAPI, movilidadesAPI } from "../utils/api";
import { calcularSemaforo } from "../utils/semaforo";
import { TbClockExclamation } from "react-icons/tb";
import { FiUsers } from "react-icons/fi";

export default function Inicio() {
  const [cargando, setCargando] = useState(true);
  const [proximosConvenios, setProximosConvenios] = useState(0);
  const [totalMovilidades, setTotalMovilidades] = useState(0);

  useEffect(() => {
    async function cargarIndicadores() {
      try {
        const [convenios, movilidades] = await Promise.all([
          conveniosAPI.listar(),
          movilidadesAPI.listar(),
        ]);

        const proximos = convenios.filter((c) => {
          const color = calcularSemaforo(c.fin).color;
          return ["naranja", "amarillo"].includes(color);
        }).length;

        const activos = Array.isArray(movilidades)
          ? movilidades.filter((m) => m.estado === "activo").length
          : 0;

        setProximosConvenios(proximos);
        setTotalMovilidades(activos);
      } catch (error) {
        console.error("Error al cargar indicadores de inicio:", error);
      } finally {
        setCargando(false);
      }
    }

    cargarIndicadores();
  }, []);

  return (
    <div className="inicio-contenedor">
      <h1 className="inicio-titulo">BIENVENIDOS</h1>
      <p className="inicio-subtitulo">
        Universidad Nacional Daniel Alcides Carrión
      </p>

      <div className="stats-grid">
        <div className="stats-tarjeta">
          <TbClockExclamation size={20}/>
          <p className="stats-label">Convenios próximos a vencer</p>
          <p className="stats-numero">{cargando ? "..." : proximosConvenios}</p>
          {/*<p className="stats-descripcion">
            Convenios con semáforo naranja o amarillo según fecha de fin.
          </p>*/}
           <div style={{ marginTop: 8, color: "#6b7280", fontSize: 12 }}>Total de convenios con fecha de fin cercana según semáforo.</div>
        </div>

        <div className="stats-tarjeta">
          <FiUsers size={20}/>
          <p className="stats-label">Estudiantes activos en movilidad</p>
          <p className="stats-numero">{cargando ? "..." : totalMovilidades}</p>
          <div style={{ marginTop: 8, color: "#6b7280", fontSize: 12 }}>Registros de movilidad con estado activo</div>
          
        </div>
      </div>
    </div>
  );
}
