type Component = {
  componentName: string;
}
type ComponentType = 'o' | 'm' | 'a'

type GenerateComponent = {
  projectPrefix: string;
  type: ComponentType;
  isNeedScript?: boolean;
  isNeedStyle?: boolean;
} & Component;

type GenerateComponentScript = {} & Component;

type GenerateTemplate = {} & Component;

type GeneratePage = {
  isUsingPageStoryTemplate: boolean
} & Component

type GenerateData = {} & Component;


type GenerateType = {
  type: ComponentType;
} & Component;

type GenerationConfig = {
  componentName: string;
  type: ComponentType;
  projectPrefix: string;
  style?: boolean;
  script?: boolean;
  state?: boolean;
  page?: boolean;
  story?: boolean;
  data?: boolean;
  properties?: Array<{ name: string; type: string }>;
  compose?: string[];
  componentDirectory?: string;
  pageDirectory?: string;
  templateDirectory?: string;
  dataDirectory?: string;
  typeDirectory?: string;
  scriptDirectory?: string;
};

type FileResult = {
  path: string;
  action: 'created' | 'appended' | 'skipped';
};

type GenerationResult = {
  componentName: string;
  type: ComponentType;
  files: FileResult[];
};

export { GenerateComponent, GenerateTemplate, GeneratePage, GenerateData, GenerateType, ComponentType, GenerateComponentScript, GenerationConfig, GenerationResult, FileResult }