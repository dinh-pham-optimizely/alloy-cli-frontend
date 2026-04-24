import server from '../server';
import { z } from 'zod';
import {
  renderComponentContent,
  renderComponentData,
  renderComponentState,
  renderComponentStyle,
  renderComponentType,
  renderPageComponent,
  renderTemplateComponent,
} from '../../lib/renderers';

server.registerTool(
  'render_files',
  {
    title: 'Render files',
    description: 'Return ready-to-write file content from templates',
    inputSchema: z.object({
      componentName: z.string().describe('Name of the component to scaffold (e.g., "HeroBanner")'),
      type: z.enum(['a', 'm', 'o']).describe('Component type e.g., "a" for atoms, "m" for molecules, "o" for organisms'),
      projectPrefix: z.string().describe('CSS prefix e.g. xx (for BEM class names like "xx-hero-banner")'),
      fileType: z.enum(['component', 'template', 'page', 'page-story', 'data', 'type', 'style', 'state']).describe('Type of file to render'),
      isNeedScript: z.boolean().describe('Whether the file needs a script (for components)'),
      isNeedStyle: z.boolean().describe('Whether the file needs a style (for components)'),
    }),
  },
  async ({ componentName, type, fileType, projectPrefix, isNeedScript, isNeedStyle }) => {
    let content = '';

    switch (fileType) {
      case 'component':
        content = await renderComponentContent({
          componentName,
          projectPrefix,
          type,
          isNeedScript,
          isNeedStyle,
        });
        break;

      case 'template':
        content = await renderTemplateComponent({ componentName });
        break;

      case 'page':
        content = await renderPageComponent({ componentName, isUsingPageStoryTemplate: false });
        break;

      case 'page-story':
        content = await renderPageComponent({ componentName, isUsingPageStoryTemplate: true });
        break;

      case 'type':
        content = await renderComponentType({ componentName, type });
        break;

      case 'data':
        content = await renderComponentData({ componentName });
        break;

      case 'state':
        content = await renderComponentState({ componentName, projectPrefix, type });
        break;

      case 'style':
        content = await renderComponentStyle({ componentName, type, projectPrefix });
        break;
      default:
        break;
    }

    return {
      content: [
        {
          type: 'text',
          text: content,
        },
      ],
    };
  }
);
