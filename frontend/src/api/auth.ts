export const login = async (email: string, password: string) => {
  // simulación
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === "test@test.com" && password === "1234") {
        resolve({ access_token: "fake-token-123" });
      } else {
        reject("Error");
      }
    }, 1000);
  });
};