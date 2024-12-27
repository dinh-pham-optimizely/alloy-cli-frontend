import {
  getComponentAsCamelCase,
  getComponentAsCapCaseWithSpacing,
  getComponentAsKebabCase,
  getComponentDataName,
  getComponentModelName,
  getComponentPageName,
  getComponentTemplateName,
  getTemplatePath,
  getTypeFullText,
  replaceComponentTextVariants,
  replaceTemplateComments,
  turnPascalCaseToCamelCase,
  turnPascalCaseToCapCaseWithSpacing,
  turnPascalCaseToKebabCase,
} from '../lib/helpers';
import path from 'node:path';


describe('test componentName getters', () =>
{
  const componentName = 'TestComponent';

  test('getComponentModelName should return correct value', () =>
  {
    const result = getComponentModelName(componentName);

    expect(result).toBe(`TestComponentModel`);
  });

  test('getComponentAsKebabCase should return correct value', () =>
  {
    const result = getComponentAsKebabCase(componentName);

    expect(result).toBe(`test-component`);
  });

  test('getComponentTemplateName should return correct value', () =>
  {
    const result = getComponentTemplateName(componentName);

    expect(result).toBe(`TestComponentTemplate`);
  });

  test('getComponentAsCamelCase should return correct value', () =>
  {
    const result = getComponentAsCamelCase(componentName);
    expect(result).toBe('testComponent');
  });

  test('getComponentDataName should return correct value', () =>
  {
    const result = getComponentDataName(componentName);
    expect(result).toBe('testComponentData');
  });

  test('getComponentPageName should return correct value', () =>
  {
    const result = getComponentPageName(componentName);
    expect(result).toBe('TestComponentPage');
  });

  test('getComponentAsCapCaseWithSpacing should return correct value', () =>
  {
    const result = getComponentAsCapCaseWithSpacing(componentName);
    expect(result).toBe('Test Component');
  });
});

describe('test text transformer', () =>
{

  test('turnPascalCaseToKebabCase should return correct value', () =>
  {
    let text = 'TestComponent';
    let result = turnPascalCaseToKebabCase(text);
    expect(result).toBe('test-component');

    text = 'HTTPResult';
    result = turnPascalCaseToKebabCase(text);

    expect(result).toBe('http-result');
  });

  test('turnPascalCaseToCamelCase should return correct value', () =>
  {
    let text = 'TestComponent';
    let result = turnPascalCaseToCamelCase(text);
    expect(result).toBe('testComponent');

    text = 'HTTPRequest';
    result = turnPascalCaseToCamelCase(text);
    expect(result).toBe('httpRequest');
  });

  test('turnPascalCaseToCapCaseWithSpacing should return correct value', () =>
  {
    let text = 'TestComponent';
    let result = turnPascalCaseToCapCaseWithSpacing(text);
    expect(result).toBe('Test Component');

    text = 'HTTPRequest';
    result = turnPascalCaseToCapCaseWithSpacing(text);
    expect(result).toBe('HTTP Request');
  });
});

describe('getTypeFullText', () =>
{
  test('getTypeFullText should return correct value with singular type', () =>
  {
    expect(getTypeFullText('o', false)).toBe('organism');
    expect(getTypeFullText('a', false)).toBe('atom');
    expect(getTypeFullText('m', false)).toBe('molecule');
  });

  test('getTypeFullText should return correct value with plural type', () =>
  {
    expect(getTypeFullText('o')).toBe('organisms');
    expect(getTypeFullText('a')).toBe('atoms');
    expect(getTypeFullText('m')).toBe('molecules');

  });
});

describe('getTemplatePath', () =>
{
  test('getTemplatePath should return correct template file path', () =>
  {
    const fileName = 'test.txt';
    jest.spyOn(path, 'resolve').mockImplementation((path) => `/fakepath/${fileName}`);

    const result = getTemplatePath(fileName);

    expect(result).toBe(`/fakepath/test.txt`);
  });
});

describe('replaceComponentTextVariants', () =>
{
  const componentName = 'ComponentTest';

  test('replaceComponentTextVariants should replace projectPrefix flags', () =>
  {
    const projectPrefix = 'xyz';

    const content = '${projectPrefix} test ${projectPrefix} ${projectPrefix}';
    const result = replaceComponentTextVariants(content, componentName, projectPrefix);

    expect(result).toBe('xyz test xyz xyz');
  });

  test('replaceComponentTextVariants should not replace projectPrefix flag when value is undefined', () =>
  {
    const content = '${projectPrefix} test ${projectPrefix}';
    const result = replaceComponentTextVariants(content, componentName);

    expect(result).toBe(content);
  });

  test('replaceComponentTextVariants should replace type flag', () =>
  {
    const type = 'o';
    const content = '${type} test ${type} test ${type}';
    const result = replaceComponentTextVariants(content, componentName, undefined, type);

    expect(result).toBe('o test o test o');
  });

  test('replaceComponentTextVariants should not replace type flag when value is undefined', () =>
  {
    const content = '${type} test ${type}';
    const result = replaceComponentTextVariants(content, componentName);

    expect(result).toBe(content);
  });

  test('replaceComponentTextVariants should replace all component name variants', () =>
  {
    const content = '${componentModelName} ${componentNameKebabCase} ${componentTemplateName} ${componentDataName} ${componentPageName} ${componentNameCamelCase} ${componentAsCapCaseWithSpacing} test ${componentModelName} ${componentNameKebabCase} ${componentTemplateName} ${componentDataName} ${componentPageName} ${componentNameCamelCase} ${componentAsCapCaseWithSpacing}';
    const result = replaceComponentTextVariants(content, componentName);

    expect(result)
      .toBe(
        'ComponentTestModel component-test ComponentTestTemplate componentTestData ComponentTestPage componentTest Component Test test ComponentTestModel component-test ComponentTestTemplate componentTestData ComponentTestPage componentTest Component Test');
  });
});

describe('replaceTemplateComments', () =>
{
  test('replaceTemplateComments should replace comment flag', () =>
  {
    const content = '<-- test comment --> After comment 1 <-- test comment 2 --> After comment 2';
    const result = replaceTemplateComments(content);

    expect(result).toBe(' After comment 1  After comment 2');
  });
});