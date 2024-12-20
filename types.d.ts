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

export { GenerateComponent, GenerateTemplate, GeneratePage, GenerateData, GenerateType, ComponentType, GenerateComponentScript }