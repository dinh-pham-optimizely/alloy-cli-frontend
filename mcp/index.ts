import { StdioServerTransport } from '@modelcontextprotocol/server';
import server from './server';
import './tools';

export async function startMcpServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
