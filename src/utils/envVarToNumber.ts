export const envVarToNumber = (value: string | undefined, defaultValue: number = 0): number => {
    const numberValue = Number(value);
  
    if (Number.isNaN(numberValue)) {
      return defaultValue;
    }
  
    return numberValue;
  };