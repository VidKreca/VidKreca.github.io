const CONSTRAIN = 600;
const mouseOverContainer = document.querySelector(".container");
const ex1Layer = document.querySelector(".laptopContainer");

function transforms(x, y, el) {
    const box = el.getBoundingClientRect();
    const calcX = -(y - box.y - (box.height / 2)) / CONSTRAIN;
    const calcY = (x - box.x - (box.width / 2)) / CONSTRAIN;

    return `perspective(100px) rotateX(${calcX}deg) rotateY(${calcY}deg)`
};

function transformElement(el, xyEl) {
    el.style.transform = transforms.apply(null, xyEl);
}

mouseOverContainer.onmousemove = (e) => {
    const xy = [e.clientX, e.clientY];
    const position = xy.concat([ex1Layer]);

    window.requestAnimationFrame(() => {
        transformElement(ex1Layer, position);
    });
};
