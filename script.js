document.addEventListener("DOMContentLoaded", () => {
    // ⚙️ CONFIGURACIÓN VITAL DE PDF.JS (Para que no se trabe)
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

    // --- 🚀 PANTALLA DE CARGA ÉPICA ---
    setTimeout(() => {
        const loader = document.getElementById("loader");
        if(loader) {
            loader.style.opacity = "0";
            setTimeout(() => loader.remove(), 1000);
        }
    }, 1500);

    const carousel = document.getElementById("carousel");
    const books = document.querySelectorAll(".book");
    const visor = document.getElementById("visor");
    const cerrar = document.getElementById("cerrar");
    const titulo = document.getElementById("tituloLibro");
    const sound = document.getElementById("openSound");

    let angle = 0;
    const total = books.length;
    const radius = 260;

    // 🔥 POSICIÓN 3D DE LOS LIBROS
    books.forEach((book, i) => {
        const theta = (360 / total) * i;
        book.style.setProperty("--rotate", `${theta}deg`);
        book.style.setProperty("--z", `${radius}px`);
    });

    // 🌟 INERCIA DE GALAXIA
    let galaxyVelocityX = 0;

    // 🎮 BOTONES Y ROTACIÓN DEL CARRUSEL
    document.getElementById("next").addEventListener("click", () => rotate(1));
    document.getElementById("prev").addEventListener("click", () => rotate(-1));

    function rotate(direction) {
        angle += direction * (360 / total);
        carousel.style.transform = `rotateY(${angle}deg)`;
        
        // Darle un empujón a la galaxia cuando rotas el carrusel
        galaxyVelocityX = direction * 15; 
    }

    // --- 📖 LÓGICA DE PDF.JS (EL LECTOR REAL) ---
    const pdfCanvas = document.getElementById('pdfCanvas');
    const ctxPdf = pdfCanvas.getContext('2d');
    let pdfDoc = null, pageNum = 1, pageIsRendering = false, pageNumIsPending = null;

    const renderPage = num => {
        pageIsRendering = true;
        pdfDoc.getPage(num).then(page => {
            const viewport = page.getViewport({ scale: 1.2 }); // Ajusta el zoom aquí si lo necesitas
            pdfCanvas.height = viewport.height;
            pdfCanvas.width = viewport.width;

            const renderCtx = { canvasContext: ctxPdf, viewport: viewport };
            page.render(renderCtx).promise.then(() => {
                pageIsRendering = false;
                if (pageNumIsPending !== null) {
                    renderPage(pageNumIsPending);
                    pageNumIsPending = null;
                }
            });
            document.getElementById('pageNum').textContent = num;
        });
    };

    const queueRenderPage = num => {
        if (pageIsRendering) pageNumIsPending = num;
        else renderPage(num);
    };

    // 📚 CLICK EN LOS LIBROS (ANIMACIÓN NETFLIX)
    books.forEach(book => {
        book.addEventListener("click", () => {
            if (book.classList.contains("proximamente")) {
                alert("📚 Este libro estará disponible pronto 💕");
                return;
            }

            const pdfUrl = book.dataset.pdf;
            
            // 🔊 Reproducir Sonido
            if (sound) { 
                sound.currentTime = 0; 
                sound.play(); 
            }

            // 💾 Guardar progreso 
            localStorage.setItem("ultimoLibro", pdfUrl);

            // 📖 Abrir visor con animación
            visor.classList.add("activo");
            titulo.textContent = pdfUrl.split("/").pop().replace('.pdf', '').replace(/-/g, ' ');

            // 📄 Cargar documento PDF real
            pdfCanvas.style.opacity = "0.5"; 
            pdfjsLib.getDocument(pdfUrl).promise.then(pdfDoc_ => {
                pdfDoc = pdfDoc_;
                pageNum = 1;
                renderPage(pageNum);
                pdfCanvas.style.opacity = "1";
            }).catch(err => {
                console.error("Error cargando PDF:", err);
                ctxPdf.fillStyle = "white";
                ctxPdf.font = "20px Arial";
                ctxPdf.fillText("Error al cargar el PDF. Verifica la ruta.", 50, 50);
            });
        });
    });

    // ❌ CERRAR VISOR
    cerrar.addEventListener("click", () => {
        visor.classList.remove("activo");
        
        // Si está en pantalla completa, salir automáticamente al cerrar el libro
        if (document.fullscreenElement) {
            document.exitFullscreen();
            document.getElementById("btnFullscreen").textContent = "⛶ EXPANDIR";
        }

        setTimeout(() => { 
            ctxPdf.clearRect(0, 0, pdfCanvas.width, pdfCanvas.height); 
            pdfDoc = null;
        }, 400);
    });

    // 📖 NAVEGACIÓN DE PÁGINAS (CON EFECTO FÍSICO)
    document.getElementById("prevPage").addEventListener("click", () => {
        if (pageNum <= 1) return;
        pageNum--;
        
        pdfCanvas.classList.remove("page-turning-left", "page-turning-right");
        void pdfCanvas.offsetWidth; 
        pdfCanvas.classList.add("page-turning-left");
        
        queueRenderPage(pageNum);
    });

    document.getElementById("nextPage").addEventListener("click", () => {
        if (pdfDoc && pageNum >= pdfDoc.numPages) return;
        pageNum++;
        
        pdfCanvas.classList.remove("page-turning-left", "page-turning-right");
        void pdfCanvas.offsetWidth; 
        pdfCanvas.classList.add("page-turning-right");
        
        queueRenderPage(pageNum);
    });

    // 🌙 LÓGICA MODO DESCANSO VISUAL
    const btnDescanso = document.getElementById("btnDescanso");
    btnDescanso.addEventListener("click", () => {
        visor.classList.toggle("modo-descanso");
        if (visor.classList.contains("modo-descanso")) {
            btnDescanso.textContent = "☀️ MODO NORMAL";
        } else {
            btnDescanso.textContent = "🌙 DESCANSO";
        }
    });

    // ⛶ LÓGICA PANTALLA COMPLETA
    const btnFullscreen = document.getElementById("btnFullscreen");
    btnFullscreen.addEventListener("click", () => {
        if (!document.fullscreenElement) {
            // Entrar a pantalla completa
            if (visor.requestFullscreen) {
                visor.requestFullscreen();
            } else if (visor.webkitRequestFullscreen) { /* Safari */
                visor.webkitRequestFullscreen();
            } else if (visor.msRequestFullscreen) { /* IE11 */
                visor.msRequestFullscreen();
            }
            btnFullscreen.textContent = "🗗 REDUCIR";
        } else {
            // Salir de pantalla completa
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
            btnFullscreen.textContent = "⛶ EXPANDIR";
        }
    });

    // 📱 SWIPE PARA MOVER EL CARRUSEL EN MÓVILES
    let startX = 0;
    document.addEventListener("touchstart", e => { startX = e.touches[0].clientX; });
    document.addEventListener("touchend", e => {
        let endX = e.changedTouches[0].clientX;
        if (!visor.classList.contains("activo")) {
            if (startX - endX > 50) rotate(1);
            else if (endX - startX > 50) rotate(-1);
        }
    });

    // 🌌 GALAXIA SINCRONIZADA (MÁS LENTA Y CON MÁS ESTRELLAS)
    const canvasGal = document.getElementById("galaxy");
    const ctxGal = canvasGal.getContext("2d");

    function resizeCanvas() {
        canvasGal.width = window.innerWidth;
        canvasGal.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let stars = [];
    // 🔥 Multiplicamos por 10 la cantidad de estrellas (Ahora son 2000)
    for (let i = 0; i < 2000; i++) {
        stars.push({
            x: Math.random() * canvasGal.width - canvasGal.width / 2,
            y: Math.random() * canvasGal.height - canvasGal.height / 2,
            z: Math.random() * canvasGal.width
        });
    }

    function animateGalaxy() {
        ctxGal.fillStyle = "black";
        ctxGal.fillRect(0, 0, canvasGal.width, canvasGal.height);
        ctxGal.fillStyle = "white";

        stars.forEach(star => {
            // 🔥 Reducimos drásticamente la velocidad frontal (de 2 a 0.3)
            star.z -= 0.3; 
            
            // Inercia lateral al mover el carrusel
            star.x += galaxyVelocityX;

            if (star.z <= 0) {
                star.z = canvasGal.width;
                star.x = Math.random() * canvasGal.width - canvasGal.width / 2;
                star.y = Math.random() * canvasGal.height - canvasGal.height / 2;
            }
            
            // Reciclar estrellas si se salen por los bordes
            if (star.x > canvasGal.width / 2) star.x = -canvasGal.width / 2;
            if (star.x < -canvasGal.width / 2) star.x = canvasGal.width / 2;

            let k = 128 / star.z;
            let x = star.x * k + canvasGal.width / 2;
            let y = star.y * k + canvasGal.height / 2;
            // Ajustamos un poco el tamaño máximo para que no se vea saturado con tantas estrellas
            let size = (1 - star.z / canvasGal.width) * 2; 

            ctxGal.beginPath();
            ctxGal.arc(x, y, size, 0, Math.PI * 2);
            ctxGal.fill();
        });

        galaxyVelocityX *= 0.92; 
        requestAnimationFrame(animateGalaxy);
    }
    
    animateGalaxy();
});