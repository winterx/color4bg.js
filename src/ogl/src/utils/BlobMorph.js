import { Vec3 } from '../math/Vec3.js';

export function BlobMorph(x, y, z, radius) {
    this.anchor = new Vec3(x, y, z);
    this.effectradius = radius;
    this.map = new Map();
    this.posAttribute = null;

    this.surround = function (geometry) {
        this.posAttribute = geometry.getPosition();

        let distance;

        for (let i = 0, length = this.posAttribute.count; i < length; i++) {
            const index = i % 100;

            let vertex = new Vec3(this.posAttribute.getX(i), this.posAttribute.getY(i), this.posAttribute.getZ(i));

            distance = vertex.distance(this.anchor);

            if (distance < this.effectradius) {
                let factor = distance / this.effectradius;

                // let weight = 1 - factor * factor * ( 3 - 2*factor );
                let weight = ((1 / (Math.sqrt(2 * 3.14) * 0.25)) * Math.exp((-factor * factor) / (2 * 0.25 * 0.25))) / 1.6;

                this.map.set(i, weight);
            }
        }
    };

    this.moveTo = function (target_x, target_y, target_z) {
        let position = this.posAttribute;

        if (this.anchor.x === target_x && this.anchor.y === target_y && this.anchor.z === target_z) {
            return;
        }

        let dx = target_x - this.anchor.x;
        let dy = target_y - this.anchor.y;
        let dz = target_z - this.anchor.z;

        this.map.forEach(function (value, index, mapObj) {
            let currentx = position.getX(index);
            let currenty = position.getY(index);
            let currentz = position.getZ(index);

            if (value > 0.001) {
                position.setXYZ(index, currentx + dx * value, currenty + dy * value, currentz + dz * value);
            }
        });

        // geometry.computeVertexNormals();

        this.anchor.set(target_x, target_y, target_z);
    };
}
