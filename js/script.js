$(document).ready(function() {

    var mmToPxRatio = 3;
    var depthDefault = 500;

    var width = $("input[name='width']");
    var depth = $("input[name='depth']");
    var sections = $("input[name='sections']");
    var curve = $("input[name='curve']");
    var length = $("input[name='radiator-length']");
    var select = $("select");
    var drawingWidth = $("#drawing").parent().width();
    var drawingHeight = 1000 / mmToPxRatio;

    var draw = SVG('drawing').size(drawingWidth, drawingHeight);

    var radiators = [{
            name: '4 Column 460mm',
            length: 61,
            imageURL: 'images/radiators/4-column-460mm.png'
        },
        {
            name: 'Duchess 590mm',
            length: 71,
            imageURL: 'images/radiators/duches-590mm.png'
        }
    ]

    radiators.forEach(function(r, i) {
        select.append($("<option/>").text(r.name).val(i));
    });

    var radiator = radiators[0];

    select.val(0);

    select.material_select();

    function startX() {
        return ((drawingWidth - getWidth()) / 2);
    }

    function startY() {
        return (getCurveType() == 'internal') ? getDepth() : 50;
    }

    function getWidth() {
        return parseInt(width.val() / mmToPxRatio);
    }

    function getDepth() {
        return parseInt(depth.val() / mmToPxRatio);
    }

    function getMaxSections(width) {
        return parseInt(width / radiator.length);
    }

    function getArrowPath(width = 10, height = 10) {
        return draw.path('M 50,5 95,97.5 5,97.5 z').size(width, height);
    }

    function getDiagonalLinesPattern() {
        var pattern = draw.pattern(4, 4, function(add) {
            add.path('M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2').stroke({
                width: 0.5,
                color: '#000'
            });
        });

        return pattern;
    }

    function getCurveType() {
        return $("input[name='curve']:checked").val();
    }

    function renderPath(w = getWidth(), d = getDepth()) {
        var path = draw.path()

        if (getCurveType() == 'external') {

            path.M(startX(), startY()).c({
                x: 0,
                y: 0
            }, {
                x: w / 2,
                y: d
            }, {
                x: w,
                y: 0
            }).fill(getDiagonalLinesPattern())

            // Depth line
            renderDepthLines(draw, path.pointAt(w / 2).y, w, d, true);

        } else {
            path.M(startX(), startY()).c({
                x: 0,
                y: 0
            }, {
                x: w / 2,
                y: d * (-1)
            }, {
                x: w,
                y: 0
            }).fill('#fff')

            // Depth line
            renderDepthLines(draw, path.pointAt(w / 2).y, w, d, false);
        }

        if (d) {
            var peak = path.pointAt(w / 2).y

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

        draw.text(function(add) {
            add.tspan("DEPTH (CAMBER)").newLine();
            add.tspan("DIMENSION B").newLine();
        }).font({
            size: 12
        }).center(startX() / 2, (startY() + peak) / 2);
    }

    function renderRadiator(path, sections, w = getWidth()) {

        var rw = (radiator.length / mmToPxRatio);
        var rh = 36;
        var center = (path.length()/2);

        if (sections%2 == 0) {
            center -= (rw/5) * 2;
        }

        for (var i = 0; i < sections; i++) {

            var section = draw.image(radiator.imageURL, rw, rh);

            if (i%2 == 0) {
                c = path.pointAt(center - ((i/2) * rw));
            } else {
                c = path.pointAt(center + ((i - Math.floor(i/2)) * rw));
            }

            section.move(c.x - rw/2, c.y + 10);
        }
    }

    function render() {
        draw.clear();

        draw.rect(drawingWidth, startY()).fill(getDiagonalLinesPattern());
        draw.line(0, startY(), drawingWidth, startY()).stroke({
            color: '#000',
            width: 1
        })

        renderRadiator(renderPath(), sections.val());
    }

    function renderRadiatorPreview (sections) {
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

    depth.on('change', render);
    depth.on('change', render);

    width.on('change', function() {
        var maxSection = getMaxSections($(this).val());

        if (sections.val() > maxSection) {

            if (maxSection > 10) {
                sections.val(maxSection);
            } else {
                sections.val(10);
            }

            renderRadiatorPreview(sections.val());
        }

        render();
    });

    sections.on('change', function() {
        var radiatorLength = $(this).val() * radiator.length;
        var minWidth = radiatorLength + 120;

        if (width.val() < minWidth) {
            width.val(minWidth);
        }

        length.val(radiatorLength);

        render();
        renderRadiatorPreview(sections.val());
    });

    select.on('change', function() {
        radiator = radiators[$(this).val()];
        render();
    })

    $("#curved-cb").on('change', function() {
        if ($(this).prop('checked')) {
            $("#curved-form").removeClass('hide');
            $("#drawing").removeClass('hide');
            $(".instructions").removeClass('hide');
            depth.val(depthDefault);
            render();
        } else {
            $("#curved-form").addClass('hide');
            $(".instructions").addClass('hide');
            $("#drawing").addClass('hide');
            depth.val(0);
            render();
        }
    });

    curve.on('change', function() {
        if (getCurveType() == 'internal') {
            $("#instructions-internal").removeClass('hide');
            $("#instructions-external").addClass('hide');
        } else {
            $("#instructions-internal").addClass('hide');
            $("#instructions-external").removeClass('hide');
        }

        render();
    });

    length.on('change', function() {
        var s = Math.floor($(this).val() / radiator.length)
        sections.val(s);
        renderRadiatorPreview(s);
    })

    length.val(sections.val() * radiator.length);

    //render();
    renderRadiatorPreview(sections.val());

});
