import { redirect } from "next/navigation";

// La raíz no tiene contenido propio: el middleware ya redirige a /admin o /commerce
// cuando hay sesión; si no la hay, mandamos directo al login.
export default function RootPage() {
  redirect("/login");
}
