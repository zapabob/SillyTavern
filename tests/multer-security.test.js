import express from 'express';
import multer from 'multer';

import { UPLOAD_LIMITS } from '../src/upload-limits.js';

test('multipart files have a finite limit aligned with the body budget', () => {
    expect(Number.isSafeInteger(UPLOAD_LIMITS.fileSize)).toBe(true);
    expect(UPLOAD_LIMITS.fileSize).toBeGreaterThan(0);
    expect(UPLOAD_LIMITS.fileSize).toBe(UPLOAD_LIMITS.fieldSize);
});

test('multipart files larger than the configured limit are rejected', async () => {
    const app = express();
    const limits = { ...UPLOAD_LIMITS, fileSize: 8 };
    app.post('/', multer({ limits }).single('avatar'), (_request, response) => {
        response.sendStatus(204);
    });
    const server = app.listen(0, '127.0.0.1');

    try {
        await new Promise(resolve => server.once('listening', resolve));
        const address = server.address();
        const form = new FormData();
        form.append('avatar', new Blob([new Uint8Array(9)]), 'avatar.bin');
        const response = await fetch(`http://127.0.0.1:${address.port}/`, {
            method: 'POST',
            body: form,
        });

        expect(response.status).toBe(500);
    } finally {
        await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }
});

test('multipart fields deeper than the configured limit are rejected', async () => {
    const app = express();
    app.post('/', multer({ limits: UPLOAD_LIMITS }).single('avatar'), (_request, response) => {
        response.sendStatus(204);
    });
    const server = app.listen(0, '127.0.0.1');

    try {
        await new Promise(resolve => server.once('listening', resolve));
        const address = server.address();
        const form = new FormData();
        form.append('a[b][c][d][e][f][g]', 'value');
        const response = await fetch(`http://127.0.0.1:${address.port}/`, {
            method: 'POST',
            body: form,
        });

        expect(response.status).toBe(500);
    } finally {
        await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }
});
