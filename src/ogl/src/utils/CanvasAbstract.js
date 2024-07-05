import { Vec2 } from '../math/Vec2.js';

let Anchor = function (x, y) {
    this.x = x || 0;
    this.y = y || 0;
    this.h0;
    this.h1;
};

export function CanvasAbstractShapes(w, h, palette) {
    this.W = w || 100;
    this.H = h || 100;
    this.size = this.W > this.H ? this.H : this.W;

    this.shapes = [];
    this.palette = palette;

    this.canvas2d = document.createElement('CANVAS');
    this.canvas2d.width = this.W;
    this.canvas2d.height = this.H;
    this.canvas2d.style.display = 'none';
    document.body.appendChild(this.canvas2d);

    this.ctx = this.canvas2d.getContext('2d');
}

CanvasAbstractShapes.prototype.colors = function (palette) {
    this.palette = palette;

    for (let i = 0; i < this.shapes.length; i++) {
        this.shapes[i].colors = [palette[i + 1], palette[i + 2]];
    }
};

CanvasAbstractShapes.prototype.reset = function (rng) {
    this.shapes = []

    for (let i = 0; i < 4; i++) {
        let ix = i % 2;
        let iy = Math.floor(i / 2);

        let offset = Math.floor((ix + iy) % 2) == 0 ? 0.5 : 1;

        let x = (ix - 1 / 2) * this.W * offset;
        let y = (iy - 1 / 2) * this.H * offset;

        let num = Math.floor(rng() * (6 - 3) + 3);

        let index_0 = (i % 6) + 0;
        let index_1 = (i % 6) + 1 > 5 ? 0 : (i % 6) + 1;

        let colors = [this.palette[index_0], this.palette[index_1]];

        let abshape = new Shape(this.ctx, x, y, this.W, this.H, num, this.size / 3, colors, rng);

        this.shapes.push(abshape);
    }

    this.draw();
};

CanvasAbstractShapes.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.W, this.H);

    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.H);
    gradient.addColorStop(0, this.palette[0]);
    gradient.addColorStop(1, this.palette[1]);
    this.ctx.fillStyle = gradient;
    this.ctx.globalAlpha = 0.4;
    this.ctx.fillRect(0, 0, this.W, this.H);

    this.shapes.forEach((shape) => {
        shape.draw(this.ctx);
    });
};

CanvasAbstractShapes.prototype.destroy = function () {
    document.body.removeChild(this.canvas2d);
};

CanvasAbstractShapes.prototype.getCanvasData = function () {
    this.canvasdata = this.canvas2d.toDataURL('image/png');
    return this.canvasdata;
};

// ---------------------------------------------

function Shape(context, x, y, w, h, num, radius, colors, rng) {
    this.x = x;
    this.y = y;
    this.W = w;
    this.H = h;

    this.colors = colors;

    this.rng = rng;

    this.num = num || 3;
    this.radius = radius || 100;

    this.basePoints = [];
    this.anchors = [];

    this.makeBaseShape(num, radius);
    this.makeAllAnchors();
    this.makeAllBezierCurves(0.5);
    // this.draw(context);
    // this.drawHelpers(context, { basePoints: true });
}

Shape.prototype.makeBaseShape = function (num, radius) {
    let dAngle = (Math.PI * 2) / num;

    for (let i = 0; i < num; i++) {
        let start = (i + 0.2) * dAngle;
        let end = (i + 1 - 0.2) * dAngle;
        // let ran_A = randomBetween(start, end, false);
        let ran_A = this.rng() * (end - start) + start;
        let a = new Anchor(radius * Math.cos(ran_A), radius * Math.sin(ran_A));

        this.basePoints.push(a);
    }
};

Shape.prototype.makeAllAnchors = function () {
    // 首先，拿到所有边的法向数据
    let normals = determineNormalDirections(this.basePoints);

    for (let i = 0; i < this.basePoints.length; i++) {
        let p_this = i;
        let p_next = i == this.basePoints.length - 1 ? 0 : i + 1;

        let ex = -normals[i].x * 1;
        let ey = -normals[i].y * 1;

        let p_1 = new Anchor(this.basePoints[p_this].x + ex, this.basePoints[p_this].y + ey);
        let p_2 = new Anchor(this.basePoints[p_next].x + ex, this.basePoints[p_next].y + ey);

        this.anchors.push(this.basePoints[p_this], p_1, p_2);
    }
};

Shape.prototype.makeAllBezierCurves = function (ratio) {
    for (let i = 0, l = this.anchors.length; i < l; i++) {
        // 首先计算 i 点相邻两点之间的距离
        let anchor = this.anchors[i];
        let last = i === 0 ? this.anchors[l - 1] : this.anchors[i - 1];
        let next = i === l - 1 ? this.anchors[0] : this.anchors[i + 1];

        // 然后计算当前 i 点左右两个把手 hand 的坐标
        let dx = ((last.x - next.x) * ratio) / 2;
        let dy = ((last.y - next.y) * ratio) / 2;
        let hand_0 = new Vec2(anchor.x + dx, anchor.y + dy);
        let hand_1 = new Vec2(anchor.x - dx, anchor.y - dy);
        anchor.h0 = hand_0;
        anchor.h1 = hand_1;
    }
};

Shape.prototype.draw = function (context) {
    const ctx = context;

    ctx.save();
    ctx.translate(this.W / 2 + this.x, this.H / 2 + this.y);

    ctx.beginPath();
    ctx.moveTo(this.anchors[0].x, this.anchors[0].y);

    for (let i = 0; i < this.anchors.length; i++) {
        if (i == this.anchors.length - 1) {
            ctx.bezierCurveTo(
                this.anchors[i].h1.x,
                this.anchors[i].h1.y,
                this.anchors[0].h0.x,
                this.anchors[0].h0.y,
                this.anchors[0].x,
                this.anchors[0].y
            );
        } else {
            ctx.bezierCurveTo(
                this.anchors[i].h1.x,
                this.anchors[i].h1.y,
                this.anchors[i + 1].h0.x,
                this.anchors[i + 1].h0.y,
                this.anchors[i + 1].x,
                this.anchors[i + 1].y
            );
        }
    }
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, this.H / 2, 0);
    gradient.addColorStop(0, this.colors[0]);
    gradient.addColorStop(1, this.colors[1]);

    ctx.globalAlpha = 0.6;
    // ctx.globalCompositeOperation = 'color-burn';
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();
};

Shape.prototype.drawHelpers = function (context, obj) {
    const ctx = context;

    if (obj.anchors) {
        for (let i = 0; i < this.anchors.length; i++) {
            let a = this.anchors[i];
            ctx.fillStyle = '#f00';
            ctx.fillText('0', a.h0.x, a.h0.y);
            ctx.fillText('1', a.h1.x, a.h1.y);
        }
    }
    if (obj.baseShape) {
        // 整体直角形状
        ctx.beginPath();
        ctx.moveTo(this.anchors[0].x, this.anchors[0].y);
        for (let i = 0; i < this.anchors.length; i++) {
            if (i == this.anchors.length - 1) {
                ctx.lineTo(this.anchors[0].x, this.anchors[0].y);
            } else {
                ctx.lineTo(this.anchors[i + 1].x, this.anchors[i + 1].y);
            }
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.fill();
    }
    if (obj.basePoints) {
        // 各个Base点
        console.log(this);
        for (let i = 0; i < this.basePoints.length; i++) {
            ctx.save();
            ctx.fillStyle = '#000';
            ctx.translate(this.W / 2 + this.x, this.H / 2 + this.y);
            ctx.fillRect(this.basePoints[i].x - 5, this.basePoints[i].y - 5, 5, 5);
            ctx.fillText(i, this.basePoints[i].x + 5, this.basePoints[i].y + 5);
            ctx.restore();
        }
    }
};

// --------------------------------------------------------
function calculateNormalVector(start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    return [
        { x: dy, y: -dx },
        { x: -dy, y: dx },
    ];
}

function normalizeVector(vector) {
    // const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y)
    // return { x: vector.x / length, y: vector.y / length }
    return { x: vector.x, y: vector.y };
}

function isNormalFacingOutwards(edgeStart, normal, centroid) {
    const vectorToCentroid = { x: centroid.x - edgeStart.x, y: centroid.y - edgeStart.y };
    const dotProduct = normal.x * vectorToCentroid.x + normal.y * vectorToCentroid.y;
    return dotProduct > 0;
}

function determineNormalDirections(points) {
    // 计算重心
    const centroid = points.reduce(
        (acc, point) => ({
            x: acc.x + point.x / points.length,
            y: acc.y + point.y / points.length,
        }),
        { x: 0, y: 0 }
    );

    const normals = points.map((start, i) => {
        const end = points[(i + 1) % points.length];
        const [normal1, normal2] = calculateNormalVector(start, end);
        const isNormal1Outwards = isNormalFacingOutwards(start, normal1, centroid);
        const chosenNormal = isNormal1Outwards ? normal1 : normal2;
        return normalizeVector(chosenNormal);
    });

    return normals;
}
