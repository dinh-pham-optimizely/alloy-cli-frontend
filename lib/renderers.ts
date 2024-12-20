import { GenerateComponent, GenerateData, GeneratePage, GenerateTemplate, GenerateType } from "../types";
import {
  getComponentAsCamelCase,
  getComponentAsCapCaseWithSpacing,
  getComponentAsKebabCase,
  getComponentDataName,
  getComponentModelName,
  getComponentPageName,
  getComponentTemplateName
} from "./helpers";

const renderComponentContent = ({
  componentName,
  projectPrefix,
  type,
  isNeedScript,
  isNeedStyle,
}: GenerateComponent) =>
  {
    const componentModelName = getComponentModelName(componentName);
    const componentNameKebabCase = getComponentAsKebabCase(componentName);

    return `import { ${componentModelName} } from '@_types/types';
import { getModifiers } from '@helpers/functions';${isNeedScript ? `\nimport RequireJs from '@helpers/RequireJs';` : ''}${isNeedStyle
      ? `\nimport RequireCss from '@helpers/RequireCss';`
      : ''}

const ${componentName} = (model: ${componentModelName}) => {
  const styleModifier = getModifiers(model, '${projectPrefix}-${type}-${componentNameKebabCase}');

  return (
    <div className={styleModifier}>
    ${isNeedScript ?
      `\n      <RequireJs path={'${componentNameKebabCase}'} defer />` : ''}${isNeedStyle
      ?
      `\n      <RequireCss path={'b-${componentNameKebabCase}'} />`
      : ''}
    </div>
  );
}

export default ${componentName};
`
  };

const renderTemplateComponent = ({ componentName }: GenerateTemplate) =>
  {
    const componentTemplateName = getComponentTemplateName(componentName);
    const componentModelName = getComponentModelName(componentName);
    const componentDataName = getComponentDataName(componentName);
    const componentNameKebabCase = getComponentAsKebabCase(componentName);

    return `import { ${componentModelName} } from '@_types/types';
import ${componentName} from '@organisms/${componentNameKebabCase}/${componentName}';

interface Props {
  ${componentDataName}?: ${componentModelName};
}

export const ${componentTemplateName} = (model: Props) => {
  const { ${componentDataName} } = model;

  return (
    <>
      <main>
        <${componentName} {...${componentDataName}} />
      </main>
    </>
  );
}

export default ${componentTemplateName};
`
  };

const renderPageComponent = ({ componentName, isUsingPageStoryTemplate }: GeneratePage) =>
  {
    const componentTemplateName = getComponentTemplateName(componentName);
    const componentDataName = getComponentDataName(componentName);
    const componentNameKebabCase = getComponentAsKebabCase(componentName);
    const componentPageName = getComponentPageName(componentName);
    const componentNameCamelCase = getComponentAsCamelCase(componentName);

    if (isUsingPageStoryTemplate) {
      return `import { Story, StoryCollectionMeta } from '@_types/types';
import { ${componentTemplateName} } from '@templates/${componentNameKebabCase}/${componentTemplateName}';

export default {
  $$name: '${componentName}',
  $$path: '${componentNameCamelCase}',
} as StoryCollectionMeta;

export const default${componentPageName}: Story = {
  name: '${getComponentAsCapCaseWithSpacing(componentName)} - Default',
  path: 'default',
  render: () => {
    return <${componentTemplateName} ${componentDataName}={${componentDataName}} />;
  },
};
`
    }

    return `import { ${componentDataName} } from '@data/${componentNameKebabCase}';
import { ${componentTemplateName} } from '@templates/${componentNameKebabCase}/${componentName}';

const ${componentPageName} = () => {
  return <${componentTemplateName} ${componentDataName}={${componentDataName}} />;
};

export default ${componentPageName};
`
  };

const renderComponentData = ({ componentName }: GenerateData) =>
  {
    const componentModelName = getComponentModelName(componentName);
    const componentDataName = getComponentDataName(componentName);

    return `import { ${componentModelName} } from '@_types/types';

const ${componentDataName}: ${componentModelName} = {};

export { ${componentDataName} };
`
  };

const renderComponentType = ({ componentName }: GenerateType) =>
  {
    const componentModelName = getComponentModelName(componentName);

    return `\ninterface ${componentModelName} extends BasedAtomicModel {
}\n`
  };

const renderComponentStyle = (
  { componentName, type, projectPrefix }: GenerateComponent
) =>
  {
    return `.${projectPrefix}-${type}-${getComponentAsKebabCase(componentName)} {
}`
  };

const renderComponentState = ({ componentName, projectPrefix, type }: GenerateComponent) =>
  {
    return `{
  "name": "${getComponentAsCapCaseWithSpacing(componentName)}",
  "selector": ".${projectPrefix}-${type}-${getComponentAsKebabCase(componentName)}",
  "button": {
    "zIndex": 0,
    "styleModifier": ""
  },
  "states": []
}`
  }

export {
  renderTemplateComponent,
  renderComponentContent,
  renderPageComponent,
  renderComponentData,
  renderComponentType,
  renderComponentStyle,
  renderComponentState
};
