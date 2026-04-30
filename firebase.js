// ─────────────────────────────────────────
// FIREBASE — Configuración
// ─────────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyARzfYSgyIrP49Wx69Sa4OhdFp7VAw92Rk",
  authDomain: "class-rising.firebaseapp.com",
  projectId: "class-rising",
  storageBucket: "class-rising.firebasestorage.app",
  messagingSenderId: "232728055701",
  appId: "1:232728055701:web:ec68e9cf4bae7205c5f09c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ─────────────────────────────────────────
// AUTENTICACIÓN
// ─────────────────────────────────────────
export async function loginConGoogle() {
  try {
    const resultado = await signInWithPopup(auth, provider);
    return resultado.user;
  } catch (e) {
    console.error("Error al iniciar sesión:", e);
    return null;
  }
}

export async function cerrarSesion() {
  try {
    await signOut(auth);
  } catch (e) {
    console.error("Error al cerrar sesión:", e);
  }
}

export function escucharAuthEstado(callback) {
  onAuthStateChanged(auth, callback);
}

// ─────────────────────────────────────────
// BASE DE DATOS
// ─────────────────────────────────────────
export async function guardarPartidaNube(userId, estado) {
  try {
    await setDoc(doc(db, "partidas", userId), {
      estado: JSON.stringify(estado),
      ultimaActualizacion: new Date().toISOString()
    });
  } catch (e) {
    console.error("Error al guardar en nube:", e);
  }
}

export async function cargarPartidaNube(userId) {
  try {
    const docSnap = await getDoc(doc(db, "partidas", userId));
    if (docSnap.exists()) {
      return JSON.parse(docSnap.data().estado);
    }
  } catch (e) {
    console.error("Error al cargar de nube:", e);
  }
  return null;
}