document.addEventListener("DOMContentLoaded", () => {
    // ⚙️ CONFIGURACIÓN VITAL DE PDF.JS 
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

    // --- 🚀 PANTALLA DE CARGA ---
    setTimeout(() => {
        const loader = document.getElementById("loader");
        if(loader) { loader.style.opacity = "0"; setTimeout(() => loader.remove(), 1000); }
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

    // 🔥 POSICIÓN 3D
    books.forEach((book, i) => {
        const theta = (360 / total) * i;
        book.style.setProperty("--rotate", `${theta}deg`);
        book.style.setProperty("--z", `${radius}px`);
    });

    let galaxyVelocityX = 0;

    // 🎮 BOTONES ROTACIÓN
    document.getElementById("next").addEventListener("click", () => rotate(1));
    document.getElementById("prev").addEventListener("click", () => rotate(-1));

    function rotate(direction) {
        angle += direction * (360 / total);
        carousel.style.transform = `rotateY(${angle}deg)`;
        galaxyVelocityX = direction * 15; 
    }

    // --- 📖 LÓGICA DE PDF.JS ---
    const pdfCanvas = document.getElementById('pdfCanvas');
    const ctxPdf = pdfCanvas.getContext('2d');
    let pdfDoc = null, pageNum = 1, pageIsRendering = false, pageNumIsPending = null;
    let currentPdfUrl = "";

    // 🔥 CORRECCIÓN: Tamaño inicial más pequeño en celular (0.9 en vez de 1.5)
    let currentScale = window.innerWidth < 600 ? 0.9 : 1.2;

    const renderPage = num => {
        pageIsRendering = true;
        pdfDoc.getPage(num).then(page => {
            const viewport = page.getViewport({ scale: currentScale }); 
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

    // 📚 CLICK LIBROS
    books.forEach(book => {
        book.addEventListener("click", () => {
            if (book.classList.contains("proximamente")) {
                alert("📚 Este libro estará disponible pronto 💕");
                return;
            }

            currentPdfUrl = book.dataset.pdf;
            
            if (sound) { sound.currentTime = 0; sound.play(); }

            visor.classList.add("activo");
            titulo.textContent = currentPdfUrl.split("/").pop().replace('.pdf', '').replace(/-/g, ' ');

            // 🔥 RECUPERAR PROGRESO GUARDADO
            let savedPage = localStorage.getItem(`progreso_${currentPdfUrl}`);
            pageNum = savedPage ? parseInt(savedPage) : 1;

            pdfCanvas.style.opacity = "0.5"; 
            pdfjsLib.getDocument(currentPdfUrl).promise.then(pdfDoc_ => {
                pdfDoc = pdfDoc_;
                
                if(pageNum > pdfDoc.numPages) pageNum = 1;

                renderPage(pageNum);
                pdfCanvas.style.opacity = "1";
                
                // 🔥 CORRECCIÓN: Resetear zoom a 0.9 en celular al abrir el libro
                currentScale = window.innerWidth < 600 ? 0.9 : 1.2; 
            }).catch(err => {
                console.error("Error cargando PDF:", err);
                ctxPdf.fillStyle = "white"; ctxPdf.font = "20px Arial";
                ctxPdf.fillText("Error al cargar el PDF. Verifica la ruta.", 50, 50);
            });
        });
    });

    // ❌ CERRAR
    cerrar.addEventListener("click", () => {
        visor.classList.remove("activo");
        if (document.fullscreenElement) {
            document.exitFullscreen();
            document.getElementById("btnFullscreen").textContent = "⛶ EXPANDIR";
        }
        setTimeout(() => { ctxPdf.clearRect(0, 0, pdfCanvas.width, pdfCanvas.height); pdfDoc = null; }, 400);
    });

    // 📖 NAVEGACIÓN
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

    // 🔍 LÓGICA DE ZOOM
    document.getElementById("btnZoomIn").addEventListener("click", () => {
        currentScale += 0.3; 
        queueRenderPage(pageNum); 
    });

    document.getElementById("btnZoomOut").addEventListener("click", () => {
        if (currentScale > 0.6) { 
            currentScale -= 0.3; 
            queueRenderPage(pageNum);
        }
    });

    // 💾 LÓGICA GUARDAR PROGRESO
    document.getElementById("btnGuardar").addEventListener("click", () => {
        if(currentPdfUrl) {
            localStorage.setItem(`progreso_${currentPdfUrl}`, pageNum);
            
            let btn = document.getElementById("btnGuardar");
            let originalText = btn.textContent;
            btn.textContent = "✔️ GUARDADO";
            btn.style.background = "linear-gradient(180deg, #33cc33, #009900)";
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = ""; 
            }, 1500);
        }
    });

    // 🌙 MODO DESCANSO
    const btnDescanso = document.getElementById("btnDescanso");
    btnDescanso.addEventListener("click", () => {
        visor.classList.toggle("modo-descanso");
        btnDescanso.textContent = visor.classList.contains("modo-descanso") ? "☀️ NORMAL" : "🌙 DESCANSO";
    });

    // ⛶ PANTALLA COMPLETA
    const btnFullscreen = document.getElementById("btnFullscreen");
    btnFullscreen.addEventListener("click", () => {
        if (!document.fullscreenElement) {
            if (visor.requestFullscreen) visor.requestFullscreen();
            else if (visor.webkitRequestFullscreen) visor.webkitRequestFullscreen();
            btnFullscreen.textContent = "🗗 REDUCIR";
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            btnFullscreen.textContent = "⛶ EXPANDIR";
        }
    });

    // 📱 SWIPE
    let startX = 0;
    document.addEventListener("touchstart", e => { startX = e.touches[0].clientX; });
    document.addEventListener("touchend", e => {
        let endX = e.changedTouches[0].clientX;
        if (!visor.classList.contains("activo")) {
            if (startX - endX > 50) rotate(1);
            else if (endX - startX > 50) rotate(-1);
        }
    });

    // 🌌 GALAXIA
    const canvasGal = document.getElementById("galaxy");
    const ctxGal = canvasGal.getContext("2d");

    function resizeCanvas() { canvasGal.width = window.innerWidth; canvasGal.height = window.innerHeight; }
    resizeCanvas(); window.addEventListener("resize", resizeCanvas);

    let stars = [];
    for (let i = 0; i < 2000; i++) {
        stars.push({ x: Math.random() * canvasGal.width - canvasGal.width / 2, y: Math.random() * canvasGal.height - canvasGal.height / 2, z: Math.random() * canvasGal.width });
    }

    function animateGalaxy() {
        ctxGal.fillStyle = "black"; ctxGal.fillRect(0, 0, canvasGal.width, canvasGal.height); ctxGal.fillStyle = "white";
        stars.forEach(star => {
            star.z -= 0.3; 
            star.x += galaxyVelocityX;
            if (star.z <= 0) { star.z = canvasGal.width; star.x = Math.random() * canvasGal.width - canvasGal.width / 2; star.y = Math.random() * canvasGal.height - canvasGal.height / 2; }
            if (star.x > canvasGal.width / 2) star.x = -canvasGal.width / 2;
            if (star.x < -canvasGal.width / 2) star.x = canvasGal.width / 2;
            let k = 128 / star.z; let x = star.x * k + canvasGal.width / 2; let y = star.y * k + canvasGal.height / 2;
            let size = (1 - star.z / canvasGal.width) * 2; 
            ctxGal.beginPath(); ctxGal.arc(x, y, size, 0, Math.PI * 2); ctxGal.fill();
        });
        galaxyVelocityX *= 0.92; requestAnimationFrame(animateGalaxy);
    }
    animateGalaxy();
});