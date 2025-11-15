#!/usr/bin/env node

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 80;

// Middleware
app.use(cors());
app.use(express.json());

// Handlers des outils

// Outil: greet
async function handleGreet(name: string) {
  return {
    content: [
      {
        type: 'text',
        text: `Bonjour, ${name}! Comment allez-vous aujourd'hui?`,
      },
    ],
  };
}

// Outil: calculate
async function handleCalculate(expression: string) {
  // Sécurité: validation basique de l'expression
  if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
    throw new Error('Expression invalide. Utilisez uniquement des nombres et opérateurs mathématiques.');
  }
  const result = Function(`"use strict"; return (${expression})`)();
  return {
    content: [
      {
        type: 'text',
        text: `Résultat: ${result}`,
      },
    ],
  };
}

// Routes

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'mcp-latrach-node',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Liste des outils disponibles
app.get('/tools', (req: Request, res: Response) => {
  res.json({
    tools: [
      {
        name: 'greet',
        description: 'Salue une personne avec son nom',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Le nom de la personne à saluer',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'calculate',
        description: 'Effectue un calcul mathématique simple',
        inputSchema: {
          type: 'object',
          properties: {
            expression: {
              type: 'string',
              description: 'Expression mathématique à évaluer (ex: "2 + 2", "10 * 5")',
            },
          },
          required: ['expression'],
        },
      },
    ],
  });
});

// Appel d'un outil
app.post('/tools/:toolName', async (req: Request, res: Response) => {
  const { toolName } = req.params;
  const args = req.body;

  try {
    let result;

    switch (toolName) {
      case 'greet': {
        if (!args.name || typeof args.name !== 'string') {
          return res.status(400).json({
            error: 'Le paramètre "name" est requis et doit être une chaîne de caractères',
          });
        }
        result = await handleGreet(args.name);
        break;
      }

      case 'calculate': {
        if (!args.expression || typeof args.expression !== 'string') {
          return res.status(400).json({
            error: 'Le paramètre "expression" est requis et doit être une chaîne de caractères',
          });
        }
        result = await handleCalculate(args.expression);
        break;
      }

      default:
        return res.status(404).json({
          error: `Outil inconnu: ${toolName}`,
        });
    }

    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    res.status(500).json({
      error: errorMessage,
      isError: true,
    });
  }
});

// Liste des ressources disponibles
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

// Lire une ressource
app.get('/resources/:uri', (req: Request, res: Response) => {
  const { uri } = req.params;
  const decodedUri = decodeURIComponent(uri);

  if (decodedUri === 'example://info') {
    return res.json({
      contents: [
        {
          uri: decodedUri,
          mimeType: 'text/plain',
          text: `Serveur MCP Latrach Node
Version: 1.0.0
Statut: Opérationnel
Timestamp: ${new Date().toISOString()}`,
        },
      ],
    });
  }

  res.status(404).json({
    error: `Ressource non trouvée: ${decodedUri}`,
  });
});

// Route racine
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

// Gestion des erreurs
app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
  console.error('[HTTP Error]', err);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: err.message,
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur MCP HTTP démarré sur le port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Liste des outils: http://localhost:${PORT}/tools`);
  console.log(`📚 Liste des ressources: http://localhost:${PORT}/resources`);
});

