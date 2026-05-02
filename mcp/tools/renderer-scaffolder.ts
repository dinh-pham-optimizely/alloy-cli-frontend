import server from '../server';
import { z } from 'zod';
import { renderTemplates } from '../../lib/renderers';
import { appendContentToFile, createFile, createFolder, resolvePathForFileType, shouldWrite } from '../../lib/helpers';

server.registerTool(
  'renderer-scaffolder',
  {
    description: 'Render templates and write all requested files in a single call',
    inputSchema: z.object({
      componentName: z.string(),
      type: z.enum(['a', 'm', 'o']),
      projectPrefix: z.string(),
      fileTypes: z.array(z.enum(['component', 'template', 'page', 'page-story', 'data', 'type', 'style', 'state'])),
      isNeedScript: z.optional(z.boolean()),
      isNeedStyle: z.optional(z.boolean()),
      directories: z.optional(
        z.object({
          component: z.string().describe('Component directory'),
          type: z.string().describe('Type directory'),
          page: z.string().describe('Page directory'),
          template: z.string().describe('Template directory'),
          data: z.string().describe('Data directory'),
          script: z.string().describe('Script directory'),
          style: z.string().describe('Style directory'),
          state: z.string().describe('State directory'),
        })
      ),
      force: z.optional(z.boolean()),
    }),
  },
  async ({ componentName, type, projectPrefix, fileTypes, isNeedScript, isNeedStyle, directories, force }) => {
    const created = [];
    const skipped = [];
    const failed = [];
    let status = 'OK';

    for (const fileType of fileTypes) {
      const { directoryPath, filePath } =
      resolvePathForFileType({
        componentName,
        type,
        fileType,
        directories,
      }) || {};

      try {
        const template = await renderTemplates({
          componentName,
          type,
          projectPrefix,
          fileType,
          isNeedScript,
          isNeedStyle,
        });

        if (fileType === 'type' && filePath && shouldWrite(filePath, false)) {
          appendContentToFile(filePath, template);
        } else if (!filePath || !directoryPath) {
          failed.push({ fileType, path: filePath, reason: 'could not resolve file path' });
        } else if (shouldWrite(filePath, force)) {
          createFolder(directoryPath);
          createFile(filePath, template);
          created.push({ path: filePath, fileType, action: 'created' });
        } else {
          skipped.push({ path: filePath, reason: 'file already exists' });
        }
      } catch(error) {
        failed.push({ fileType, path: filePath, reason: (error as Error).message });
      }
    }

    if (created.length > 0 && failed.length > 0) {
      status = 'PARTIAL';
    } else if (created.length === 0) {
      status = 'FAIL';
    }

    const response = {
      status,
      created,
      skipped,
      failed,
    };

    return {
      content: [{ type: 'text', text: JSON.stringify(response) }],
    };
  }
);
