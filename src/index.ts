#!/usr/bin/env node

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Suppression des imports statiques, chargement dynamique des outils
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Initialisation asynchrone des outils
const tools: Record<string, (args: any) => Promise<any>> = {};
const toolsMeta: any[] = [];
async function loadTools() {
    const toolsDir = path.join(__dirname, 'tools');
    const toolFiles = fs
        .readdirSync(toolsDir)
        .filter(
            (f) =>
                (f.endsWith('.js') || f.endsWith('.ts')) &&
                !f.endsWith('.d.ts') &&
                !f.endsWith('.d.js')
        );
    for (const file of toolFiles) {
        const modulePath = path.join(toolsDir, file);
        const toolModule = await import(modulePath);
        if (typeof toolModule.run === 'function' && typeof toolModule.meta === 'function') {
            const meta = toolModule.meta();
            tools[meta.name] = toolModule.run;
            toolsMeta.push(meta);
        }
    }
}

app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        service: 'mcp-latrach-node',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

app.get('/tools', (req: Request, res: Response) => {
    res.json({ tools: toolsMeta });
});

app.post('/tools/:toolName', async (req: Request, res: Response) => {
    const { toolName } = req.params;
    const args = req.body;
    const tool = tools[toolName];
    if (!tool) {
        return res.status(404).json({ error: `Outil inconnu: ${toolName}` });
    }
    try {
        const result = await tool(args);
        res.json(result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        res.status(500).json({ error: errorMessage, isError: true });
    }
});

app.get('/resources', (req: Request, res: Response) => {
    res.json({
        resources: [
            {
                uri: 'example://info',
                name: 'Informations du serveur',
                description: 'Informations sur le serveur MCP',
                mimeType: 'text/plain',
            },
        ],
    });
});

app.get('/resources/:uri', (req: Request, res: Response) => {
    const { uri } = req.params;
    const decodedUri = decodeURIComponent(uri);
    if (decodedUri === 'example://info') {
        return res.json({
            contents: [
                {
                    uri: decodedUri,
                    mimeType: 'text/plain',
                    text: `Serveur MCP Latrach Node\nVersion: 1.0.0\nStatut: Opérationnel\nTimestamp: ${new Date().toISOString()}`,
                },
            ],
        });
    }
    res.status(404).json({ error: `Ressource non trouvée: ${decodedUri}` });
});

app.get('/', (req: Request, res: Response) => {
    res.json({
        service: 'mcp-latrach-node',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            tools: '/tools',
            callTool: 'POST /tools/:toolName',
            resources: '/resources',
            readResource: 'GET /resources/:uri',
        },
    });
});

app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
    console.error('[HTTP Error]', err);
    res.status(500).json({ error: 'Erreur interne du serveur', message: err.message });
});

// Charger les outils puis démarrer le serveur
loadTools().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Serveur MCP HTTP démarré sur le port ${PORT}`);
        console.log(`📍 Health check: http://localhost:${PORT}/health`);
        console.log(`📋 Liste des outils: http://localhost:${PORT}/tools`);
        console.log(`📚 Liste des ressources: http://localhost:${PORT}/resources`);
    });
});
