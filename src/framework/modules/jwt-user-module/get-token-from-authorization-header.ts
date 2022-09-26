/** Given (Koa) headers, extract bearer token */
export const getTokenFromAuthorizationHeader = (headers: Record<string, string|string[]>): string | null => 
	(/^Bearer\s(.+)$/gmi).exec(headers?.authorization as string)?.[1]?.trim() || null

