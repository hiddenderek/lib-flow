export const parseToken = (tokenVal: string) => {
    console.log(tokenVal)
    if ( tokenVal.includes('Bearer') ) {
      const [_, token] = tokenVal.trim().split(" ");
      return token;
    }
  };