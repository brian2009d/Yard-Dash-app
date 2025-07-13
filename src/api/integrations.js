// This is a mock implementation for standalone deployment.
// These functions will not actually work but will prevent build errors.

const mockIntegration = (name) => async (params) => {
  console.log(`Mock integration "${name}" called with:`, params);
  alert(`The "${name}" integration is not available in this standalone deployment.`);
  throw new Error(`The "${name}" integration is not available.`);
};

// Export each function individually to match the original structure
export const InvokeLLM = mockIntegration('InvokeLLM');
export const SendEmail = mockIntegration('SendEmail');
export const UploadFile = mockIntegration('UploadFile');
export const GenerateImage = mockIntegration('GenerateImage');
export const ExtractDataFromUploadedFile = mockIntegration('ExtractDataFromUploadedFile');

// Also export the 'Core' object, as the original file did
export const Core = {
  InvokeLLM,
  SendEmail,
  UploadFile,
  GenerateImage,
  ExtractDataFromUploadedFile,
};
