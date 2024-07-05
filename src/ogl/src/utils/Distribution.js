export class Distribution {
    constructor(W, H, seed) {
        this.rand = new Math.seedrandom(seed);
        this.times = 4; // 递归 4 次
        this.order = 0; // 计数用来改变切割方向
        this.divides = []; // 总共有 15 次分割
        this.selection = [3, 4, 6, 7, 10, 11, 13, 14];
        this.result = [];

        let rect_0 = new Rect(0, 0, W, H, this.order++);

        this.divide(rect_0, this.times);

        for (let i = 0; i < this.selection.length; i++) {
            let sel = this.selection[i];
            let pair = this.divides[sel];

            pair.forEach((p) => {
                let obj = {
                    x: p.x - W / 2,
                    y: H / 2 - p.y,
                    w: p.w,
                    h: p.h,
                };

                obj.pos_x = obj.x + obj.w / 2;
                obj.pos_y = obj.y - obj.h / 2;

                this.result.push(obj);
            });
        }
    }

    divide(rect, times) {
        let middle;
        let a, b;

        switch (rect.direction % 4) {
            case 0:
                // middle = Math.floor(rect.w * 0.618)
                middle = Math.floor(rect.w * (0.618 + (this.rand() * 0.3 - 0.15)));
                a = new Rect(rect.x, rect.y, middle, rect.h, this.order++);
                b = new Rect(rect.x + middle, rect.y, rect.w - middle, rect.h, this.order++);
                break;

            case 1:
                // middle = Math.floor(rect.h * 0.618)
                middle = Math.floor(rect.h * (0.618 + (this.rand() * 0.3 - 0.15)));
                a = new Rect(rect.x, rect.y, rect.w, middle, this.order++);
                b = new Rect(rect.x, rect.y + middle, rect.w, rect.h - middle, this.order++);
                break;

            case 2:
                // middle = Math.floor(rect.w * 0.382)
                middle = Math.floor(rect.w * (0.382 + (this.rand() * 0.3 - 0.15)));
                a = new Rect(rect.x, rect.y, middle, rect.h, this.order++);
                b = new Rect(rect.x + middle, rect.y, rect.w - middle, rect.h, this.order++);
                break;

            case 3:
                // middle = Math.floor(rect.h * 0.382)
                middle = Math.floor(rect.h * (0.382 + (this.rand() * 0.3 - 0.15)));
                a = new Rect(rect.x, rect.y, rect.w, middle, this.order++);
                b = new Rect(rect.x, rect.y + middle, rect.w, rect.h - middle, this.order++);
                break;
        }

        this.divides.push([a, b]);

        times--;

        let t1 = times - 0;
        let t2 = times - 0;

        if (times > 0) {
            this.divide(a, t1);
            this.divide(b, t2);
        }
    }
}

class Rect {
    constructor(x, y, w, h, d) {
        this.x = x;
        this.y = y;
        this.w = w;
        (this.h = h), (this.direction = d);
    }

	draw(ctx) {
		// ctx.fillStyle = `hsl( ${ Math.random() * 360 }, 100%, 50% )`
		// ctx.fillStyle = `rgba( 0, 255, 0, 0.2 )`
		ctx.strokeStyle = `rgba(255, 255, 255, 1 )`
		ctx.lineWidth = 4
		ctx.strokeRect(this.x, this.y, this.w, this.h)
		ctx.fillRect(this.x, this.y, this.w, this.h)
	}
}
