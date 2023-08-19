export const generateUserErrorInfo = (user) => {
  const requiredProperties = [
    { name: 'first_name', value: user.first_name },
    { name: 'last_name', value: user.last_name },
    { name: 'email', value: user.email },
  ];

  const errorInfo = requiredProperties
    .filter((prop) => !prop.value)
    .map((prop) => `- ${prop.name}: Missing to complete the field`);

  return `
  One or more fields are incomplete or invalid.
  List of required fields:
        ${errorInfo.join('\n')}
    `;
};

export const generateProductErrorInfo = product => {
  return `Uno o más properties están incompletos o no son válidos.
  Lista de properties válidos:
      - title: Must be a string (${product.title})
      - description: Must be a string (${product.description})
      - code: Must be a string (${product.code})
      - price: Must be a number (${product.price})
      - stock: Must be a number (${product.stock})
      - category: Must be a string (${product.category})
  `
}