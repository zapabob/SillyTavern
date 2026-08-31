import express from 'express';
import multer from 'multer';

import { UPLOAD_LIMITS } from '../src/upload-limits.js';

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
