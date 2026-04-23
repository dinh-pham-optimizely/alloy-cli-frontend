import { GenerationConfig, GenerationResult, FileResult } from '../types';
import { getTypeFullText } from './helpers';
import { readDetailedModelRegistry } from './scanner';
import { resolveComposition, CompositionResult } from './composer';
import {
  generateComponent,
  generateComponentData,
  generateComponentScript,
  generateComponentState,
  generateComponentStyle,
  generateComponentType,
  generatePageComponent,
  generateTemplateComponent,
} from './generators';

const PASCAL_CASE_REGEX = /^[A-Z][a-zA-Z0-9]*$/;

const validateComponentName = (name: string): void => {
  if (!PASCAL_CASE_REGEX.test(name)) {
    throw new Error(
      `Component name must be PascalCase (e.g., ProductCard, Button). Got: "${name}"`,
    );
  }
};

const resolveDefaults = (config: GenerationConfig): Required<Omit<GenerationConfig, 'style' | 'script' | 'state' | 'page' | 'story' | 'data'>> & GenerationConfig => {
  return {
    ...config,
    componentDirectory: config.componentDirectory ?? getTypeFullText(config.type),
    pageDirectory: config.pageDirectory ?? 'pages',
    templateDirectory: config.templateDirectory ?? 'templates',
    dataDirectory: config.dataDirectory ?? '_data',
    typeDirectory: config.typeDirectory ?? '_types',
    scriptDirectory: config.scriptDirectory ?? 'assets/scripts',
  };
};

const executeGeneration = async (inputConfig: GenerationConfig): Promise<GenerationResult> => {
  validateComponentName(inputConfig.componentName);

  const config = resolveDefaults(inputConfig);
  const files: FileResult[] = [];

  const addResult = (result: FileResult | null) => {
    if (result) files.push(result);
  };

  // Resolve composition from registry if --compose is specified
  let composition: CompositionResult | undefined;
  if (config.compose && config.compose.length > 0) {
    const registry = readDetailedModelRegistry(process.cwd());
    composition = resolveComposition(config.compose, registry);
  }

  // 1. Type definition (always — appended)
  addResult(
    await generateComponentType({
      componentName: config.componentName,
      type: config.type,
      typeDirectory: config.typeDirectory,
      properties: config.properties,
    }),
  );

  // 2. State file (optional)
  if (config.state) {
    addResult(
      await generateComponentState({
        componentName: config.componentName,
        type: config.type,
        projectPrefix: config.projectPrefix,
      }),
    );
  }

  // 3. Style file (optional)
  if (config.style) {
    addResult(
      await generateComponentStyle({
        componentName: config.componentName,
        type: config.type,
        projectPrefix: config.projectPrefix,
      }),
    );
  }

  // 4. Script file (optional)
  if (config.script) {
    addResult(
      generateComponentScript({
        componentName: config.componentName,
        scriptDirectory: config.scriptDirectory,
      }),
    );
  }

  // 5. Page component (optional)
  if (config.page) {
    addResult(
      await generatePageComponent({
        componentName: config.componentName,
        isUsingPageStoryTemplate: config.story ?? false,
        pageDirectory: config.pageDirectory,
      }),
    );

    // 6. Template component (auto-created when page is requested)
    addResult(
      await generateTemplateComponent({
        componentName: config.componentName,
        templateDirectory: config.templateDirectory,
      }),
    );
  }

  // 7. Data file (optional)
  if (config.data) {
    addResult(
      await generateComponentData({
        componentName: config.componentName,
        dataDirectory: config.dataDirectory,
        properties: config.properties,
      }),
    );
  }

  // 8. Component file (always — last)
  addResult(
    await generateComponent({
      componentName: config.componentName,
      projectPrefix: config.projectPrefix,
      type: config.type,
      isNeedScript: config.script,
      isNeedStyle: config.style,
      componentDirectory: config.componentDirectory,
      composition,
    }),
  );

  return {
    componentName: config.componentName,
    type: config.type,
    files,
  };
};

export { executeGeneration, validateComponentName, resolveDefaults };
