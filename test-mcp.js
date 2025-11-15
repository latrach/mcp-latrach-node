#!/usr/bin/env node

/**
 * Script de test simple pour vérifier la logique du serveur MCP
 * (sans communication stdio)
 */

// Simuler l'appel de l'outil calculate
function testCalculate(expression) {
  // Validation (comme dans le code)
  if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
    throw new Error('Expression invalide. Utilisez uniquement des nombres et opérateurs mathématiques.');
  }
  
  // Calcul (comme dans le code)
  const result = Function(`"use strict"; return (${expression})`)();
  return `Résultat: ${result}`;
}

// Test
console.log('🧪 Test de l\'outil calculate:');
console.log('');

const tests = [
  '5+5',
  '10 * 2',
  '100 / 4',
  '(5 + 5) * 2',
  '15 - 7'
];

tests.forEach(expr => {
  try {
    const result = testCalculate(expr);
    console.log(`✅ ${expr} = ${result}`);
  } catch (error) {
    console.log(`❌ ${expr} = Erreur: ${error.message}`);
  }
});

console.log('');
console.log('📝 Pour tester avec le serveur MCP réel:');
console.log('   1. Redémarrez Cursor');
console.log('   2. Dans le chat, demandez: "Calcule 5+5 en utilisant l\'outil calculate"');

