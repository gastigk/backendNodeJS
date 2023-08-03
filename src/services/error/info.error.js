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

export const errorMessagesProductosMocking = {
  invalidFields: 'One or more fields are invalid.',
  missingFields: 'One or more fields are required and were not provided.',
  notFound: 'The requested resource was not found.',
  internalServerError: 'Error server.',
};
