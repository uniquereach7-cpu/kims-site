document.addEventListener("DOMContentLoaded", function () {

    /*=========================================
      View More Button
    =========================================*/

    const buttons = document.querySelectorAll(".view-more-btn");

    buttons.forEach(function(button){

        button.addEventListener("click", function(){

            const cardText = this.previousElementSibling;
            const moreText = cardText.querySelector(".more-text");

            if(!moreText){
                return;
            }

            cardText.classList.toggle("active");

            this.textContent = cardText.classList.contains("active")
                ? "View Less"
                : "View More";

        });

    });


    /*=========================================
      Header — condense on scroll, mobile menu,
      and highlight the section in view
    =========================================*/

    const kimsHeader = document.getElementById("kimsHeader");

    if(kimsHeader){

        const toggle   = kimsHeader.querySelector(".kims-nav-toggle");
        const navLinks = [...kimsHeader.querySelectorAll(".kims-nav-link")];

        // Condensed style once scrolled off the top. Driven by a
        // sentinel rather than a scroll listener so it still works
        // when the page is scrolled programmatically.
        const onScroll = function(){
            kimsHeader.classList.toggle("is-scrolled", window.scrollY > 24);
        };

        window.addEventListener("scroll", onScroll, { passive: true });

        if("IntersectionObserver" in window){

            const sentinel = document.createElement("div");
            sentinel.setAttribute("aria-hidden", "true");
            sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:24px;pointer-events:none;";
            document.body.prepend(sentinel);

            new IntersectionObserver(function(entries){
                kimsHeader.classList.toggle("is-scrolled", !entries[0].isIntersecting);
            }, { threshold: 0 }).observe(sentinel);

        }

        onScroll();

        // mobile menu
        if(toggle){

            toggle.addEventListener("click", function(){
                const open = kimsHeader.classList.toggle("nav-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });

            // close after picking a section
            navLinks.forEach(function(a){
                a.addEventListener("click", function(){
                    kimsHeader.classList.remove("nav-open");
                    toggle.setAttribute("aria-expanded", "false");
                });
            });

            // close when tapping outside
            document.addEventListener("click", function(e){
                if(!kimsHeader.contains(e.target)){
                    kimsHeader.classList.remove("nav-open");
                    toggle.setAttribute("aria-expanded", "false");
                }
            });

        }

        // mark whichever section is currently on screen
        const sections = navLinks
            .map(function(a){
                const id = a.getAttribute("href").split("#")[1];
                return id ? document.getElementById(id) : null;
            })
            .filter(Boolean);

        if(sections.length && "IntersectionObserver" in window){

            const io = new IntersectionObserver(function(entries){
                entries.forEach(function(entry){
                    if(!entry.isIntersecting){ return; }
                    navLinks.forEach(function(a){
                        a.classList.toggle(
                            "is-current",
                            a.getAttribute("href").endsWith("#" + entry.target.id)
                        );
                    });
                });
            }, { rootMargin: "-45% 0px -50% 0px" });

            sections.forEach(function(sec){ io.observe(sec); });

        }

    }


    /*=========================================
      Testimonial Swiper
    =========================================*/

    /* Slider on phones and tablets only. From 992px up the wrapper
       is a plain four-column grid, so Swiper is torn down entirely
       rather than left running behind a CSS override. */
    if(document.querySelector(".testimonialSwiper")){

        const tEl = document.querySelector(".testimonialSwiper");
        const MOBILE = "(max-width: 991px)";
        let tSwiper = null;

        const syncTestimonials = function(){

            const wantSlider = window.matchMedia(MOBILE).matches;

            if(wantSlider && !tSwiper){

                tSwiper = new Swiper(tEl, {
                    loop: true,
                    speed: 1200,
                    spaceBetween: 20,
                    autoplay: {
                        delay: 2500,
                        disableOnInteraction: false,
                    },
                    pagination: {
                        el: ".testimonialSwiper .swiper-pagination",
                        clickable: true,
                    },
                    breakpoints: {
                        0:   { slidesPerView: 1 },
                        576: { slidesPerView: 2 }
                    }
                });

            } else if(!wantSlider && tSwiper){

                tSwiper.destroy(true, true);
                tSwiper = null;

            }

        };

        syncTestimonials();
        window.addEventListener("resize", syncTestimonials);

    }



/*=========================================
  Symptoms Swiper
=========================================*/

if(document.querySelector(".symptomSwiper")){

 new Swiper(".symptomSwiper", {
    loop: true,
    slidesPerView: 3,
    slidesPerGroup: 1,
    spaceBetween: 25,
    speed: 1000,

    autoplay: {
        delay: 2500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
    },

    breakpoints: {
        0: {
            slidesPerView: 1,
        },
        576: {
            slidesPerView: 2,
        },
        992: {
            slidesPerView: 3,
        }
    }
});

}


/*=========================================
  Technology cards — 3-line clamp toggle
=========================================*/

document.querySelectorAll(".tech-toggle").forEach(function(btn){

    const text = btn.previousElementSibling;

    if(!text || !text.classList.contains("tech-text")){
        return;
    }

    // Cards sit in inactive carousel slides, which have no height
    // until shown — measuring at load would wrongly hide the button.
    // Re-check whenever the element actually gets a size.
    const syncButton = function(){

        if(text.classList.contains("is-open")){
            return;
        }

        if(text.clientHeight === 0){
            return;   // still hidden, decide later
        }

        btn.hidden = text.scrollHeight <= text.clientHeight + 2;

    };

    if("ResizeObserver" in window){
        new ResizeObserver(syncButton).observe(text);
    }

    window.addEventListener("resize", syncButton);
    syncButton();

    btn.addEventListener("click", function(){

        const open = text.classList.toggle("is-open");
        btn.textContent = open ? "View Less" : "View More";

    });

});


/*=========================================
  Procedure cards — full list opens in a panel
  (cards are absolutely positioned, so expanding
  one in place would cover its neighbours)
=========================================*/

const procModal = document.getElementById("procedureModal");

if(procModal){

    const modalTitle = procModal.querySelector("#procedureModalTitle");
    const modalList  = procModal.querySelector(".procedure-modal-list");
    let lastFocused  = null;

    const closeModal = function(){
        procModal.hidden = true;
        document.body.style.overflow = "";
        if(lastFocused){ lastFocused.focus(); }
    };

    const openModal = function(title, items, opener){
        lastFocused = opener;
        modalTitle.textContent = title;
        modalList.innerHTML = "";
        items.forEach(function(t){
            const li = document.createElement("li");
            li.textContent = t;
            modalList.appendChild(li);
        });
        procModal.hidden = false;
        document.body.style.overflow = "hidden";
        procModal.querySelector(".procedure-modal-close").focus();
    };

    document.querySelectorAll(".procedure-toggle").forEach(function(btn){

        const list = btn.previousElementSibling;

        if(!list || !list.classList.contains("procedure-list")){
            return;
        }

        btn.addEventListener("click", function(){
            const items = [...list.querySelectorAll("li")].map(function(li){
                return li.textContent.trim();
            });
            openModal(btn.dataset.title || "", items, btn);
        });

    });

    procModal.addEventListener("click", function(e){
        if(e.target.hasAttribute("data-close")){ closeModal(); }
    });

    document.addEventListener("keydown", function(e){
        if(e.key === "Escape" && !procModal.hidden){ closeModal(); }
    });

}


/*=========================================
  Heart Video
  The autoplay attribute alone is unreliable — some
  browsers hold it until the element is on screen or
  until the user interacts. Nudge it, then fall back.
=========================================*/

const heartVideo = document.querySelector(".heart-video");

if(heartVideo){

    const playHeart = function(){

        const attempt = heartVideo.play();

        if(attempt !== undefined){
            attempt.catch(function(){ /* blocked — retry on interaction */ });
        }

    };

    playHeart();

    // retry once it scrolls into view
    if("IntersectionObserver" in window){

        new IntersectionObserver(function(entries, observer){

            entries.forEach(function(entry){

                if(entry.isIntersecting){
                    playHeart();
                    observer.unobserve(entry.target);
                }

            });

        }, { threshold: 0.25 }).observe(heartVideo);

    }

    // last resort: first tap or scroll anywhere on the page
    ["click","touchstart","scroll"].forEach(function(evt){
        window.addEventListener(evt, playHeart, { once: true, passive: true });
    });

}


/*=========================================
  Doctors Swiper + Department Filter
=========================================*/

if(document.querySelector(".doctorSwiper")){

    const doctorEl     = document.querySelector(".doctorSwiper");
    const doctorWrap   = doctorEl.querySelector(".swiper-wrapper");
    const filterBtns   = document.querySelectorAll(".doctor-filter-btn");

    // keep a pristine copy of every slide before Swiper clones any of them
    const allSlides = [...doctorWrap.querySelectorAll(".swiper-slide")].map(function(s){
        return { dept: s.dataset.dept, html: s.outerHTML };
    });

    let doctorSwiper = null;

    const buildSwiper = function(dept){

        const slides = (dept === "all")
            ? allSlides
            : allSlides.filter(function(s){ return s.dept === dept; });

        if(doctorSwiper){
            doctorSwiper.destroy(true, true);
            doctorSwiper = null;
        }

        doctorWrap.innerHTML = slides.map(function(s){ return s.html; }).join("");

        // A department can hold fewer doctors than the columns on screen
        // (Electrophysiology has one). Looping or autoplaying that few
        // slides makes Swiper jump, so both stay off until it's worth it.
        const perView   = window.innerWidth >= 992 ? 3 : (window.innerWidth >= 576 ? 2 : 1);
        const canRotate = slides.length > perView;

        doctorSwiper = new Swiper(doctorEl, {
            loop: canRotate,
            slidesPerView: 3,
            slidesPerGroup: 1,
            spaceBetween: 25,
            speed: 1000,
            centerInsufficientSlides: true,
            watchOverflow: true,

            autoplay: canRotate ? {
                delay: 2500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            } : false,

            pagination: {
                el: ".doctorSwiper .swiper-pagination",
                clickable: true,
            },

            navigation: {
                nextEl: ".doctorSwiper .swiper-button-next",
                prevEl: ".doctorSwiper .swiper-button-prev",
            },

            breakpoints: {
                0:   { slidesPerView: 1 },
                576: { slidesPerView: 2 },
                992: { slidesPerView: 3 }
            }
        });

        doctorEl.classList.toggle("is-static", !canRotate);

    };

    /* Edge fades + arrow so the scrollable filter row reads as
       scrollable instead of looking like it just ends. */
    const filterRow  = document.querySelector(".doctor-filter");
    const filterWrap = document.querySelector(".doctor-filter-wrap");
    const filterHint = document.querySelector(".doctor-filter-hint");

    const updateFilterFades = function(){

        if(!filterRow || !filterWrap){ return; }

        const max = filterRow.scrollWidth - filterRow.clientWidth;

        // nothing to scroll (desktop) — clear every hint
        if(max <= 2){
            filterRow.classList.remove("has-prev");
            filterRow.classList.add("at-end");
            filterWrap.classList.add("at-end");
            if(filterHint){ filterHint.style.opacity = "0"; }
            return;
        }

        const x     = filterRow.scrollLeft;
        const atEnd = x >= max - 2;

        filterRow.classList.toggle("has-prev", x > 2);
        filterRow.classList.toggle("at-end", atEnd);
        filterWrap.classList.toggle("at-end", atEnd);

        if(filterHint){ filterHint.style.opacity = atEnd ? "0" : "1"; }

    };

    if(filterRow){
        filterRow.addEventListener("scroll", updateFilterFades, { passive: true });
        window.addEventListener("resize", updateFilterFades);
        updateFilterFades();
    }

    buildSwiper("all");

    filterBtns.forEach(function(btn){

        btn.addEventListener("click", function(){

            filterBtns.forEach(function(b){
                b.classList.remove("is-active");
                b.setAttribute("aria-selected", "false");
            });

            btn.classList.add("is-active");
            btn.setAttribute("aria-selected", "true");

            buildSwiper(btn.dataset.dept);

            btn.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });

        });

    });

}

});