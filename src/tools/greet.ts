export async function run({ name }: { name: string }) {
  return {
    content: [
      {
        type: 'text',
        text: `Bonjour, ${name}! Comment allez-vous aujourd'hui?`,
      },
    ],
  };
}

export function meta() {
  return {
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
  };
}
