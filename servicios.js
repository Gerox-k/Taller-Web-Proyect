const infoServicios = {
    delivery: {
        titulo: "Delivery Express Marino",
        badge: "ENTREGA RÁPIDA Y SEGURA",
        imagen: "https://unsplash.com",
        descripcion: "Disfruta de nuestro ceviche clásico, jaleas y arroces marinos sin salir de casa. Utilizamos envases térmicos sellados que conservan la frescura del limón recién exprimido.",
        incluye: [
            "Cancha chulpi, choclo desgranado y camote glaseado gratis.",
            "Salsas de rocoto y ají de la casa empacadas al vacío.",
            "Cobertura en toda Lima Metropolitana.",
            "Tiempo estimado de entrega: 30 a 45 minutos."
        ],
        precio: "Delivery desde S/ 5.00",
        valorSelect: "Delivery Express"
    },
    catering: {
        titulo: "Catering y Barras Cevicheras",
        badge: "SHOW EN VIVO PARA EVENTOS",
        imagen: "https://unsplash.com",
        descripcion: "Sorprende a tus invitados con una barra cevichera móvil instalada en tu evento. Nuestros chefs preparan los platos al momento frente a tus invitados.",
        incluye: [
            "Barra temática marina decorada e iluminada.",
            "Maestro cevichero y personal de servicio uniformado.",
            "Menaje descartable ecológico o loza premium.",
            "Degustación de 3 variedades de ceviche y causas marinas."
        ],
        precio: "Paquetes desde S/ 450.00",
        valorSelect: "Catering y Barras"
    },
    eventos: {
        titulo: "Eventos y Salón VIP",
        badge: "CELEBRACIONES INOLVIDABLES",
        imagen: "https://unsplash.com",
        descripcion: "Reserva nuestro salón principal o zona VIP para celebrar cumpleaños, almuerzos corporativos, aniversarios o reuniones familiares con música criolla.",
        incluye: [
            "Decoración temática básica incluida para cumpleañeros.",
            "Ronda marina de cortesía para el agasajado (mín. 8 personas).",
            "Atención preferencial con mozo exclusivo.",
            "Estacionamiento vigilado para invitados."
        ],
        precio: "Consumo a la carta o menú fijo",
        valorSelect: "Eventos y Celebraciones"
    }
};

const claveStorage = "losChoritosReservasV3";
let listaReservas = JSON.parse(localStorage.getItem(claveStorage)) || [];

document.addEventListener("DOMContentLoaded", () => {
    inicializarMenuResponsivo();
    configurarFechaMinima();
    renderizarTablaReservas();

    const formulario = document.getElementById("form-reserva-mesa");
    formulario.addEventListener("submit", procesarFormularioReserva);
});
function inicializarMenuResponsivo() {
    const btnMenu = document.getElementById("btn-menu-movil");
    const navPrincipal = document.getElementById("nav-principal");

    if (btnMenu && navPrincipal) {
        btnMenu.addEventListener("click", () => {
            navPrincipal.classList.toggle("abierto");
            btnMenu.textContent = navPrincipal.classList.contains("abierto") ? "✕" : "☰";
        });
    }
}

function configurarFechaMinima() {
    const inputFecha = document.getElementById("txt-fecha");
    const hoy = new Date().toISOString().split("T")[0];
    inputFecha.setAttribute("min", hoy);
    if (!inputFecha.value) {
        inputFecha.value = hoy;
    }
}

function abrirModalServicio(claveServicio) {
    const datos = infoServicios[claveServicio];
    if (!datos) return;

    document.getElementById("modal-imagen").src = datos.imagen;
    document.getElementById("modal-badge").textContent = datos.badge;
    document.getElementById("modal-titulo").textContent = datos.titulo;
    document.getElementById("modal-descripcion").textContent = datos.descripcion;
    document.getElementById("modal-precio").textContent = datos.precio;

    const lista = document.getElementById("modal-lista-incluye");
    lista.innerHTML = "";
    datos.incluye.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        lista.appendChild(li);
    });

    const btnReservar = document.getElementById("modal-btn-reservar");
    btnReservar.onclick = () => {
        cerrarModal("modal-servicio");
        seleccionarServicio(datos.valorSelect);
    };

    document.getElementById("modal-servicio").style.display = "flex";
}

function cerrarModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = "none";
    }
}

function cerrarModalFondo(evento, idModal) {
    if (evento.target.id === idModal) {
        cerrarModal(idModal);
    }
}

function seleccionarServicio(nombreServicio) {
    const select = document.getElementById("cmb-tipo-servicio");
    select.value = nombreServicio;
    
    const seccionReservas = document.getElementById("zona-reservas");
    seccionReservas.scrollIntoView({ behavior: "smooth" });
    
    setTimeout(() => {
        document.getElementById("txt-nombre").focus();
    }, 600);
}
function procesarFormularioReserva(evento) {
    evento.preventDefault();

    const idEdicion = document.getElementById("reserva-id-edicion").value;
    const servicio = document.getElementById("cmb-tipo-servicio").value;
    const nombre = document.getElementById("txt-nombre").value.trim();
    const telefono = document.getElementById("txt-telefono").value.trim();
    const email = document.getElementById("txt-email").value.trim();
    const fecha = document.getElementById("txt-fecha").value;
    const hora = document.getElementById("txt-hora").value;
    const personas = parseInt(document.getElementById("num-personas").value, 10);
    const mensaje = document.getElementById("txt-mensaje").value.trim();

    if (nombre.length < 3) {
        mostrarAlerta("Por favor, ingresa tu nombre completo (mínimo 3 caracteres).", "error");
        return;
    }

    if (!/^9\d{8}$/.test(telefono)) {
        mostrarAlerta("El número de celular debe tener 9 dígitos y empezar con 9 (Ej. 953586776).", "error");
        return;
    }

    if (!email.includes("@") || !email.includes(".")) {
        mostrarAlerta("Ingresa un correo electrónico válido.", "error");
        return;
    }

    if (!fecha || !hora) {
        mostrarAlerta("Debes seleccionar una fecha y hora para tu reserva.", "error");
        return;
    }

    if (hora < "11:00" || hora > "19:00") {
        mostrarAlerta("Nuestro horario de atención es de 11:00 a.m. a 7:00 p.m. (11:00 a 19:00).", "error");
        return;
    }

    if (isNaN(personas) || personas < 1 || personas > 20) {
        mostrarAlerta("El número de comensales debe estar entre 1 y 20 personas.", "error");
        return;
    }

    let reservaProcesada;

    if (idEdicion) {
        const indice = listaReservas.findIndex(r => r.id === idEdicion);
        if (indice !== -1) {
            reservaProcesada = {
                ...listaReservas[indice],
                servicio, nombre, telefono, email, fecha, hora, personas,
                mensaje: mensaje || "Sin observaciones"
            };
            listaReservas[indice] = reservaProcesada;
        }
        cancelarEdicion();
    } else {
        const codigoGenerado = "RES-" + Math.floor(1000 + Math.random() * 9000);
        reservaProcesada = {
            id: codigoGenerado,
            servicio,
            nombre,
            telefono,
            email,
            fecha,
            hora,
            personas,
            mensaje: mensaje || "Sin observaciones",
            estado: "Confirmado"
        };
        listaReservas.unshift(reservaProcesada);
        document.getElementById("form-reserva-mesa").reset();
        configurarFechaMinima();
    }

    guardarEnStorage();
    renderizarTablaReservas();
    mostrarVentanaFlotanteDatos(reservaProcesada);
}

function mostrarVentanaFlotanteDatos(datosReserva) {
    const contenedor = document.getElementById("cuerpo-ventana-flotante");
    contenedor.innerHTML = `
        <div class="fila-dato-ticket">
            <span class="etiqueta-dato">Código de Reserva:</span>
            <span class="valor-dato">${datosReserva.id}</span>
        </div>
        <div class="fila-dato-ticket">
            <span class="etiqueta-dato">Servicio Solicitado:</span>
            <span class="valor-dato">${datosReserva.servicio}</span>
        </div>
        <div class="fila-dato-ticket">
            <span class="etiqueta-dato">Cliente:</span>
            <span class="valor-dato">${datosReserva.nombre}</span>
        </div>
        <div class="fila-dato-ticket">
            <span class="etiqueta-dato">Teléfono:</span>
            <span class="valor-dato">${datosReserva.telefono}</span>
        </div>
        <div class="fila-dato-ticket">
            <span class="etiqueta-dato">Correo Electrónico:</span>
            <span class="valor-dato">${datosReserva.email}</span>
        </div>
        <div class="fila-dato-ticket">
            <span class="etiqueta-dato">Fecha y Hora:</span>
            <span class="valor-dato">${datosReserva.fecha} - ${datosReserva.hora} hrs</span>
        </div>
        <div class="fila-dato-ticket">
            <span class="etiqueta-dato">Comensales:</span>
            <span class="valor-dato">${datosReserva.personas} personas</span>
        </div>
        <div class="fila-dato-ticket">
