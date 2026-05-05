---
layout: home
---

<main>
<hr>
    <section id="ABOUT" class="section">
        <button class="accordion">ABOUT</button>
        <div class="panel">
            <article>
                <p>WE ARE A COMMUNITY BASED LAPTOP ORCHESTRA, OPEN TO ANYONE WHO'S INTERESTED. <br>NO EXPERIENCE REQUIRED. ONLY A LAPTOP.</p>
                <p><a href="/about/">MORE</a></p>
            </article>
        </div>
    </section>

    <section id="REHEARSALS" class="section">
        <button class="accordion">SEASON</button>
        <div class="panel" style='padding: 0px'>
            <p>NEW YEAR - SAME SOUNDS.</p>
            <p>REHEARSALS EVERY FORTNIGHT.</p>
            <article id='calendarArticle' style='display: flex; justify-content: center'>
            {% include calendar.html %}
            </article>
        </div>
    </section>
    
    <section class="section">
        <button class='accordion'>PERFORMANCES</button>
        <div class='panel' >
            <article id='performanceContent'></article>
        </div>
    </section>

    <section id="contact" class="section">
        <button class="accordion">CONTACT</button>
        <div class="panel">
            <p>WHATSAPP <a href="https://chat.whatsapp.com/EXVoMvmAwFSIWxQ8vN5OXa">CHAT WITH US</a></p>
            <p>ARE.NA <a href="https://www.are.na/kat-macdonald/london_community_laptop_orchestra">ADD TO OUR BOARD</a></p>
            <p>INSTAGRAM <a href="https://www.instagram.com/londoncommunitylaptoporchestra/">UPDATES</a></p>
            <p><a href="mailto:londoncommunitylaptoporchestra@protonmail.com">EMAIL</a></p>
            <form
            action="https://buttondown.com/api/emails/embed-subscribe/londoncommunitylaptoporchestra"
            method="post"
            target="popupwindow"
            onsubmit="window.open('https://buttondown.com/londoncommunitylaptoporchestra', 'popupwindow')"
            class="embeddable-buttondown-form"
            >
                <p style='margin-bottom: 0px'>MAILING LIST</p>
                <div class='flex' style='width: 100%; justify-content: center; align-items: center; margin-bottom: 5px;'>
                    <input type="email" name="email" id="bd-email"/>
                    <input type="submit" value="Subscribe" id='subscribeButton' />
                </div>
            </form>
        </div>
    </section>
    <hr>
</main>

<script>
    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
            } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    }
</script>
