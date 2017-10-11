$(document).ready(function() {
    $('select').material_select();

    var mmToPxRatio = 3;
    var depthDefault = 250;

    var width = $("input[name='width']");
    var depth = $("input[name='depth']");
    var sections = $("input[name='sections']");
    var curve = $("input[name='curve']");
    var drawingWidth = $("#drawing").width();
    var drawingHeight = 1000/mmToPxRatio;

    var draw = SVG('drawing').size(drawingWidth, drawingHeight);

    var radiator = {
        length: 60
    }

    function startX() {
        return ((drawingWidth - getWidth())/2);
    }

    function startY() {
        return (getCurveType() == 'internal') ? getDepth() : 50;
    }

    function getWidth() {
        return parseInt(width.val()/mmToPxRatio);
    }

    function getDepth() {
        return parseInt(depth.val()/mmToPxRatio);
    }

    function getMaxSections(width) {
        return parseInt(width / radiator.length);
    }

    function getArrowPath(width = 10, height = 10) {
        return draw.path('M 50,5 95,97.5 5,97.5 z').size(width, height);
    }

    function getDiagonalLinesPattern() {
        var pattern = draw.pattern(4, 4, function(add) {
            add.path('M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2').stroke({ width: 0.5, color: '#000' });
        });

        return pattern;
    }

    function getCurveType() {
        return $("input[name='curve']:checked").val();
    }

    function renderPath(w = getWidth(), d = getDepth()) {
        var path = draw.path()
        // d = 200/mmToPxRatio;
        // var r = (Math.pow(d, 2) + Math.pow(w/2, 2)) / (2*d);
        // var l = r + Math.sqrt(Math.pow(r, 2) - Math.pow(w/2, 2));

        if (getCurveType() == 'external') {

            // draw.circle(5).move(startX() + w/2, startY() + d).fill('red');

            // var p = `M ${startX()} ${startY()} A ${startX() + w/2} ${startY() + 1150} 0 0 0 ${startX() + w} ${startY()}`;

            // console.log(p, w, d, r, l);

            // draw.path(p).fill(getDiagonalLinesPattern()).front();
            path.M(startX(), startY()).c(
                {x:0 , y:0},
                {x:w/2 , y:d},
                {x:w , y:0}
            ).fill(getDiagonalLinesPattern())

            // Depth line
            renderDepthLines(draw, path.pointAt(w/2).y, w, d, true);

        } else {
            path.M(startX(), startY()).c(
                {x:0 , y:0},
                {x:w/2 , y:d * (-1)},
                {x:w , y:0}
            ).fill('#fff')

            // Depth line
            renderDepthLines(draw, path.pointAt(w/2).y, w, d, false);

        }

        // draw.line(startX()-20, startY(), startX()-20, startY() + d).stroke({
        //     color: 'red',
        //     width: 1
        // })

        // path.stroke({
        //     color: '#000',
        //     width: 1
        // }).front();

        if (d) {
            var peak = path.pointAt(w/2).y

            // Left size line
            draw.line(startX(), startY(), startX(), startY() + peak).stroke({
                color: '#000',
                width: 1
            });

            // Right size line
            draw.line(startX()+w, startY(), startX()+w, startY() + peak).stroke({
                color: '#000',
                width: 1
            });

            getArrowPath().move(startX() - 5, startY() + peak).rotate(180);
            getArrowPath().move(startX()+w - 5, startY() + peak).rotate(180);

            // Width line
            var horizontal = draw.line(startX(), startY() + peak + 10, startX()+w, startY() + peak + 10).stroke({
                color: '#000',
                width: 1
            });

            getArrowPath().move(startX(), startY() + peak +5).rotate(-90);
            getArrowPath().move(startX()+w-10, startY() + peak +5).rotate(90);

            draw.text("WIDTH (CHORD) DIMENSION A").font({
                size: 12
            }).center(drawingWidth/2, startY() + peak+20);

        }

        return path;
    }

    function renderDepthLines(draw, peak, w, d, reverseArrows = false) {
        if (!d) return false;

        draw.line(startX()-20, peak, startX()+w+20, peak).stroke({
            color: '#000',
            width: 1
        }).front();

        draw.line(startX()-20, peak, startX()-20, startY()).stroke({
            color: '#000',
            width: 1
        });

        if (reverseArrows) {
            getArrowPath().move(startX()-25, peak -10).rotate(180);
            getArrowPath().move(startX()-25, startY());
        } else {
            getArrowPath().move(startX()-25, peak);
            getArrowPath().move(startX()-25, startY() -10).rotate(180);
        }

        draw.text(function(add){
            add.tspan("DEPTH (CAMBER)").newLine();
            add.tspan("DIMENSION B").newLine();
        }).font({
            size: 12
        }).center(startX()/2, (startY()+peak)/2);
    }

    function renderRadiator(path, sections, w = getWidth()) {

        for (var i = 1; i <= sections; i++) {

            var rw = (radiator.length/mmToPxRatio);
            var rh = 36;

            var section = draw.image('images/section-small.png', rw, rh)
            var centerMove = (w-rw*sections)/2;
            var pos = path.pointAt((rw * i) + centerMove);

            section.move((drawingWidth - getWidth())/2 + ((rw * i) + centerMove - rw), parseInt(pos.y) + 10);

            // var A = Math.abs(w/2 - pos.x);
            // var B = pos.y;
            // var C = Math.sqrt(A*A + B*B);
            // var sinA = Math.sin(A/C);
            // var angle = (sinA * 180 / Math.PI);
            // angle *= 0.5; //smoth the angle
            // if (pos.x > w/2) angle = 180 - angle;
            // section.rotate(angle);
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

    depth.on('change', render);
    depth.on('change', render);

    width.on('change', function () {
        var maxSection = getMaxSections($(this).val());

        if (sections.val() > maxSection) {
            if (maxSection > 10) {
                sections.val(maxSection);
            } else {
                sections.val(10);
            }
        }

        render();
    });

    sections.on('change', function () {
        var minWidth = $(this).val() * radiator.length + 120;

        if (width.val() < minWidth) {
            width.val(minWidth);
        }

        render();
    });

    $("#curved-cb").on('change', function () {
        if ($(this).prop('checked')) {
            $("#curved-form").removeClass('hide');
            depth.val(depthDefault);
            render();
        } else {
            $("#curved-form").addClass('hide');
            depth.val(0);
            render();
        }
    });

    curve.on('change', function () {
        if (getCurveType() == 'internal') {
            $("#instructions-internal").removeClass('hide');
            $("#instructions-external").addClass('hide');
        } else {
            $("#instructions-internal").addClass('hide');
            $("#instructions-external").removeClass('hide');
        }

        render();
    })

    render();

});
