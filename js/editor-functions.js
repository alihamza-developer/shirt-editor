// Add Item To Editor
function AddItemToEditor(item, properties = {}, options = {}) {
    return new Promise(async (resolve, rej) => {

        let shape = 0,
            { src, type, fileType } = item,
            id = getRand(30);
        if (!fileType) fileType = type;
        // Item class
        if (!item.class) {
            let itemClasses = {
                'svg': 'shape'
            },
                itemClass = fileType in itemClasses ? itemClasses[fileType] : fileType;
            item.class = itemClass;
        }

        properties.id = id;
        properties.name = item.type;
        item.id = id;
        item.fileType = fileType;
        properties.options = options;
        properties.originalItem = item;
        properties.centeredScaling = true; // Center Scaling
        properties.dirty = true;

        // Load SVG
        if (fileType == "svg") {
            properties = {
                ...properties,
            };

            fabric.loadSVGFromURL(src, function (objects, options) {
                obj = fabric.util.groupSVGElements(objects, options);
                // add svg icon
                obj.set(properties).setCoords();
                if (!options.beforeRender) obj.scaleToWidth(200);

                // Add item to Editor
                canvas.add(obj);
                addItemToEditorCallback(id);
                resolve(obj);
            });

        } else if (fileType == "text") {
            properties = {
                fontFamily: 'sans-serif',
                fill: '#262626',
                erasable: false,
                editable: false,
                textAlign: 'center',
                ...properties,
            };
            // Set Text
            shape = new fabric.Text(src, properties);
            canvas.add(shape);
            addItemToEditorCallback(id);
            shape.saveState();
            return resolve(shape);
        } else if (fileType == "image") {
            fabric.Image.fromURL(src, function (img) {
                img.set(properties);
                let { maxWidth, maxHeight } = properties;

                applyMaxWidthAndHeight(img, maxWidth, maxHeight);
                // Add item to Editor
                canvas.add(img);
                addItemToEditorCallback(id);
                return resolve(img);
            });
        }
    });
}

// Text Wrap
function textWrap(obj) {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = `${obj.fontSize}px ${obj.fontFamily}`;
    const metrics = ctx.measureText(obj.text),
        height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    obj.set("height", height);
    // obj.setCoords();
    canvas.renderAll();
    canvas.requestRenderAll();
}

// Apply Max Width and Height
function applyMaxWidthAndHeight(obj, maxWidth, maxHeight, loading = false) {
    if (maxWidth && maxHeight) {

        // Not loading time
        if (!loading) {
            obj.set("maxWidth", maxWidth);
            obj.set("maxHeight", maxHeight);
            if (maxWidth > canvas.width || maxHeight > canvas.height) {
                const ratio = getRatio(maxWidth, maxHeight),
                    boundedWidth = Math.min(maxWidth, canvas.width),
                    boundedHeight = Math.min(maxHeight, canvas.height),
                    scaledHeight = getMissingValue({ width: boundedWidth }, ratio);

                if (scaledHeight <= canvas.height)
                    obj.scaleToWidth(boundedWidth);
                else
                    obj.scaleToHeight(boundedHeight);

            } else {
                obj.scaleToWidth(maxWidth);
                obj.scaleToHeight(maxHeight);
            }
            canvas.renderAll();
        }

        // Check if scaling event is not alreay appliend
        let events = obj.hasOwnProperty("__eventListeners"),
            scaling = events ? obj.__eventListeners.hasOwnProperty("scaling") : false;

        if (scaling) return true;

        let maxScaleX = maxWidth / obj.width,
            maxScaleY = maxHeight / obj.height;
        // On Scaling
        obj.on('scaling', function () {
            if (this.scaleX > maxScaleX) {
                this.scaleX = maxScaleX;
                this.left = this.lastGoodLeft ? this.lastGoodLeft : obj.left;
                this.top = this.lastGoodTop ? this.lastGoodTop : obj.top;
                showErrorMsg(true);
            } else showErrorMsg(false);

            if (this.scaleY > maxScaleY) {
                this.scaleY = maxScaleY;
                this.left = this.lastGoodLeft ? this.lastGoodLeft : obj.left;
                this.top = this.lastGoodTop ? this.lastGoodTop : obj.top;
                showErrorMsg(true);
            } else {
                showErrorMsg(false)
            }

            this.lastGoodTop = this.top;
            this.lastGoodLeft = this.left;
        });
        canvas.renderAll();
    }
}

// add layers, etc of editor object
function addItemToEditorCallback(objId) {
    let obj = getObjById(objId);
    if (!obj) return false;
    let options = obj.options || {},
        centerObject = "centerObject" in options ? options.centerObject : true,
        selected = "selected" in options ? options.selected : true;
    // Before Render Callback
    if (options.beforeRender) options.beforeRender(obj);

    // center object
    if (centerObject) AlignObject('center', obj);


    // Make obj active
    if (selected) obj.erasable = false;

    canvas.setActiveObject(obj);
    // Render canvas
    canvas.renderAll();
}

// Get canvas object by id
function getObjById(id) {
    let targetObject = null;
    canvas._objects.forEach(obj => {
        if (targetObject) return true;
        if (obj.id == id) targetObject = obj;

        else if (obj._objects) {
            let groupObj = obj._objects.find(object => object.id == id);
            if (groupObj) targetObject = groupObj;
        }
    });
    return targetObject;
}

// Objects Selection Created
canvas.on("selection:created", function (e) {
    createdAndUpdatedProp(e);
});

// Objects Selection Updated
canvas.on("selection:updated", function (e) {
    createdAndUpdatedProp(e);
});

// selection updated
canvas.on("selection:cleared", function () {
    createdAndUpdatedProp();
});

// Block flipX and flipY
canvas.on('object:scaling', function (e) {
    let obj = e.target;
    obj.setCoords();
    obj.set({
        flipX: false,
        flipY: false
    });
    obj.setCoords();

    if (obj.type == 'curved-text') {
        obj.refreshCtx(true);
        obj._updateObj('scaleX', obj.scaleX);
        obj._updateObj('scaleY', obj.scaleY);
    }
});

// Created And Updated Prop
function createdAndUpdatedProp() {
    hideAllPositioningLines();
    let obj = canvas.getActiveObject(),
        TEXT_TYPES = ['text', 'i-text', 'curved-text'];

    $('.editing-mode, .sidebar .items').removeClass("active");

    if (obj) {
        let type = obj.type;
        showObjPropsNav(obj);

        if (TEXT_TYPES.includes(type)) {

            $('.editing-mode[data-type="text"]').addClass("active");
            if (IS_MOBILE) {
                $('.sidebar .items[data-type="text"]').addClass('active');
            }


            // Text and curve text Input Fill
            $('.text-edit-inp').val(obj.text);
            if (obj.type == 'curved-text') {
                let range = getRangeFromPercentage(obj.percentage);
                $('#text-curve-range').val(range);
                obj.refreshCtx(true);
                obj._updateObj('scaleX', obj.scaleX);
                obj._updateObj('scaleY', obj.scaleY);
            } else
                $('#text-curve-range').val(2500);

            return false;
        }
    }
    $('.editing-mode[data-type="shirt"]').addClass("active");
}

// check if image file
function isImageFile(file) {
    let allowedExt = ['jpg', 'png', 'jpeg'];
    let ext = file.name.split('.').pop().toLowerCase();
    if (allowedExt.includes(ext)) {
        return true;
    } else {
        return false;
    }
}

// Show Obj Props Nav
function showObjPropsNav(obj, moving = false) {
    const $cnObjPropsNav = $('.cn-obj-props-nav');
    if (!obj) {
        $cnObjPropsNav.removeClass("active");
        return false;
    }
    if (!moving)
        $cnObjPropsNav.addClass("active");

    let offset = $('.canvas-container').offset(),
        x = offset.left + (obj.left * canvas.getZoom()),
        y = offset.top + (obj.top * canvas.getZoom());
    x -= 50;
    $cnObjPropsNav.css({
        left: x + "px",
        top: y + "px"
    });

}

// Calculate Image Dims
function calculateImageDims(img) {
    const MIN_RESOLUTION_PER_CM = 100,
        REAL_PRINTABLE_AREA_WIDTH_CM = pxToCm(SHIRT_DATA.printArea.width),
        REAL_PRINTABLE_AREA_HEIGHT_CM = pxToCm(SHIRT_DATA.printArea.height),
        PRINT_AREA_WIDTH = canvas.width,
        PRINT_AREA_HEIGHT = canvas.height;

    let USER_IMAGE_MAX_WIDTH_IN_AREA_PX = (img.width / MIN_RESOLUTION_PER_CM) * PRINT_AREA_WIDTH / REAL_PRINTABLE_AREA_WIDTH_CM,
        USER_IMAGE_MAX_HEIGHT_IN_AREA_PX = (img.height / MIN_RESOLUTION_PER_CM) * PRINT_AREA_HEIGHT / REAL_PRINTABLE_AREA_HEIGHT_CM;

    return {
        width: USER_IMAGE_MAX_WIDTH_IN_AREA_PX,
        height: USER_IMAGE_MAX_HEIGHT_IN_AREA_PX
    }

}

// Get Shirt width & height
function getShirtDims() {
    let $area = $('.preview-area .image img');

    return {
        width: $area.width(),
        height: $area.height()
    };
}

// Get Active Color 
function getActiveColor() {
    let $parent = $(".editing-mode[data-type='shirt']"),
        $color = $parent.find('.colors-con .list .single-color.active'),
        color = $color.attr("data-color");
    let { name, src } = EDITOR.shirt.colors[color];

    return {
        name,
        src,
        code: color
    }
}