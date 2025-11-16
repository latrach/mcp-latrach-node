export async function run({ expression }: { expression: string }) {
    if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
        throw new Error(
            'Expression invalide. Utilisez uniquement des nombres et opérateurs mathématiques.'
        );
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

export function meta() {
    return {
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
    };
}
