$(document).ready(function () {

    var mmToPxRatio = 3;
    var width = $("input[name='width']");
    var depth = $("input[name='depth']");
    var sections = $("input[name='sections']");
    var curve = $("input[name='curve']");
    var length = $("input[name='radiator-length']");
    var select = $("select");
    var drawingWidth = $("#drawing").parent().width();
    // var drawingHeight = 500 / mmToPxRatio;
    var valvesLength = 100;

    var draw = SVG('drawing');

    var radiators = [{
            name: '3 Column',
            length: 61,
            imageURL: 'images/radiators/4-column-460mm.png',
            minSections: 22
        },
        {
            name: '4 Column',
            length: 71,
            imageURL: 'images/radiators/duches-590mm.png',
            minSections: 29
        }
    ]

    radiators.forEach(function (r, i) {
        select.append($("<option/>").text(r.name).val(i));
    });

    var radiator = radiators[0];

    select.val(0);

    select.material_select(); 

    function startX() {
        return ((drawingWidth - getWidth()) / 2);
    }

    function startY() {
        return getDepth() + 20;
    }

    function getWidth() {
        return parseInt(width.val() / mmToPxRatio);
    }

    function getDepth() {
        return parseInt(depth.val() / mmToPxRatio);
    }

    function getMaxSections(width) {
        return parseInt(width - valvesLength / radiator.length);
    }

    function getArrowPath(width = 10, height = 10) {
        return draw.path('M 50,5 95,97.5 5,97.5 z').size(width, height);
    }

    function getDiagonalLinesPattern() {
        var pattern = draw.pattern(4, 4, function (add) {
            add.path('M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2').stroke({
                width: 0.5,
                color: '#000'
            });
        });

        return pattern;
    }

    function getRadius(w = getWidth(), d = getDepth()) {
        return parseInt((Math.pow(d, 2) + Math.pow(w / 2, 2)) / (2 * d));
    }

    function renderPath(w = getWidth(), d = getDepth()) {
        var radius = getRadius(w, d)
        var path = draw.path(`M ${startX()} ${startY()} A ${radius} ${radius} 0 0 1 ${startX() + w} ${startY()}`).fill('#fff');

        // Depth line
        renderDepthLines(draw, path.pointAt(path.length() / 2).y, w, d, false);

        if (d) {

            var peak = path.pointAt(path.length() / 2).y

            // Left size line
            draw.line(startX(), startY(), startX(), startY() + peak).stroke({
                color: '#000',
                width: 1
            });

            // Right size line
            draw.line(startX() + w, startY(), startX() + w, startY() + peak).stroke({
                color: '#000',
                width: 1
            });

            getArrowPath().move(startX() - 5, startY() + peak).rotate(180);
            getArrowPath().move(startX() + w - 5, startY() + peak).rotate(180);

            // Width line
            var horizontal = draw.line(startX(), startY() + peak + 10, startX() + w, startY() + peak + 10).stroke({
                color: '#000',
                width: 1
            });

            getArrowPath().move(startX(), startY() + peak + 5).rotate(-90);
            getArrowPath().move(startX() + w - 10, startY() + peak + 5).rotate(90);

            draw.text("WIDTH (CHORD) DIMENSION A").font({
                size: 12
            }).center(drawingWidth / 2, startY() + peak + 20);

        }

        return path;
    }

    function renderDepthLines(draw, peak, w, d, reverseArrows = false) {
        if (!d) return false;

        draw.line(startX() - 20, peak, startX() + w + 20, peak).stroke({
            color: '#000',
            width: 1
        }).front();

        draw.line(startX() - 20, peak, startX() - 20, startY()).stroke({
            color: '#000',
            width: 1
        });

        if (reverseArrows) {
            getArrowPath().move(startX() - 25, peak - 10).rotate(180);
            getArrowPath().move(startX() - 25, startY());
        } else {
            getArrowPath().move(startX() - 25, peak);
            getArrowPath().move(startX() - 25, startY() - 10).rotate(180);
        }

        draw.text(function (add) {
            add.tspan("DEPTH (CAMBER)").newLine();
            add.tspan("DIMENSION B").newLine();
        }).font({
            size: 12
        }).center(startX() / 2, (startY() + peak) / 2);
    }

    function renderRadiator(path, sections, w = getWidth()) {

        var rw = parseInt(radiator.length / mmToPxRatio);
        var rh = 36;
        var center = path.length() / 2;
        var p = 0;

        if (sections % 2 == 0) {
            center -= (rw / 5) * 2;
        }

        for (var i = 0; i < sections; i++) {

            var section = draw.image(radiator.imageURL, rw, rh);

            if (i % 2 == 0) {
                p = center - ((i / 2) * rw);
            } else {
                p = center + ((i - Math.floor(i / 2)) * rw);
            }

            c = path.pointAt(parseInt(p));

            section.center(c.x, c.y + 20);
        }
    }

    function render() {
        draw.size(drawingWidth, (parseInt(depth.val()) + 200) / mmToPxRatio);
        draw.clear();

        if (getDepth() > 0) {
            draw.rect(drawingWidth, startY()).fill(getDiagonalLinesPattern());
            renderRadiator(renderPath(), sections.val());
        }
    }

    function renderRadiatorPreview(sections) {
        var list = $("#radiator-placeholder ul").empty();
        var left = $("<li/>").append($("<img/>").attr("src", "images/radiators/left-leg.jpg"));
        var right = $("<li/>").append($("<img/>").attr("src", "images/radiators/right-leg.jpg"));

        var mids = sections - 2;

        list.append(left);

        for (var i = 0; i < mids; i++) {
            list.append($("<li/>").append($("<img/>").attr("src", "images/radiators/mid-section.jpg")));
        }

        list.append(right);
    }

    function init() {       
        sections.change();
        renderRadiatorPreview(sections.val());
    }

    depth.on('change', function () {

        if ($(this).attr('max') !== undefined && $(this).attr('max') < $(this).val()) {
            $(this).val($(this).attr('max'));
        }

        if ($(this).attr('max') == undefined && getRadius() < $(this).val()) {
            $(this).val(getRadius());
        }

        render();
    });

    length.on('change', function () {
        var s = Math.floor($(this).val() / radiator.length)
        sections.val(s);
        renderRadiatorPreview(s);
    });

    width.on('change', function () {
        var maxSection = getMaxSections($(this).val());

        if (sections.val() > maxSection) {

            if (maxSection > 10) {
                sections.val(maxSection);
            } else {
                sections.val(10);
            }

            renderRadiatorPreview(sections.val());
        }

        depth.attr('max', getRadius());

        render();
    });

    sections.on('change', function () {

        if ($(this).val() > 40) {
            $(this).val(40);
        }

        if ($(this).attr('min') !== undefined && $(this).attr('min') > $(this).val()) {
            $(this).val($(this).attr('min'));
        }

        var radiatorLength = $(this).val() * radiator.length;
        var minWidth = radiatorLength + valvesLength;

        if (width.val() < minWidth) {
            width.val(minWidth);
        }

        length.val(minWidth);
        depth.attr('max', getRadius());

        render();
        renderRadiatorPreview(sections.val());
    });

    select.on('change', function () {
        radiator = radiators[$(this).val()];
        sections.attr('min', radiator.minSections).change();

        if (sections.val() < radiator.minSections) {
            sections.val(radiator.minSections);
        }
        render();
    });

    $("#curved-cb").on('change', function () {
        if ($(this).prop('checked')) {
            $("#curved-form").removeClass('hide');
            $(".instructions").removeClass('hide');
            $("#drawing").removeClass('hide');
            sections.val(radiator.minSections).attr('min', radiator.minSections).change();
            render();
        } else {
            $("#curved-form").addClass('hide');
            $(".instructions").addClass('hide');
            $("#drawing").addClass('hide');
            render();
        }
    });

    init();
});