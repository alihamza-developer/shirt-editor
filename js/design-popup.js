// Toggle Design Popup
function toggleDesignPopup(active = true) {
    $('.design-popup')[active ? 'addClass' : "removeClass"]('active');
    if (active && window.innerWidth < 786 && !$('.design-popup .categories').hasClass('active'))
        $('.design-popup .categories').addClass("active");

}

// Load Items & Categories
$(document).ready(async function () {
    let categories = '',
        panels = '',
        $popup = $('.design-popup');
    console.log(DESIGNS)
    for (let i = 0; i < DESIGNS.length; i++) {
        let { icon, title, color, items } = DESIGNS[i],
            id = getRand(10),
            panelItems = '';

        categories += `<div class="single-category" data-target="${id}" style="background:${color}">
                            <img src="./images/media/categories/${icon}" alt="">
                            <div class="title">${title}</div>
                        </div>`;


        // Loop
        for (let j = 0; j < items.length; j++) {
            let name = items[j],
                src = `./images/media/designs/${name}`;

            await loadImage(src);

            panelItems += `<div class="single-design" data-name="${name}">
                                <img src="${src}" alt="">
                            </div>`
        }

        panels += `<div class="single-panel" id="${id}">${panelItems}</div>`
    }


    $popup.find(".categories").html(categories);
    $popup.find(".panels").append(panels);
    $('.design-popup .categories .single-category').first().trigger("click");
});


// Show Popup on category click
$(document).on("click", ".design-popup .categories .single-category", function () {
    let id = $(this).attr("data-target"),
        $panel = $(`.design-popup .panels .single-panel#${id}`);
    $('.design-popup .panels .single-panel').removeClass('active');
    $panel.addClass('active');
    $(this).parents(".categories").removeClass("active");

});

// Add single design
$(document).on("click", ".design-popup .panels .single-panel .single-design", async function () {
    let name = $(this).attr('data-name'),
        src = `./images/media/designs/${name}`,
        img = await loadImage(src),
        obj = await AddItemToEditor({
            type: "image",
            src,
            design: true
        });

    applyMaxWidthAndHeight(obj, img.width, img.height);

    obj.scaleToWidth(canvas.width / 3);
    AlignObject('center', obj);
    canvas.renderAll();
    toggleDesignPopup(false);
    showObjPropsNav(obj);
});