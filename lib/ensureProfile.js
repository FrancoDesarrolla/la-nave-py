import { supabase } from "./supabaseClient";

// Crea la fila del usuario en la tabla "usuarios" si todavía no existe.
// Se llama cada vez que el usuario entra al panel ya logueado, así no importa
// si el registro original falló por no tener la sesión confirmada todavía.
export async function ensureUserProfile(user) {
  if (!user) return;

  const { error } = await supabase.from("usuarios").upsert(
    {
      id: user.id,
      email: user.email,
    },
    { onConflict: "id", ignoreDuplicates: true }
  );

  if (error) {
    console.error("No se pudo asegurar el perfil del usuario:", error);
  }
}
