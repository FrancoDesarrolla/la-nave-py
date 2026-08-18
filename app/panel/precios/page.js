"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { ensureUserProfile } from "@/lib/ensureProfile";
import styles from "../panel-inner.module.css";

const TIPOS_COMBUSTIBLE = ["Nafta", "Nafta Plus", "Diesel", "Diesel Premium"];

export default function Precios() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState(null);

  const [estaciones, setEstaciones] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);

  const [estacionId, setEstacionId] = useState("");
  const [tipoCombustible, setTipoCombustible] = useState(
    TIPOS_COMBUSTIBLE[0]
  );
  const [precio, setPrecio] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [okMessage, setOkMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/");
        return;
      }
      await ensureUserProfile(session.user);
      setUserId(session.user.id);
      setChecking(false);
      cargarDatos();
    });
  }, [router]);

  async function cargarDatos() {
    setCargandoLista(true);

    const [{ data: eData }, { data: rData }] = await Promise.all([
      supabase
        .from("estaciones_servicio")
        .select("id, nombre_emblema, direccion_o_referencia")
        .order("nombre_emblema", { ascending: true }),
      supabase
        .from("reportes_precio")
        .select(
          "id, tipo_combustible, precio, fecha, estaciones_servicio(nombre_emblema, direccion_o_referencia)"
        )
        .order("fecha", { ascending: false })
        .limit(30),
    ]);

    setEstaciones(eData || []);
    setReportes(rData || []);
    setCargandoLista(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOkMessage("");

    if (!estacionId) {
      setError("Elegí una estación de servicio.");
      return;
    }

    setGuardando(true);

    const { error: insertError } = await supabase
      .from("reportes_precio")
      .insert({
        usuario_id: userId,
        estacion_id: Number(estacionId),
        tipo_combustible: tipoCombustible,
        precio: Number(precio),
      });

    if (insertError) {
      setError(`No pudimos guardar el reporte: ${insertError.message}`);
      setGuardando(false);
      return;
    }

    setOkMessage("¡Gracias! Tu reporte ya es visible para la comunidad.");
    setPrecio("");
    setGuardando(false);
    cargarDatos();
  }

  if (checking) return null;

  const sinEstaciones = !cargandoLista && estaciones.length === 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <Link href="/panel" className={styles.back}>
          ← Panel
        </Link>
      </div>

      <div className={styles.container}>
        <h1 className={styles.title}>Precios cerca de mí</h1>
        <p className={styles.subcopy}>
          Precios reportados por la comunidad de conductores. Reportá el tuyo
          para ayudar a otros.
        </p>

        {sinEstaciones && (
          <div className={`${styles.message} ${styles.messageError}`}>
            Todavía no hay estaciones cargadas.{" "}
            <Link href="/panel/cargas" style={{ color: "inherit" }}>
              Agregá una desde "Registrar carga"
            </Link>
            .
          </div>
        )}

        {!sinEstaciones && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Reportar un precio</h2>

            {error && (
              <div className={`${styles.message} ${styles.messageError}`}>
                {error}
              </div>
            )}
            {okMessage && (
              <div className={`${styles.message} ${styles.messageOk}`}>
                {okMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="estacion">
                  Estación de servicio
                </label>
                <select
                  id="estacion"
                  className={styles.select}
                  value={estacionId}
                  onChange={(e) => setEstacionId(e.target.value)}
                  required
                >
                  <option value="">Elegí una estación</option>
                  {estaciones.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre_emblema} — {e.direccion_o_referencia}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="tipo">
                    Tipo de combustible
                  </label>
                  <select
                    id="tipo"
                    className={styles.select}
                    value={tipoCombustible}
                    onChange={(e) => setTipoCombustible(e.target.value)}
                  >
                    {TIPOS_COMBUSTIBLE.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="precio">
                    Precio por litro (₲)
                  </label>
                  <input
                    id="precio"
                    className={styles.input}
                    type="number"
                    step="1"
                    placeholder="7500"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                className={styles.submit}
                type="submit"
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Reportar precio"}
              </button>
            </form>
          </div>
        )}

        <h2 className={styles.listTitle}>Reportes recientes</h2>

        {cargandoLista && <p className={styles.empty}>Cargando...</p>}

        {!cargandoLista && reportes.length === 0 && (
          <p className={styles.empty}>Todavía no hay reportes de precio.</p>
        )}

        {!cargandoLista &&
          reportes.map((r) => (
            <div className={styles.listItem} key={r.id}>
              <div className={styles.listItemMain}>
                <span className={styles.listItemTitle}>
                  {r.estaciones_servicio?.nombre_emblema}
                </span>
                <span className={styles.listItemSub}>
                  {r.tipo_combustible} ·{" "}
                  {new Date(r.fecha).toLocaleDateString("es-PY")}
                </span>
              </div>
              <span className={styles.listItemValue}>
                ₲ {Number(r.precio).toLocaleString("es-PY")}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
