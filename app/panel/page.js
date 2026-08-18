"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import styles from "./panel.module.css";

export default function Panel() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/");
        return;
      }
      setEmail(session.user.email);
      setChecking(false);
    });
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (checking) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <span className={styles.wordmark}>La Nave PY</span>
        <button className={styles.logout} onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      <div className={styles.hero}>
        <p className={styles.eyebrow}>Panel</p>
        <h1 className={styles.title}>Hola, {email}</h1>
        <p className={styles.subcopy}>
          Tu cuenta ya está lista. Las próximas pantallas (cargar
          combustible, ver historial y reportar precios) se van a ir sumando
          acá.
        </p>
      </div>

      <div className={styles.grid}>
        <Link href="/panel/cargas" className={styles.card}>
          <h3 className={styles.cardTitle}>⛽ Registrar carga</h3>
          <p className={styles.cardCopy}>
            Litros, precio, kilometraje y estación de servicio.
          </p>
        </Link>
        <Link href="/panel/vehiculos" className={styles.card}>
          <h3 className={styles.cardTitle}>🚗 Mis vehículos</h3>
          <p className={styles.cardCopy}>
            Agregá marca, modelo y año de tu auto.
          </p>
        </Link>
        <div className={styles.card}>
          <span className={styles.badge}>Próximamente</span>
          <h3 className={styles.cardTitle}>Ganancias</h3>
          <p className={styles.cardCopy}>
            Activá el seguimiento de tus ingresos por plataforma.
          </p>
        </div>
        <div className={styles.card}>
          <span className={styles.badge}>Próximamente</span>
          <h3 className={styles.cardTitle}>Precios cerca de mí</h3>
          <p className={styles.cardCopy}>
            Precios reportados por la comunidad de conductores.
          </p>
        </div>
      </div>
    </div>
  );
}
