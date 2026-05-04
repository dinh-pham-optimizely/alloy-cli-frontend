type Component = {
  componentName: string;
};
type ComponentType = 'o' | 'm' | 'a';

type GenerateComponent = {
  projectPrefix: string;
  type: ComponentType;
  isNeedScript?: boolean;
  isNeedStyle?: boolean;
} & Component;

type GenerateTemplate = {} & Component;

type GeneratePage = {
  isUsingPageStoryTemplate: boolean;
} & Component;

type GenerateData = {} & Component;

type GenerateType = {
  type: ComponentType;
} & Component;

interface FileCategory {
  name: string;
  description: string;
  files: { src: string; dest: string }[];
}

type Directories = {
  component: string;
  type: string;
  page: string;
  template: string;
  data: string;
  script: string;
};

type Path = {
  directoryPath: string;
  filePath: string;
  fileExists: boolean;
};

type TemplatePaths = {
  component: Path;
  template: Path;
  page: Path;
  data: Path;
  type: Path;
  script: Path;
  style: Path;
  state: Path;
};

interface ModelRegistry {
  atoms: string[];
  molecules: string[];
  organisms: string[];
}

interface ValidationResult {
  [key: string]: {
    pass: boolean;
    message: string;
  } | undefined;
}

export {
  GenerateComponent,
  GenerateTemplate,
  GeneratePage,
  GenerateData,
  GenerateType,
  ComponentType,
  GenerateComponentScript,
  FileCategory,
  Directories,
  TemplatePaths,
  Path,
  ModelRegistry,
  ValidationResult,
};
