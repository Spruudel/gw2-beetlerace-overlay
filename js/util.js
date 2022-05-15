const deg_to_rad = (deg) => (deg * Math.PI) / 180.0;

// input: h in [0,360] and s,v in [0,1] - output: r,g,b in [0,1]
function hsv_to_rgb(h, s, v) {
    let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [f(5), f(3), f(1)];
}

function rgb_to_hex(rgb) {
    const [r, g, b] = rgb;
    return Math.floor(r * 255) * Math.pow(16, 4) + Math.floor(g * 255) * Math.pow(16, 2) + Math.floor(b * 255);
}

const GOLDEN_RATIO_CONJUGATE = 0.618033988749895;
const COLOR_BASE_VAL = Math.random();
function get_distinct_color(n) {
    let hue = (COLOR_BASE_VAL + n * GOLDEN_RATIO_CONJUGATE) % 1;
    return rgb_to_hex(hsv_to_rgb(hue * 360, 0.65, 0.85));
}

const distance_3d = (p1, p2) => vec_length_3d([p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]]);

const vec_length_3d = (v) => Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2) + Math.pow(v[2], 2));
