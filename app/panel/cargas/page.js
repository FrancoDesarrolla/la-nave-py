"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { ensureUserProfile } from "@/lib/ensureProfile";
import styles from "../panel-inner.module.css";

export default function Cargas() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState(null);

  const [vehiculos, setVehiculos] = useState([]);
  const [estaciones, setEstaciones] = useState([]);
  const [cargas, setCargas] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);

  const [vehiculoId, setVehiculoId] = useState("");
  const [estacionId, setEstacionId] = useState("");
  const [litros, setLitros] = useState("");
  const [precioTotal, setPrecioTotal] = useState("");
  const [kilometraje, setKilometraje] = useState("");

  const [mostrarNuevaEstacion, setMostrarNuevaEstacion] = useState(false);
  const [nuevoEmblema, setNuevoEmblema] = useState("");
  const [nuevaDireccion, setNuevaDireccion] = useState("");

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
      cargarDatos(session.user.id);
    });
  }, [router]);

  async function cargarDatos(uid) {
    setCargandoLista(true);

    const [{ data: vData }, { data: eData }, { data: cData }] =
      await Promise.all([
        supabase
          .from("vehiculos")
          .select("id, marca, modelo")
          .eq("usuario_id", uid),
        supabase
          .from("estaciones_servicio")
          .select("id, nombre_emblema, direccion_o_referencia")
          .order("nombre_emblema", { ascending: true }),
        supabase
          .from("cargas_combustible")
          .select(
            "id, litros, precio_total, kilometraje, fecha, vehiculos(marca, modelo), estaciones_servicio(nombre_emblema)"
          )
          .eq("usuario_id", uid)
          .order("fecha", { ascending: false })
          .limit(20),
      ]);

    setVehiculos(vData || []);
    setEstaciones(eData || []);
    setCargas(cData || []);
    setCargandoLista(false);
  }

  async function handleAgregarEstacion() {
    if (!nuevoEmblema || !nuevaDireccion) return;

    const { data, error: insertError } = await supabase
      .from("estaciones_servicio")
      .insert({
        nombre_emblema: nuevoEmblema,
        direccion_o_referencia: nuevaDireccion,
      })
      .select()
      .single();

    if (insertError || !data) {
      setError(
        `No pudimos agregar la estación: ${
          insertError?.message || "sin datos devueltos"
        }`
      );
      return;
    }

    setEstaciones((prev) => [...prev, data]);
    setEstacionId(String(data.id));
    setMostrarNuevaEstacion(false);
    setNuevoEmblema("");
    setNuevaDireccion("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOkMessage("");

    if (!vehiculoId) {
      setError("Elegí un vehículo antes de guardar.");
      return;
    }
    if (!estacionId) {
      setError("Elegí (o agregá) una estación de servicio.");
      return;
    }

    setGuardando(true);

    const { error: insertError } = await supabase
      .from("cargas_combustible")
      .insert({
        usuario_id: userId,
        vehiculo_id: Number(vehiculoId),
        estacion_id: Number(estacionId),
        litros: Number(litros),
        precio_total: Number(precioTotal),
        kilometraje: Number(kilometraje),
      });

    if (insertError) {
      setError(`No pudimos guardar la carga: ${insertError.message}`);
      setGuardando(false);
      return;
    }

    setOkMessage("Carga registrada.");
    setLitros("");
    setPrecioTotal("");
    setKilometraje("");
    setGuardando(false);
    cargarDatos(userId);
  }

  if (checking) return null;

  const sinVehiculos = !cargandoLista && vehiculos.length === 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <Link href="/panel" className={styles.back}>
          ← Panel
        </Link>
      </div>

      <div className={styles.container}>
        <h1 className={styles.title}>Registrar carga</h1>
        <p className={styles.subcopy}>
          Cargá los datos de tu última carga de combustible.
        </p>

        {sinVehiculos && (
          <div className={`${styles.message} ${styles.messageError}`}>
            Todavía no tenés ningún vehículo cargado.{" "}
            <Link href="/panel/vehiculos" style={{ color: "inherit" }}>
              Agregá uno primero
            </Link>
            .
          </div>
        )}

        {!sinVehiculos && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Nueva carga</h2>

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
                <label className={styles.label} htmlFor="vehiculo">
                  Vehículo
                </label>
                <select
                  id="vehiculo"
                  className={styles.select}
                  value={vehiculoId}
                  onChange={(e) => setVehiculoId(e.target.value)}
                  required
                >
                  <option value="">Elegí un vehículo</option>
                  {vehiculos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.marca} {v.modelo}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="estacion">
                  Estación de servicio
                </label>
                <select
                  id="estacion"
                  className={styles.select}
                  value={estacionId}
                  onChange={(e) => setEstacionId(e.target.value)}
                  required={!mostrarNuevaEstacion}
                  disabled={mostrarNuevaEstacion}
                >
                  <option value="">Elegí una estación</option>
                  {estaciones.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre_emblema} — {e.direccion_o_referencia}
                    </option>
                  ))}
                </select>
              </div>

              {!mostrarNuevaEstacion && (
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setMostrarNuevaEstacion(true)}
                >
                  + Agregar una estación nueva
                </button>
              )}

              {mostrarNuevaEstacion && (
                <div style={{ marginBottom: 14 }}>
                  <div className={styles.field}>
                    <label className={styles.label}>Emblema / marca</label>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="Petrobras, Puma, Barcos..."
                      value={nuevoEmblema}
                      onChange={(e) => setNuevoEmblema(e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>
                      Dirección o referencia
                    </label>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="Av. Mariscal López y..."
                      value={nuevaDireccion}
                      onChange={(e) => setNuevaDireccion(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={handleAgregarEstacion}
                  >
                    Guardar estación
                  </button>
                </div>
              )}

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="litros">
                    Litros
                  </label>
                  <input
                    id="litros"
                    className={styles.input}
                    type="number"
                    step="0.01"
                    placeholder="30"
                    value={litros}
                    onChange={(e) => setLitros(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="precio">
                    Precio total (₲)
                  </label>
                  <input
                    id="precio"
                    className={styles.input}
                    type="number"
                    step="1"
                    placeholder="250000"
                    value={precioTotal}
                    onChange={(e) => setPrecioTotal(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="km">
                  Kilometraje actual
                </label>
                <input
                  id="km"
                  className={styles.input}
                  type="number"
                  placeholder="45230"
                  value={kilometraje}
                  onChange={(e) => setKilometraje(e.target.value)}
                  required
                />
              </div>

              <button
                className={styles.submit}
                type="submit"
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Registrar carga"}
              </button>
            </form>
          </div>
        )}

        <h2 className={styles.listTitle}>Últimas cargas</h2>

        {cargandoLista && <p className={styles.empty}>Cargando...</p>}

        {!cargandoLista && cargas.length === 0 && (
          <p className={styles.empty}>Todavía no registraste ninguna carga.</p>
        )}

        {!cargandoLista &&
          cargas.map((c) => (
            <div className={styles.listItem} key={c.id}>
              <div className={styles.listItemMain}>
                <span className={styles.listItemTitle}>
                  {c.vehiculos?.marca} {c.vehiculos?.modelo} — {c.litros} L
                </span>
                <span className={styles.listItemSub}>
                  {c.estaciones_servicio?.nombre_emblema} ·{" "}
                  {new Date(c.fecha).toLocaleDateString("es-PY")}
                </span>
              </div>
              <span className={styles.listItemValue}>
                ₲ {Number(c.precio_total).toLocaleString("es-PY")}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
