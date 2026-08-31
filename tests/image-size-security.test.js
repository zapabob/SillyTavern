import { imageSize } from '../src/image-size.js';

const blockedImageCases = [
    ['ICNS', Buffer.from([0x69, 0x63, 0x6e, 0x73, 0, 0, 0, 8])],
    ['JXL', Buffer.from([0xff, 0x0a, 0, 0, 0, 0, 0, 0])],
    ['HEIF', Buffer.from([0, 0, 0, 16, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63, 0, 0, 0, 0])],
];

for (const [name, buffer] of blockedImageCases) {
    test(`${name} parsing is disabled before untrusted buffers reach image-size`, () => {
        expect(() => imageSize(buffer)).toThrow();
    });
}
