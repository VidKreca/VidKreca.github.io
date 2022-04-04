const options = {
    threshold: 0.3,
};
const observer = new IntersectionObserver(callback, options);

// Observe all sections
[...document.querySelectorAll(".section")].slice(1).forEach((section) => {
    observer.observe(section);
});

// Add the slide-in class when the target is in view
function callback(entries) {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("slide-in");
        }
    });
}