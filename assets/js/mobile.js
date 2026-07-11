document.addEventListener("DOMContentLoaded", () => {

    if (window.innerWidth > 768) return;

    const activateMedia = (container) => {

    container.querySelectorAll(".clickable-media").forEach(element => {
        element.addEventListener("click", e => {
            if (e.target.closest(".media-mask-overlay") || e.target.closest(".cv-pdf") || e.target.closest(".pdf-fallback-preview-card") || e.target.tagName === "IMG") {
                e.stopPropagation();
                const type = element.dataset.type;
                const src = element.dataset.src;
                if (type === "image") {
                    const restoreProjectView = () => activateMedia(container);
                    window.openNestedPortal(`<img src="${src}" class="portal-fullscreen-img" alt="Enlarged Reference View">`, false, restoreProjectView);
                } else if (type === "pdf") {
                    window.open(src, "_blank");
                }
            }
        });
    });

    container.querySelectorAll(".link-preview-card").forEach(card => {
        card.addEventListener("click", e => {
            e.stopPropagation();
            const wrapper = card.closest(".auto-link-preview");
            const url = wrapper ? wrapper.dataset.url : null;
            if (url) window.open(url, "_blank");
        });
    });

};

    const openProjectPortal = (box) => {

    box.classList.remove("open");

    const header = box.querySelector(".project-header");
    const details = box.querySelector(".project-details");

    const tags = [];

header.querySelectorAll(
    ".project-tag, .position-tag, .date-tag, .post-tag, .post-date-tag"
).forEach(tag => {
    tags.push(tag.outerHTML);
});

    const titleElement = header.querySelector(".project-title");

    const title = titleElement ? titleElement.textContent.trim() : "";

    const temp = details.cloneNode(true);

temp.querySelectorAll("br").forEach(br => br.remove());

const body = temp.innerHTML;

    window.openPortal(`
        <div class="project-popup">

            <div class="project-popup-tags">
                ${tags.join("")}
            </div>

            <div class="project-popup-title">
                ${title}
            </div>

            <div class="project-popup-divider"></div>

            <div class="project-popup-body">
                ${body}
            </div>

        </div>
    `);

    const viewport = document.querySelector("#global-media-modal .portal-viewport-content");
    if (viewport) activateMedia(viewport);

};

    document.querySelectorAll(".project-box").forEach(box => {

        box.addEventListener("click", e => {

    if (document.getElementById("global-media-modal").classList.contains("active")) return;

    if (e.target.closest(".clickable-media")) return;

    e.preventDefault();
    e.stopPropagation();

    openProjectPortal(box);

});

    });

});