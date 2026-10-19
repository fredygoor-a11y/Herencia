
// ============================================================
// HERENCIA Y SABOR - FUNCIONES DE LA PÁGINA
// Archivo: carrito.js
// ============================================================

"use strict";

// Número de WhatsApp del emprendimiento, con indicativo de Colombia.
const TELEFONO_WHATSAPP = "573152174537";

// ------------------------------------------------------------
// ELEMENTOS PRINCIPALES
// ------------------------------------------------------------

const btnAbrirCarrito = document.getElementById("btn-abrir-carrito");
const btnVerCarrito = document.getElementById("btn-ver-carrito");
const btnCerrarCarrito = document.getElementById("btn-cerrar-carrito");
const ventanaCarrito = document.getElementById("carrito-ventana");
const fondoCarrito = document.getElementById("carrito-fondo");
const listaCarrito = document.getElementById("lista-carrito");
const contadorCarrito = document.getElementById("contador-carrito");
const precioTotal = document.getElementById("precio-total");
const btnEnviarWhatsApp = document.getElementById("btn-enviar-whatsapp");
const btnVaciarCarrito = document.getElementById("btn-vaciar-carrito");

const btnMenu = document.getElementById("menu-toggle");
const menuPrincipal = document.getElementById("menu-principal");

const formularioContacto = document.getElementById("formulario-contacto");
const estadoFormulario = document.getElementById("estado-formulario");

// Cada producto del carrito se guarda como:
// { nombre: "Nombre del producto", precio: 25000, cantidad: 1 }
const carrito = new Map();

// ------------------------------------------------------------
// FORMATO DE DINERO
// ------------------------------------------------------------

function formatoDinero(valor) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(valor);
}

// ------------------------------------------------------------
// MENÚ PARA CELULARES
// ------------------------------------------------------------

function cerrarMenu() {
    if (!btnMenu || !menuPrincipal) return;

    menuPrincipal.classList.remove("abierto");
    btnMenu.setAttribute("aria-expanded", "false");
    btnMenu.setAttribute("aria-label", "Abrir menú");
}

if (btnMenu && menuPrincipal) {
    btnMenu.addEventListener("click", () => {
        const abierto = menuPrincipal.classList.toggle("abierto");

        btnMenu.setAttribute("aria-expanded", String(abierto));
        btnMenu.setAttribute(
            "aria-label",
            abierto ? "Cerrar menú" : "Abrir menú"
        );
    });

    menuPrincipal.querySelectorAll("a").forEach((enlace) => {
        enlace.addEventListener("click", cerrarMenu);
    });

    document.addEventListener("click", (evento) => {
        if (
            menuPrincipal.classList.contains("abierto") &&
            !menuPrincipal.contains(evento.target) &&
            !btnMenu.contains(evento.target)
        ) {
            cerrarMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 760) {
            cerrarMenu();
        }
    });
}

// ------------------------------------------------------------
// ABRIR Y CERRAR EL CARRITO
// ------------------------------------------------------------

function abrirCarrito() {
    ventanaCarrito.classList.add("activo");
    fondoCarrito.classList.add("activo");

    ventanaCarrito.setAttribute("aria-hidden", "false");
    btnAbrirCarrito.setAttribute("aria-expanded", "true");
    document.body.classList.add("carrito-abierto");

    btnCerrarCarrito.focus();
}

function cerrarCarrito() {
    ventanaCarrito.classList.remove("activo");
    fondoCarrito.classList.remove("activo");

    ventanaCarrito.setAttribute("aria-hidden", "true");
    btnAbrirCarrito.setAttribute("aria-expanded", "false");
    document.body.classList.remove("carrito-abierto");

    btnAbrirCarrito.focus();
}

btnAbrirCarrito.addEventListener("click", abrirCarrito);
btnVerCarrito.addEventListener("click", abrirCarrito);
btnCerrarCarrito.addEventListener("click", cerrarCarrito);
fondoCarrito.addEventListener("click", cerrarCarrito);

// ------------------------------------------------------------
// AGREGAR PRODUCTOS
// ------------------------------------------------------------

document.querySelectorAll(".boton-agregar").forEach((boton) => {
    boton.addEventListener("click", () => {
        const nombre = boton.dataset.nombre;
        const precio = Number(boton.dataset.precio);

        if (!nombre || !Number.isFinite(precio) || precio <= 0) {
            alert("No fue posible agregar este producto. Revisa su precio.");
            return;
        }

        if (carrito.has(nombre)) {
            const producto = carrito.get(nombre);
            producto.cantidad += 1;
        } else {
            carrito.set(nombre, {
                nombre,
                precio,
                cantidad: 1
            });
        }

        actualizarCarrito();
        mostrarAvisoAgregado(boton);
    });
});

// Aviso breve para confirmar que se agregó el producto.
function mostrarAvisoAgregado(boton) {
    const textoOriginal = boton.innerHTML;

    boton.innerHTML = "✓ Agregado";
    boton.classList.add("agregado");
    boton.setAttribute("aria-label", "Producto agregado al carrito");

    // Se restaura el botón después de un breve momento.
    window.setTimeout(() => {
        boton.innerHTML = textoOriginal;
        boton.classList.remove("agregado");
        boton.removeAttribute("aria-label");
    }, 1300);
}

// ------------------------------------------------------------
// ACTUALIZAR TOTAL, CONTADOR Y CONTENIDO DEL CARRITO
// ------------------------------------------------------------

function actualizarCarrito() {
    let cantidadTotal = 0;
    let total = 0;

    carrito.forEach((producto) => {
        cantidadTotal += producto.cantidad;
        total += producto.precio * producto.cantidad;
    });

    contadorCarrito.textContent = cantidadTotal > 99 ? "99+" : cantidadTotal;
    contadorCarrito.setAttribute(
        "aria-label",
        `${cantidadTotal} unidades en el carrito`
    );

    precioTotal.textContent = formatoDinero(total);

    // Si no hay productos, mostramos el mensaje de carrito vacío.
    if (carrito.size === 0) {
        listaCarrito.innerHTML = `
            <div class="carrito-vacio">
                <span>🛍️</span>
                <p>Tu carrito está vacío.</p>
                <small>Agrega tus platos favoritos para comenzar.</small>
            </div>
        `;
        return;
    }

    listaCarrito.innerHTML = "";

    carrito.forEach((producto, nombre) => {
        const item = document.createElement("article");
        item.className = "item-carrito";

        const informacion = document.createElement("div");

        const titulo = document.createElement("h3");
        titulo.textContent = producto.nombre;

        const subtotal = document.createElement("div");
        subtotal.className = "item-precio";
        subtotal.textContent = formatoDinero(
            producto.precio * producto.cantidad
        );

        const controles = document.createElement("div");
        controles.className = "item-controles";

        const btnMenos = document.createElement("button");
        btnMenos.type = "button";
        btnMenos.textContent = "−";
        btnMenos.setAttribute(
            "aria-label",
            `Disminuir cantidad de ${producto.nombre}`
        );
        btnMenos.dataset.accion = "disminuir";
        btnMenos.dataset.nombre = nombre;

        const cantidad = document.createElement("span");
        cantidad.textContent = producto.cantidad;
        cantidad.setAttribute("aria-label", "Cantidad");

        const btnMas = document.createElement("button");
        btnMas.type = "button";
        btnMas.textContent = "+";
        btnMas.setAttribute(
            "aria-label",
            `Aumentar cantidad de ${producto.nombre}`
        );
        btnMas.dataset.accion = "aumentar";
        btnMas.dataset.nombre = nombre;

        controles.append(btnMenos, cantidad, btnMas);
        informacion.append(titulo, subtotal, controles);

        const btnEliminar = document.createElement("button");
        btnEliminar.type = "button";
        btnEliminar.className = "item-eliminar";
        btnEliminar.textContent = "Eliminar";
        btnEliminar.dataset.accion = "eliminar";
        btnEliminar.dataset.nombre = nombre;
        btnEliminar.setAttribute(
            "aria-label",
            `Eliminar ${producto.nombre} del carrito`
        );

        item.append(informacion, btnEliminar);
        listaCarrito.appendChild(item);
    });
}

// ------------------------------------------------------------
// AUMENTAR, DISMINUIR Y ELIMINAR PRODUCTOS
// ------------------------------------------------------------

listaCarrito.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-accion]");

    if (!boton) return;

    const nombre = boton.dataset.nombre;
    const accion = boton.dataset.accion;
    const producto = carrito.get(nombre);

    if (!producto) return;

    if (accion === "aumentar") {
        producto.cantidad += 1;
    }

    if (accion === "disminuir") {
        producto.cantidad -= 1;

        if (producto.cantidad <= 0) {
            carrito.delete(nombre);
        }
    }

    if (accion === "eliminar") {
        carrito.delete(nombre);
    }

    actualizarCarrito();
});

// ------------------------------------------------------------
// VACIAR TODO EL CARRITO
// ------------------------------------------------------------

btnVaciarCarrito.addEventListener("click", () => {
    if (carrito.size === 0) {
        alert("Tu carrito ya está vacío.");
        return;
    }

    const confirmar = window.confirm(
        "¿Estás seguro de que deseas eliminar todos los productos del carrito?"
    );

    if (!confirmar) return;

    carrito.clear();
    actualizarCarrito();
});

// ------------------------------------------------------------
// ENVIAR PEDIDO A WHATSAPP
// ------------------------------------------------------------

btnEnviarWhatsApp.addEventListener("click", () => {
    if (carrito.size === 0) {
        alert("Tu carrito está vacío. Agrega al menos un producto antes de confirmar.");
        return;
    }

    let total = 0;

    const lineas = [
        "¡Hola, Herencia y Sabor! Quiero realizar el siguiente pedido:",
        "",
        "*DETALLE DEL PEDIDO*"
    ];

    carrito.forEach((producto) => {
        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        lineas.push(
            `• ${producto.nombre}`,
            `  Cantidad: ${producto.cantidad}`,
            `  Precio unitario: ${formatoDinero(producto.precio)}`,
            `  Subtotal: ${formatoDinero(subtotal)}`,
            ""
        );
    });

    lineas.push(
        "------------------------------",
        `*TOTAL ESTIMADO: ${formatoDinero(total)}*`,
        "",
        "Por favor, confirmen la disponibilidad y el valor final de mi pedido.",
        "¡Muchas gracias!"
    );

    const mensaje = lineas.join("\n");
    const url = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank", "noopener,noreferrer");
});

// ------------------------------------------------------------
// FORMULARIO DE CONTACTO: PREPARAR MENSAJE DE WHATSAPP
// ------------------------------------------------------------

formularioContacto.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!formularioContacto.checkValidity()) {
        formularioContacto.reportValidity();
        return;
    }

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const mensajeUsuario = document.getElementById("mensaje").value.trim();

    if (nombre.length < 2 || mensajeUsuario.length < 5) {
        estadoFormulario.textContent =
            "Por favor, revisa el nombre y escribe un mensaje más completo.";
        return;
    }

    const lineas = [
        "¡Hola, Herencia y Sabor!",
        "",
        "*Nuevo mensaje desde la página web*",
        `Nombre: ${nombre}`,
        `Correo: ${correo}`,
        "",
        "*Mensaje:*",
        mensajeUsuario
    ];

    const mensaje = lineas.join("\n");
    const url = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

    estadoFormulario.textContent =
        "Se abrirá WhatsApp para que puedas revisar y enviar tu mensaje.";

    window.open(url, "_blank", "noopener,noreferrer");
});

// ------------------------------------------------------------
// GALERÍA AMPLIABLE CON BOTONES ANTERIOR Y SIGUIENTE
// ------------------------------------------------------------

const botonesGaleria = Array.from(
    document.querySelectorAll(".galeria-foto")
);

const visorGaleria = document.getElementById("visor-galeria");
const visorImagen = document.getElementById("visor-imagen");
const visorContador = document.getElementById("visor-contador");
const btnVisorCerrar = document.getElementById("visor-cerrar");
const btnVisorAnterior = document.getElementById("visor-anterior");
const btnVisorSiguiente = document.getElementById("visor-siguiente");

let indiceImagen = 0;
let elementoAnteriorVisor = null;

function mostrarImagen(indice) {
    if (botonesGaleria.length === 0) return;

    indiceImagen =
        (indice + botonesGaleria.length) % botonesGaleria.length;

    const imagenOriginal =
        botonesGaleria[indiceImagen].querySelector("img");

    visorImagen.src = imagenOriginal.src;
    visorImagen.alt = imagenOriginal.alt;

    visorContador.textContent =
        `Imagen ${indiceImagen + 1} de ${botonesGaleria.length}`;
}

function abrirVisor(indice) {
    elementoAnteriorVisor = document.activeElement;

    mostrarImagen(indice);

    visorGaleria.classList.add("activo");
    visorGaleria.setAttribute("aria-hidden", "false");
    document.body.classList.add("visor-abierto");

    btnVisorCerrar.focus();
}

function cerrarVisor() {
    visorGaleria.classList.remove("activo");
    visorGaleria.setAttribute("aria-hidden", "true");
    document.body.classList.remove("visor-abierto");

    visorImagen.removeAttribute("src");

    if (elementoAnteriorVisor) {
        elementoAnteriorVisor.focus();
    }
}

botonesGaleria.forEach((boton, indice) => {
    boton.addEventListener("click", () => abrirVisor(indice));
});

btnVisorCerrar.addEventListener("click", cerrarVisor);

btnVisorAnterior.addEventListener("click", () => {
    mostrarImagen(indiceImagen - 1);
});

btnVisorSiguiente.addEventListener("click", () => {
    mostrarImagen(indiceImagen + 1);
});

// Cerrar el visor si se hace clic en el fondo oscuro.
visorGaleria.addEventListener("click", (evento) => {
    if (evento.target === visorGaleria) {
        cerrarVisor();
    }
});

// ------------------------------------------------------------
// TECLADO: ESCAPE Y FLECHAS PARA LOS PANELES
// ------------------------------------------------------------

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
        if (visorGaleria.classList.contains("activo")) {
            cerrarVisor();
        } else if (ventanaCarrito.classList.contains("activo")) {
            cerrarCarrito();
        }

        cerrarMenu();
    }

    if (visorGaleria.classList.contains("activo")) {
        if (evento.key === "ArrowLeft") {
            mostrarImagen(indiceImagen - 1);
        }

        if (evento.key === "ArrowRight") {
            mostrarImagen(indiceImagen + 1);
        }
    }
});

// ------------------------------------------------------------
// AÑO AUTOMÁTICO EN EL PIE DE PÁGINA
// ------------------------------------------------------------

document.getElementById("anio-actual").textContent =
    new Date().getFullYear();

// ------------------------------------------------------------
// INICIALIZAR LA PÁGINA
// ------------------------------------------------------------

actualizarCarrito();
