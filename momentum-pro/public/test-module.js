// This is a test JavaScript module
export const testModule = {
  name: 'Test Module',
  version: '1.0.0',
  timestamp: new Date().toISOString(),
  
  sayHello() {
    return `Hello from ${this.name} v${this.version}!`;
  }
};

export function testFunction() {
  return 'Module function is working correctly!';
}

// Log that the module was loaded
console.log('Test module loaded successfully!');