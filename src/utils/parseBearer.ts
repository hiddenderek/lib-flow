export const parseBearer = (bearer: string) => {
    const [_, token] = bearer.trim().split(" ");
    return token;
  };