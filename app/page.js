"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import FuelGauge from "./components/FuelGauge";
import styles from "./page.module.css";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [okMessage, setOkMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOkMessage("");
    setLoading(true);

    if (mode === "login") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(traducirError(signInError.message));
        setLoading(false);
        return;
      }

      router.push("/panel");
      return;
    }

    // Registro
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(traducirError(signUpError.message));
      setLoading(false);
      return;
    }

    if (data?.user) {
      const { error: perfilError } = await supabase.from("usuarios").insert({
        id: data.user.id,
        email,
        nombre,
        modulo_plataformas_activo: false,
      });

      if (perfilError) {
        console.error(perfilError);
      }
    }

    setOkMessage(
      "¡Cuenta creada! Revisá tu correo para confirmar tu dirección antes de iniciar sesión."
    );
    setLoading(false);
    setMode("login");
  }

  return (
    <div className={styles.screen}>
      <section className={styles.brand}>
        <div className={styles.wordmark}>
          <span className={styles.wordmarkMark}>LNP</span>
          <span className={styles.wordmarkText}>La Nave PY</span>
        </div>

        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Control de combustible</p>
          <h1 className={styles.headline}>
            Sabé cuánto te <em>cuesta</em> cada viaje.
          </h1>
          <p className={styles.subcopy}>
            Registrá tus cargas, seguí tu rendimiento y encontrá el mejor
            precio de combustible cerca tuyo. Pensada para conductores de
            plataformas en Paraguay.
          </p>
        </div>

        <div className={styles.gaugeWrap}>
          <FuelGauge />
          <div className={styles.gaugeStats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>₲/km</span>
              <span className={styles.statLabel}>Costo real por kilómetro</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>⛽ 📍</span>
              <span className={styles.statLabel}>
                Estaciones reportadas por la comunidad
              </span>
            </div>
          </div>
        </div>

        <p className={styles.footerNote}>La Nave PY · Paraguay</p>
      </section>

      <section className={styles.formSide}>
        <div className={styles.card}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${
                mode === "login" ? styles.tabActive : ""
              }`}
              onClick={() => {
                setMode("login");
                setError("");
                setOkMessage("");
              }}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              className={`${styles.tab} ${
                mode === "signup" ? styles.tabActive : ""
              }`}
              onClick={() => {
                setMode("signup");
                setError("");
                setOkMessage("");
              }}
            >
              Crear cuenta
            </button>
          </div>

          <h2 className={styles.title}>
            {mode === "login" ? "Bienvenido de nuevo" : "Creá tu cuenta"}
          </h2>
          <p className={styles.lead}>
            {mode === "login"
              ? "Ingresá con tu correo y contraseña."
              : "Es gratis. Te toma menos de un minuto."}
          </p>

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
            {mode === "signup" && (
              <div className={styles.field}>
                <label className={styles.label} htmlFor="nombre">
                  Nombre
                </label>
                <input
                  id="nombre"
                  className={styles.input}
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="¿Cómo te llamás?"
                  required
                />
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            <button className={styles.submit} type="submit" disabled={loading}>
              {loading
                ? "Un momento..."
                : mode === "login"
                ? "Entrar"
                : "Crear cuenta"}
            </button>
          </form>

          <p className={styles.fine}>
            Al continuar aceptás usar La Nave PY para registrar tus propios
            datos de combustible y ganancias.
          </p>
        </div>
      </section>
    </div>
  );
}

function traducirError(mensaje) {
  if (mensaje.includes("Invalid login credentials")) {
    return "Correo o contraseña incorrectos.";
  }
  if (mensaje.includes("User already registered")) {
    return "Ya existe una cuenta con ese correo. Probá iniciar sesión.";
  }
  if (mensaje.includes("Password should be at least")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  return mensaje;
}
