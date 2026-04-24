document.addEventListener("DOMContentLoaded", () => {

    const carousel = document.getElementById("carousel");
    const books = document.querySelectorAll(".book");

    let angle = 0;
    const total = books.length;
    const radius = 260;

    // 🔥 POSICIÓN 3D SIN CONFLICTO
    books.forEach((book, i) => {
        const theta = (360 / total) * i;

        // 👉 usamos variables en vez de transform directo
        book.style.setProperty("--rotate", `${theta}deg`);
        book.style.setProperty("--z", `${radius}px`);
    });

    // BOTONES
    document.getElementById("next").addEventListener("click", () => rotate(1));
    document.getElementById("prev").addEventListener("click", () => rotate(-1));

    function rotate(direction) {
        angle += direction * (360 / total);
        carousel.style.transform = `rotateY(${angle}deg)`;
    }

    // CLICK LIBROS
    books.forEach(book => {
        book.addEventListener("click", () => {

            if (book.classList.contains("proximamente")) {
                alert("📚 Este libro estará disponible pronto 💕");
                return;
            }

            const pdf = book.dataset.pdf;
           const visor = document.getElementById("visor");
const pdfViewer = document.getElementById("pdfViewer");
const cerrar = document.getElementById("cerrar");
const titulo = document.getElementById("tituloLibro");

books.forEach(book => {
    book.addEventListener("click", () => {

        if (book.classList.contains("proximamente")) {
            alert("📚 Este libro estará disponible pronto 💕");
            return;
        }

        const pdf = book.dataset.pdf;

        // 📖 abrir visor
        visor.classList.add("activo");
        pdfViewer.src = pdf;

        // título dinámico
        titulo.textContent = pdf.split("/").pop();
    });
});

// ❌ cerrar visor
cerrar.addEventListener("click", () => {
    visor.classList.remove("activo");
    pdfViewer.src = "";
});
        });
    });

    // 📱 SWIPE
    let startX = 0;

    document.addEventListener("touchstart", e => {
        startX = e.touches[0].clientX;
    });

    document.addEventListener("touchend", e => {
        let endX = e.changedTouches[0].clientX;

        if (startX - endX > 50) rotate(1);
        else if (endX - startX > 50) rotate(-1);
    });

    // 🌌 ESTRELLAS
    const canvas = document.getElementById("stars");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let stars = [];

    for (let i = 0; i < 120; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5,
            speed: Math.random() * 0.3 + 0.1
        });
    }

    function drawStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ffffff";

        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();

            star.y += star.speed;

            if (star.y > canvas.height) {
                star.y = 0;
                star.x = Math.random() * canvas.width;
            }
        });

        requestAnimationFrame(drawStars);
    }

    drawStars();
});
