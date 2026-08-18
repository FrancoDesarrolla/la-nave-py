"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { ensureUserProfile } from "@/lib/ensureProfile";
import styles from "../panel-inner.module.css";

export default function Vehiculos() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState(null);

  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [okMessage, setOkMessage] = useState("");

  const [vehiculos, setVehiculos] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/");
        return;
      }
      await ensureUserProfile(session.user);
      setUserId(session.user.id);
      setChecking(false);
      cargarVehiculos(session.user.id);
    });
  }, [router]);

  async function cargarVehiculos(uid) {
    setCargandoLista(true);
    const { data, error: fetchError } = await supabase
      .from("vehiculos")
      .select("*")
      .eq("usuario_id", uid)
      .order("id", { ascending: false });

    if (!fetchError && data) {
      setVehiculos(data);
    }
    setCargandoLista(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOkMessage("");
    setGuardando(true);

    const { error: insertError } = await supabase.from("vehiculos").insert({
      usuario_id: userId,
      marca,
      modelo,
      anio: anio ? Number(anio) : null,
    });

    if (insertError) {
      setError("No pudimos guardar el vehículo. Probá de nuevo.");
      setGuardando(false);
      return;
    }

    setOkMessage("Vehículo agregado.");
    setMarca("");
    setModelo("");
    setAnio("");
    setGuardando(false);
    cargarVehiculos(userId);
  }

  if (checking) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <Link href="/panel" className={styles.back}>
          ← Panel
        </Link>
      </div>

      <div className={styles.container}>
        <h1 className={styles.title}>Mis vehículos</h1>
        <p className={styles.subcopy}>
          Agregá el auto con el que trabajás para poder registrar cargas de
          combustible.
        </p>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Agregar vehículo</h2>

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
              <label className={styles.label} htmlFor="marca">
                Marca
              </label>
              <input
                id="marca"
                className={styles.input}
                type="text"
                placeholder="Toyota, Chevrolet, VW..."
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                required
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="modelo">
                  Modelo
                </label>
                <input
                  id="modelo"
                  className={styles.input}
                  type="text"
                  placeholder="Corolla, Onix..."
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="anio">
                  Año (opcional)
                </label>
                <input
                  id="anio"
                  className={styles.input}
                  type="number"
                  placeholder="2018"
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                  min="1980"
                  max="2100"
                />
              </div>
            </div>

            <button className={styles.submit} type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Agregar vehículo"}
            </button>
          </form>
        </div>

        <h2 className={styles.listTitle}>Vehículos registrados</h2>

        {cargandoLista && <p className={styles.empty}>Cargando...</p>}

        {!cargandoLista && vehiculos.length === 0 && (
          <p className={styles.empty}>Todavía no agregaste ningún vehículo.</p>
        )}

        {!cargandoLista &&
          vehiculos.map((v) => (
            <div className={styles.listItem} key={v.id}>
              <div className={styles.listItemMain}>
                <span className={styles.listItemTitle}>
                  {v.marca} {v.modelo}
                </span>
                {v.anio && (
                  <span className={styles.listItemSub}>Año {v.anio}</span>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
