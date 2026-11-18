const anioActual = new Date().getFullYear();
const etiquetaAnio = document.getElementById("anio-actual");

if (etiquetaAnio) {
  etiquetaAnio.textContent = anioActual;
}