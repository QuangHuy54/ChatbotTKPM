const truncate = (input: string, maxLength: number = 14) => input.length > maxLength ? `${input.substring(0, maxLength)}...` : input;

export default truncate