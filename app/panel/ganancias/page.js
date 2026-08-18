"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { ensureUserProfile } from "@/lib/ensureProfile";
import styles from "../panel-inner.module.css";

const PLATAFORMAS = ["Uber", "Bolt", "DiDi", "InDrive", "Otra"];

export default function Ganancias() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState(null);

  const [moduloActivo, setModuloActivo] = useState(false);
  const [activando, setActivando] = useState(false);

  const [plataforma, setPlataforma] = useState(PLATAFORMAS[0]);
  const [monto, setMonto] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [okMessage, setOkMessage] = useState("");

  const [ganancias, setGanancias] = useState([]);
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
      cargarPerfil(session.user.id);
      cargarGanancias(session.user.id);
    });
  }, [router]);

  async function cargarPerfil(uid) {
    const { data } = await supabase
      .from("usuarios")
      .select("modulo_plataformas_activo")
      .eq("id", uid)
      .single();

    setModuloActivo(Boolean(data?.modulo_plataformas_activo));
  }

  async function cargarGanancias(uid) {
    setCargandoLista(true);
    const { data } = await supabase
      .from("ganancias")
      .select("*")
      .eq("usuario_id", uid)
      .order("fecha", { ascending: false })
      .limit(20);

    setGanancias(data || []);
    setCargandoLista(false);
  }

  async function handleActivarModulo() {
    setActivando(true);
    const { error: updateError } = await supabase
      .from("usuarios")
      .update({ modulo_plataformas_activo: true })
      .eq("id", userId);

    if (!updateError) {
      setModuloActivo(true);
    } else {
      setError(`No pudimos activar el módulo: ${updateError.message}`);
    }
    setActivando(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOkMessage("");
    setGuardando(true);

    const { error: insertError } = await supabase.from("ganancias").insert({
      usuario_id: userId,
      plataforma,
      monto: Number(monto),
    });

    if (insertError) {
      setError(`No pudimos guardar la ganancia: ${insertError.message}`);
      setGuardando(false);
      return;
    }

    setOkMessage("Ganancia registrada.");
    setMonto("");
    setGuardando(false);
    cargarGanancias(userId);
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
        <h1 className={styles.title}>Ganancias</h1>
        <p className={styles.subcopy}>
          Llevá el registro de lo que ganás por plataforma, así podés ver tu
          rendimiento real descontando el combustible.
        </p>

        {!moduloActivo && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Activar seguimiento</h2>
            <p className={styles.cardCopy} style={{ marginBottom: 16 }}>
              Este módulo es opcional. Si no lo activás, La Nave PY sigue
              funcionando solo como control de gasto de combustible.
            </p>
            {error && (
              <div className={`${styles.message} ${styles.messageError}`}>
                {error}
              </div>
            )}
            <button
              className={styles.submit}
              onClick={handleActivarModulo}
              disabled={activando}
            >
              {activando ? "Activando..." : "Activar seguimiento de ganancias"}
            </button>
          </div>
        )}

        {moduloActivo && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Nueva ganancia</h2>

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
                <label className={styles.label} htmlFor="plataforma">
                  Plataforma
                </label>
                <select
                  id="plataforma"
                  className={styles.select}
                  value={plataforma}
                  onChange={(e) => setPlataforma(e.target.value)}
                >
                  {PLATAFORMAS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="monto">
                  Monto ganado (₲)
                </label>
                <input
                  id="monto"
                  className={styles.input}
                  type="number"
                  step="1"
                  placeholder="150000"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  required
                />
              </div>

              <button
                className={styles.submit}
                type="submit"
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Registrar ganancia"}
              </button>
            </form>
          </div>
        )}

        <h2 className={styles.listTitle}>Últimas ganancias</h2>

        {cargandoLista && <p className={styles.empty}>Cargando...</p>}

        {!cargandoLista && ganancias.length === 0 && (
          <p className={styles.empty}>Todavía no registraste ninguna ganancia.</p>
        )}

        {!cargandoLista &&
          ganancias.map((g) => (
            <div className={styles.listItem} key={g.id}>
              <div className={styles.listItemMain}>
                <span className={styles.listItemTitle}>{g.plataforma}</span>
                <span className={styles.listItemSub}>
                  {new Date(g.fecha).toLocaleDateString("es-PY")}
                </span>
              </div>
              <span className={styles.listItemValue}>
                ₲ {Number(g.monto).toLocaleString("es-PY")}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
